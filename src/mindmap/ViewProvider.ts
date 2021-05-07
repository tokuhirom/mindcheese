// noinspection JSUnfilteredForInLoop,JSUnusedGlobalSymbols,JSUnusedGlobalSymbols

import GraphCanvas from "./GraphCanvas";
import MindNode from "./MindNode";
import { EventType, KEYCODE_ENTER } from "./MindmapConstants";
import JsMind from "./JsMind";
import LayoutProvider from "./LayoutProvider";

const $h = function (n: any, t: any) {
  // TODO inlining this
  if (t instanceof HTMLElement) {
    n.innerHTML = "";
    n.appendChild(t);
  } else {
    n.innerHTML = t;
  }
};

// detect isElemend
// TODO remove this.
function isElement(el: HTMLElement) {
  return (
    !!el &&
    typeof el === "object" &&
    el.nodeType === 1 &&
    typeof el.style === "object" &&
    typeof el.ownerDocument === "object"
  );
}

function is_empty(s: string) {
  // TODO inlining?
  if (!s) {
    return true;
  }
  return s.replace(/\s*/, "").length == 0;
}

// noinspection JSUnusedGlobalSymbols
export default class ViewProvider {
  private opts: any;
  private jm: JsMind;
  private layout: LayoutProvider;
  container: HTMLElement;
  e_panel: HTMLDivElement; // div.jsmind-inner
  e_nodes: HTMLElement; // <jmnodes>
  size: { w: number; h: number };
  private selected_node: any;
  private editing_node: any;
  private graph: any;
  private e_editor: HTMLTextAreaElement;
  private actualZoom: number;
  private zoomStep: number;
  private minZoom: number;
  private maxZoom: number;

  constructor(jm: JsMind, options: any) {
    this.opts = options;
    this.jm = jm;
    this.layout = jm.layout;

    this.container = null;
    this.e_panel = null;
    this.e_nodes = null;

    this.size = { w: 0, h: 0 };

    this.selected_node = null;
    this.editing_node = null;

    this.graph = null;
  }

  init(): void {
    console.debug("view.init");

    this.container = isElement(this.opts.container)
      ? this.opts.container
      : document.getElementById(this.opts.container);
    if (!this.container) {
      console.error("the options.view.container was not be found in dom");
      return;
    }
    this.e_panel = document.createElement("div");
    this.e_nodes = document.createElement("jmnodes");
    this.e_editor = document.createElement("textarea");

    this.graph = new GraphCanvas(this);

    this.e_panel.className = "jsmind-inner";
    this.e_panel.appendChild(this.graph.element());
    this.e_panel.appendChild(this.e_nodes);

    this.e_editor.className = "jsmind-editor";

    this.actualZoom = 1;
    this.zoomStep = 0.1;
    this.minZoom = 0.5;
    this.maxZoom = 2;

    this.e_editor.addEventListener("keydown", (e) => {
      // https://qiita.com/ledsun/items/31e43a97413dd3c8e38e
      // keyCode is deprecated field. But it's a hack for Japanese IME.
      if (e.keyCode === KEYCODE_ENTER && !e.shiftKey) {
        this.edit_node_end();
        e.stopPropagation();
      }
    });
    this.e_editor.addEventListener("keyup", () => {
      // adjust size dynamically.
      this.adjustEditorElementSize();
    });
    this.e_editor.addEventListener("blur", () => {
      // when the element lost focus.
      this.edit_node_end();
    });
    this.e_editor.addEventListener("input", () => {
      console.log("textarea.oninput");
      this.adjustEditorElementSize();
      return false;
    });

    this.container.appendChild(this.e_panel);
  }

  adjustEditorElementSize() {
    const el = this.e_editor;
    el.style.width = "";
    el.style.height = "";
    el.style.width = el.scrollWidth + "px";
    el.style.height = el.scrollHeight + "px";
    this.editing_node._data.view.width = this.e_editor.clientWidth;
    this.editing_node._data.view.height = this.e_editor.clientHeight;
    this.layout.layout();
    this.show(false);
  }

  setTextToElement(element: HTMLElement, topic: string): void {
    element.innerHTML = ViewProvider.escapeHTML(topic).replace(/\n/g, "<br>");
  }

  private static escapeHTML(src: string) {
    const pre = document.createElement("pre");
    const text = document.createTextNode(src);
    pre.appendChild(text);
    return pre.innerHTML;
  }

  get_binded_nodeid(element: HTMLElement): string | null {
    if (element == null) {
      return null;
    }
    const tagName = element.tagName.toLowerCase();
    if (tagName === "jmnodes" || tagName === "body" || tagName === "html") {
      return null;
    }
    if (tagName === "jmnode" || tagName === "jmexpander") {
      return element.getAttribute("nodeid");
    } else {
      return this.get_binded_nodeid(element.parentElement);
    }
  }

  is_expander(element: HTMLElement): boolean {
    return element.tagName.toLowerCase() === "jmexpander";
  }

  reset(): void {
    console.debug("view.reset");
    this.selected_node = null;
    this.clear_lines();
    this.clear_nodes();
    this.reset_theme();
  }

  reset_theme(): void {
    const theme_name = this.jm.options.theme;
    if (theme_name) {
      this.e_nodes.className = "theme-" + theme_name;
    } else {
      this.e_nodes.className = "";
    }
  }

  reset_custom_style(): void {
    const nodes = this.jm.mind.nodes;
    for (const nodeid in nodes) {
      this.reset_node_custom_style(nodes[nodeid]);
    }
  }

  load(): void {
    console.debug("view.load");
    this.init_nodes();
  }

  expand_size(): void {
    const min_size = this.layout.get_min_size();
    const min_width = min_size.w + this.opts.hmargin * 2;
    const min_height = min_size.h + this.opts.vmargin * 2;
    let client_w = this.e_panel.clientWidth;
    let client_h = this.e_panel.clientHeight;
    console.debug(`ViewProvider.expand_size:
    min_width=${min_width}
    min_height=${min_height}
    client_w=${client_w}
    client_h=${client_h}`);
    if (client_w < min_width) {
      client_w = min_width;
    }
    if (client_h < min_height) {
      client_h = min_height;
    }
    this.size.w = client_w;
    this.size.h = client_h;
  }

  init_nodes_size(node: MindNode): void {
    const view_data = node._data.view;
    view_data.width = view_data.element.clientWidth;
    view_data.height = view_data.element.clientHeight;
  }

  init_nodes(): void {
    const nodes = this.jm.mind.nodes;
    const doc_frag: DocumentFragment = document.createDocumentFragment();
    for (const nodeid in nodes) {
      this.create_node_element(nodes[nodeid], doc_frag);
    }
    this.e_nodes.appendChild(doc_frag);
    for (const nodeid in nodes) {
      this.init_nodes_size(nodes[nodeid]);
    }
  }

  add_node(node: MindNode): void {
    this.create_node_element(node, this.e_nodes);
    this.init_nodes_size(node);
  }

  create_node_element(node: MindNode, parent_node: Node): void {
    const view_data = node._data.view;

    const d: HTMLElement = document.createElement("jmnode");
    if (node.isroot) {
      d.className = "root";
    } else {
      const d_e: HTMLElement = document.createElement("jmexpander");
      this.setTextToElement(d_e, "-");
      d_e.setAttribute("nodeid", node.id);
      d_e.style.visibility = "hidden";
      parent_node.appendChild(d_e);
      view_data.expander = d_e;
    }
    if (node.topic) {
      if (this.opts.support_html) {
        $h(d, node.topic);
      } else {
        this.setTextToElement(d, node.topic);
      }
    }
    d.setAttribute("nodeid", node.id);
    d.style.visibility = "hidden";
    this._reset_node_custom_style(d, node.data);

    parent_node.appendChild(d);
    view_data.element = d;
  }

  remove_node(node: MindNode): void {
    if (this.selected_node != null && this.selected_node.id == node.id) {
      this.selected_node = null;
    }
    if (this.editing_node != null && this.editing_node.id == node.id) {
      node._data.view.element.removeChild(this.e_editor);
      this.editing_node = null;
    }
    const children = node.children;
    let i = children.length;
    while (i--) {
      this.remove_node(children[i]);
    }
    if (node._data.view) {
      const element = node._data.view.element;
      const expander = node._data.view.expander;
      this.e_nodes.removeChild(element);
      this.e_nodes.removeChild(expander);
      node._data.view.element = null;
      node._data.view.expander = null;
    }
  }

  update_node(node: MindNode): void {
    const view_data = node._data.view;
    const element = view_data.element;
    if (node.topic) {
      if (this.opts.support_html) {
        $h(element, node.topic);
      } else {
        this.setTextToElement(element, node.topic);
      }
    }
    view_data.width = element.clientWidth;
    view_data.height = element.clientHeight;
  }

  select_node(node: MindNode): void {
    if (this.selected_node) {
      this.selected_node._data.view.element.className = this.selected_node._data.view.element.className.replace(
        /\s*selected\b/i,
        ""
      );
      this.reset_node_custom_style(this.selected_node);
    }
    if (node) {
      this.selected_node = node;
      node._data.view.element.className += " selected";
      this.clear_node_custom_style(node);
    }
  }

  select_clear(): void {
    this.select_node(null);
  }

  is_editing(): boolean {
    return !!this.editing_node;
  }

  edit_node_begin(node: MindNode): void {
    if (!node.topic) {
      console.warn("don't edit image nodes");
      return;
    }
    if (this.editing_node != null) {
      this.edit_node_end();
    }
    this.editing_node = node;
    const view_data = node._data.view;
    const element: HTMLElement = view_data.element;
    const topic = node.topic;
    this.e_editor.value = topic;
    this.e_editor.style.width = "380px";
    this.e_editor.style.height = topic.split(/\n/).length + "em";
    element.innerHTML = "";
    element.appendChild(this.e_editor);
    element.style.zIndex = "5";
    this.e_editor.focus();
    this.e_editor.select();

    setTimeout(this.adjustEditorElementSize.bind(this), 0);
  }

  edit_node_end(): void {
    if (this.editing_node != null) {
      const node = this.editing_node;
      this.editing_node = null;
      const view_data = node._data.view;
      const element = view_data.element;
      const topic = this.e_editor.value;
      element.style.zIndex = "auto";
      element.removeChild(this.e_editor);
      if (is_empty(topic) || node.topic === topic) {
        if (this.opts.support_html) {
          $h(element, node.topic);
        } else {
          this.setTextToElement(element, node.topic);
        }
        setTimeout(() => {
          view_data.width = element.clientWidth;
          view_data.height = element.clientHeight;
          this.layout.layout();
          this.show(false);
        }, 0);
      } else {
        this.jm.update_node(node.id, topic);
      }
    }
  }

  get_view_offset(): { x: number; y: number } {
    const bounds = this.layout.bounds;
    const _x = (this.size.w - bounds.e - bounds.w) / 2;
    const _y = this.size.h / 2;
    return { x: _x, y: _y };
  }

  resize(): void {
    this.graph.set_size(1, 1);
    this.e_nodes.style.width = "1px";
    this.e_nodes.style.height = "1px";

    this.expand_size();
    this._show();
  }

  _show(): void {
    this.graph.set_size(this.size.w, this.size.h);
    this.e_nodes.style.width = this.size.w + "px";
    this.e_nodes.style.height = this.size.h + "px";
    this.show_nodes();
    this.show_lines();
    //this.layout.cache_valid = true;
    this.jm.invoke_event_handle(EventType.RESIZE, { data: [] });
    this.jm.draggable.resize();
  }

  zoomIn(): boolean {
    return this.setZoom(this.actualZoom + this.zoomStep);
  }

  zoomOut(): boolean {
    return this.setZoom(this.actualZoom - this.zoomStep);
  }

  setZoom(zoom: number): boolean {
    if (zoom < this.minZoom || zoom > this.maxZoom) {
      return false;
    }
    this.actualZoom = zoom;
    for (let i = 0; i < this.e_panel.children.length; i++) {
      (this.e_panel.children[i] as HTMLElement).style.transform =
        "scale(" + zoom + ")";
    }
    this.show(true);
    return true;
  }

  _center_root(): void {
    // center root node
    const outer_w = this.e_panel.clientWidth;
    const outer_h = this.e_panel.clientHeight;
    if (this.size.w > outer_w) {
      const _offset = this.get_view_offset();
      this.e_panel.scrollLeft = _offset.x - outer_w / 2;
    }
    if (this.size.h > outer_h) {
      this.e_panel.scrollTop = (this.size.h - outer_h) / 2;
    }
  }

  show(keep_center: boolean): void {
    console.debug("view.show");
    this.expand_size();
    this._show();
    if (keep_center) {
      this._center_root();
    }
  }

  relayout(): void {
    this.expand_size();
    this._show();
  }

  save_location(node: MindNode): void {
    const vd = node._data.view;
    vd._saved_location = {
      x: parseInt(vd.element.style.left) - this.e_panel.scrollLeft,
      y: parseInt(vd.element.style.top) - this.e_panel.scrollTop,
    };
  }

  restore_location(node: MindNode): void {
    const vd = node._data.view;
    this.e_panel.scrollLeft =
      parseInt(vd.element.style.left) - vd._saved_location.x;
    this.e_panel.scrollTop =
      parseInt(vd.element.style.top) - vd._saved_location.y;
  }

  clear_nodes(): void {
    const mind = this.jm.mind;
    if (mind == null) {
      return;
    }
    const nodes = mind.nodes;
    let node = null;
    for (const nodeid in nodes) {
      node = nodes[nodeid];
      node._data.view.element = null;
      node._data.view.expander = null;
    }
    this.e_nodes.innerHTML = "";
  }

  show_nodes(): void {
    const nodes = this.jm.mind.nodes;
    let node = null;
    let node_element = null;
    let expander = null;
    let p_expander = null;
    let expander_text = "-";
    let view_data = null;
    const _offset = this.get_view_offset();
    for (const nodeid in nodes) {
      node = nodes[nodeid];
      view_data = node._data.view;
      node_element = view_data.element;
      expander = view_data.expander;
      if (!this.layout.is_visible(node)) {
        node_element.style.display = "none";
        expander.style.display = "none";
        continue;
      }
      this.reset_node_custom_style(node);
      const p = this.layout.get_node_point(node);
      view_data.abs_x = _offset.x + p.x;
      view_data.abs_y = _offset.y + p.y;
      node_element.style.left = _offset.x + p.x + "px";
      node_element.style.top = _offset.y + p.y + "px";
      node_element.style.display = "";
      node_element.style.visibility = "visible";
      if (!node.isroot && node.children.length > 0) {
        expander_text = node.expanded ? "-" : "+";
        p_expander = this.layout.get_expander_point(node);
        expander.style.left = _offset.x + p_expander.x + "px";
        expander.style.top = _offset.y + p_expander.y + "px";
        expander.style.display = "";
        expander.style.visibility = "visible";
        this.setTextToElement(expander, expander_text);
      }
      // hide expander while all children have been removed
      if (!node.isroot && node.children.length == 0) {
        expander.style.display = "none";
        expander.style.visibility = "hidden";
      }
    }
  }

  reset_node_custom_style(node: MindNode): void {
    this._reset_node_custom_style(node._data.view.element, node.data);
  }

  _reset_node_custom_style(node_element: HTMLElement, node_data: any): void {
    if ("background-color" in node_data) {
      node_element.style.backgroundColor = node_data["background-color"];
    }
    if ("foreground-color" in node_data) {
      node_element.style.color = node_data["foreground-color"];
    }
    if ("width" in node_data) {
      node_element.style.width = node_data["width"] + "px";
    }
    if ("height" in node_data) {
      node_element.style.height = node_data["height"] + "px";
    }
    if ("font-size" in node_data) {
      node_element.style.fontSize = node_data["font-size"] + "px";
    }
    if ("font-weight" in node_data) {
      node_element.style.fontWeight = node_data["font-weight"];
    }
    if ("font-style" in node_data) {
      node_element.style.fontStyle = node_data["font-style"];
    }
    if ("background-image" in node_data) {
      const backgroundImage = node_data["background-image"];
      if (
        backgroundImage.startsWith("data") &&
        node_data["width"] &&
        node_data["height"]
      ) {
        const img = new Image();

        img.onload = function () {
          const c = document.createElement("canvas");
          c.width = node_element.clientWidth;
          c.height = node_element.clientHeight;
          if (c.getContext) {
            const ctx: CanvasRenderingContext2D = c.getContext("2d");
            ctx.drawImage(
              img as HTMLImageElement,
              2,
              2,
              node_element.clientWidth,
              node_element.clientHeight
            );
            const scaledImageData = c.toDataURL();
            node_element.style.backgroundImage = "url(" + scaledImageData + ")";
          }
        };
        img.src = backgroundImage;
      } else {
        node_element.style.backgroundImage = "url(" + backgroundImage + ")";
      }
      node_element.style.backgroundSize = "99%";

      if ("background-rotation" in node_data) {
        node_element.style.transform =
          "rotate(" + node_data["background-rotation"] + "deg)";
      }
    }
  }

  clear_node_custom_style(node: MindNode): void {
    const node_element = node._data.view.element;
    node_element.style.backgroundColor = "";
    node_element.style.color = "";
  }

  clear_lines(): void {
    this.graph.clear();
  }

  show_lines(): void {
    this.clear_lines();
    const nodes = this.jm.mind.nodes;
    let node = null;
    let pin = null;
    let pout = null;
    const _offset = this.get_view_offset();
    for (const nodeid in nodes) {
      node = nodes[nodeid];
      if (node.isroot) {
        continue;
      }
      if ("visible" in node._data.layout && !node._data.layout.visible) {
        continue;
      }
      pin = this.layout.get_node_point_in(node);
      pout = this.layout.get_node_point_out(node.parent);
      this.graph.draw_line(pout, pin, _offset);
    }
  }
}
