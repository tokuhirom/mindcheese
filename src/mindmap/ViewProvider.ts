// noinspection JSUnfilteredForInLoop

import GraphCanvas from "./GraphCanvas";
import MindNode from "./MindNode";
import { KEYCODE_ENTER } from "./MindmapConstants";
import MindCheese from "./MindCheese";
import LayoutProvider, { Point } from "./LayoutProvider";

function isEmpty(s: string) {
  // TODO inlining?
  if (!s) {
    return true;
  }
  return s.replace(/\s*/, "").length == 0;
}

export function plainTextRenderer(topic: string) {
  function escapeHtml(src: string) {
    const pre = document.createElement("pre");
    const text = document.createTextNode(src);
    pre.appendChild(text);
    return pre.innerHTML;
  }

  return escapeHtml(topic).replace(/\n/g, "<br>");
}

// noinspection JSUnusedGlobalSymbols
export default class ViewProvider {
  private readonly mindCheese: MindCheese;
  private readonly layout: LayoutProvider;
  private readonly container: HTMLElement;
  mindCheeseInnerElement: HTMLDivElement; // div.mindcheese-inner
  mcnodes: HTMLElement; // <mcnodes>
  size: { w: number; h: number };
  private selectedNode: MindNode;
  private editingNode: MindNode;
  private readonly graph: GraphCanvas;
  private textAreaElement: HTMLTextAreaElement;
  private readonly renderer: (topic: string) => string;
  private readonly hMargin: number;
  private readonly vMargin: number;

  constructor(
    mindCheese: MindCheese,
    container: HTMLElement,
    hmargin = 100,
    vmargin = 50,
    graph: GraphCanvas,
    renderer = plainTextRenderer
  ) {
    this.mindCheese = mindCheese;
    this.renderer = renderer;
    this.layout = mindCheese.layout;

    this.container = container;
    this.mindCheeseInnerElement = null;
    this.mcnodes = null;

    this.size = { w: 0, h: 0 };

    this.selectedNode = null;
    this.editingNode = null;

    this.hMargin = hmargin;
    this.vMargin = vmargin;

    this.graph = graph;
  }

  init(): void {
    console.debug("view.init");

    if (!this.container) {
      console.error("the options.view.container was not be found in dom");
      return;
    }

    this.mindCheeseInnerElement = document.createElement("div");
    this.mcnodes = document.createElement("mcnodes");
    this.textAreaElement = document.createElement("textarea");

    this.mindCheeseInnerElement.className = "mindcheese-inner";
    this.mindCheeseInnerElement.appendChild(this.graph.element());
    this.mindCheeseInnerElement.appendChild(this.mcnodes);

    this.textAreaElement.className = "mindcheese-editor";
    this.textAreaElement.wrap = "off";

    this.textAreaElement.addEventListener("keydown", (e) => {
      // https://qiita.com/ledsun/items/31e43a97413dd3c8e38e
      // keyCode is deprecated field. But it's a hack for Japanese IME.
      // noinspection JSDeprecatedSymbols
      if (e.keyCode === KEYCODE_ENTER && !e.shiftKey) {
        this.editNodeEnd();
        e.stopPropagation();
      }
    });
    // adjust size dynamically.
    this.textAreaElement.addEventListener(
      "keyup",
      this.adjustEditorElementSize.bind(this)
    );
    // when the element lost focus.
    this.textAreaElement.addEventListener("blur", this.editNodeEnd.bind(this));
    this.textAreaElement.addEventListener(
      "input",
      this.adjustEditorElementSize.bind(this)
    );

    this.container.appendChild(this.mindCheeseInnerElement);
  }


  adjustEditorElementSize() {
    const el = this.textAreaElement;
    el.style.width = "";
    el.style.height = "";
    const lineHeight = 1.3;
    const fontSize = 14;
    el.style.width = `${(() => {
      const lines = el.value.split(/\n/g)
      let max = 0;
      lines.map(line => line.length).forEach(it => {
        max = Math.max(it, max)
      })
      return max * fontSize
    })()}px`;
    el.style.height = el.value.split(/\n/).length * lineHeight + "em";
    this.editingNode.data.view.width = this.textAreaElement.clientWidth;
    this.editingNode.data.view.height = this.textAreaElement.clientHeight;
    this.layout.layout();
    this.show();
  }

  getBindedNodeId(element: HTMLElement): string | null {
    if (element == null) {
      return null;
    }
    const tagName = element.tagName.toLowerCase();
    if (tagName === "mcnodes" || tagName === "body" || tagName === "html") {
      return null;
    }
    if (tagName === "mcnode" || tagName === "mcexpander") {
      return element.getAttribute("nodeid");
    } else {
      return this.getBindedNodeId(element.parentElement);
    }
  }

  isExpander(element: HTMLElement): boolean {
    return element.tagName.toLowerCase() === "mcexpander";
  }

  reset(): void {
    console.debug("view.reset");
    this.selectedNode = null;
    this.graph.clear();
    this.clearNodes();
    this.resetTheme();
  }

  resetTheme(): void {
    const themeName = this.mindCheese.options.theme;
    if (themeName) {
      this.mcnodes.className = "theme-" + themeName;
    } else {
      this.mcnodes.className = "";
    }
  }

  load(): void {
    console.debug("view.load");
    this.initNodes();
  }

  expandSize(): void {
    const minSize = this.layout.getMinSize();
    const minWidth = minSize.w + this.hMargin * 2;
    const minHeight = minSize.h + this.vMargin * 2;
    let clientW = this.mindCheeseInnerElement.clientWidth;
    let clientH = this.mindCheeseInnerElement.clientHeight;
    console.debug(`ViewProvider.expand_size:
    min_width=${minWidth}
    min_height=${minHeight}
    client_w=${clientW}
    client_h=${clientH}`);
    if (clientW < minWidth) {
      clientW = minWidth;
    }
    if (clientH < minHeight) {
      clientH = minHeight;
    }
    this.size.w = clientW;
    this.size.h = clientH;
  }

  private initNodeSize(node: MindNode): void {
    const viewData = node.data.view;
    viewData.width = viewData.element.clientWidth;
    viewData.height = viewData.element.clientHeight;
  }

  private initNodes(): void {
    const nodes = this.mindCheese.mind.nodes;
    const documentFragment: DocumentFragment =
      document.createDocumentFragment();
    for (const node of Object.values(nodes)) {
      this.createNodeElement(node, documentFragment);
    }
    this.mcnodes.appendChild(documentFragment);
    for (const node of Object.values(nodes)) {
      this.initNodeSize(node);
    }
  }

  addNode(node: MindNode): void {
    this.createNodeElement(node, this.mcnodes);
    this.initNodeSize(node);
  }

  private createNodeElement(node: MindNode, parentNode: Node): void {
    const nodeEl: HTMLElement = document.createElement("mcnode");
    if (node.isroot) {
      nodeEl.className = "root";
    } else {
      const expanderElement: HTMLElement = document.createElement("mcexpander");
      expanderElement.innerText = "-";
      expanderElement.setAttribute("nodeid", node.id);
      expanderElement.style.visibility = "hidden";
      parentNode.appendChild(expanderElement);
      node.data.view.expander = expanderElement;
    }
    if (node.topic) {
      nodeEl.innerHTML = this.renderer(node.topic);
    }
    nodeEl.setAttribute("nodeid", node.id);
    nodeEl.style.visibility = "hidden";

    parentNode.appendChild(nodeEl);
    node.data.view.element = nodeEl;
  }

  removeNode(node: MindNode): void {
    if (this.selectedNode != null && this.selectedNode.id == node.id) {
      this.selectedNode = null;
    }
    if (this.editingNode != null && this.editingNode.id == node.id) {
      node.data.view.element.removeChild(this.textAreaElement);
      this.editingNode = null;
    }
    const children = node.children;
    let i = children.length;
    while (i--) {
      this.removeNode(children[i]);
    }
    if (node.data.view) {
      const element = node.data.view.element;
      const expander = node.data.view.expander;
      this.mcnodes.removeChild(element);
      this.mcnodes.removeChild(expander);
      node.data.view.element = null;
      node.data.view.expander = null;
    }
  }

  updateNode(node: MindNode): void {
    const viewData = node.data.view;
    const element = viewData.element;
    if (node.topic) {
      element.innerHTML = this.renderer(node.topic);
    }
    viewData.width = element.clientWidth;
    viewData.height = element.clientHeight;
  }

  selectNode(node: MindNode): void {
    if (this.selectedNode) {
      const el = this.selectedNode.data.view.element;
      el.classList.remove("selected");
    }
    if (node) {
      this.selectedNode = node;
      node.data.view.element.classList.add("selected");
      this.adjustScrollBar(node);
    }
  }

  // Adjust the scroll bar. show node in the browser.
  adjustScrollBar(node: MindNode): void {
    const nodeEl = node.data.view.element;
    const panelEl = this.mindCheeseInnerElement;
    // console.debug(`select_node!
    // panelEl.scrollLeft=${panelEl.scrollLeft}
    // panelEl.clientWidth=${panelEl.clientWidth}
    // e_panel.sL+cW=${panelEl.scrollLeft+panelEl.clientWidth}
    // node.offsetLeft=${nodeEl.offsetLeft}
    // node.clientWidth=${nodeEl.clientWidth}
    // node.oL+cW=${nodeEl.offsetLeft+nodeEl.clientWidth}
    //
    // panelEl.scrollTop=${panelEl.scrollTop}
    // panelEl.clientHeight=${panelEl.clientHeight}
    // panelEl.offsetHeight=${panelEl.offsetHeight}
    // panelEl.scrollHeight=${panelEl.scrollHeight}
    // panelEl.getBoundingClientRect().top=${panelEl.getBoundingClientRect().top}
    // panelEl.getBoundingClientRect().y=${panelEl.getBoundingClientRect().y}
    // panelEl.getBoundingClientRect().height=${panelEl.getBoundingClientRect().height}
    // getComputedStyle(panelEl).height=${getComputedStyle(panelEl).height}
    // getComputedStyle(panelEl).maxHeight=${getComputedStyle(panelEl).maxHeight}
    // e_panel.sT+cH=${panelEl.scrollTop+panelEl.clientHeight}
    // node.offsetTop=${nodeEl.offsetTop}
    // node.clientHeight=${nodeEl.clientHeight}
    // node.oT+cH=${nodeEl.offsetTop+nodeEl.clientHeight}
    // `);
    if (panelEl.scrollLeft > nodeEl.offsetLeft) {
      console.debug(`select_node! left adjust`);
      panelEl.scrollLeft = Math.max(nodeEl.offsetLeft - 10, 0);
    }
    if (
      nodeEl.offsetLeft + nodeEl.clientWidth >=
      panelEl.scrollLeft + panelEl.clientWidth
    ) {
      console.debug("select_node! right adjust");
      panelEl.scrollLeft = Math.max(
        panelEl.scrollLeft +
          (nodeEl.offsetLeft +
            nodeEl.clientWidth +
            30 -
            (panelEl.scrollLeft + panelEl.clientWidth)),
        0
      );
    }
    if (panelEl.scrollTop > nodeEl.offsetTop) {
      console.debug("select_node! top adjust");
      panelEl.scrollTop = Math.max(nodeEl.offsetTop - 10, 0);
    }
    if (
      nodeEl.offsetTop + nodeEl.clientHeight >=
      panelEl.scrollTop + panelEl.clientHeight
    ) {
      console.debug("select_node! bottom adjust");
      panelEl.scrollTop = Math.max(
        panelEl.scrollTop +
          (nodeEl.offsetTop +
            nodeEl.clientHeight +
            30 -
            (panelEl.scrollTop + panelEl.clientHeight)),
        0
      );
    }
  }

  selectClear(): void {
    this.selectNode(null);
  }

  isEditing(): boolean {
    return !!this.editingNode;
  }

  editNodeBegin(node: MindNode): void {
    if (!node.topic) {
      console.warn("don't edit image nodes");
      return;
    }
    if (this.editingNode != null) {
      this.editNodeEnd();
    }
    this.editingNode = node;
    const viewData = node.data.view;
    const element: HTMLElement = viewData.element;
    const topic = node.topic;
    this.textAreaElement.value = topic;
    this.textAreaElement.style.width = "380px";
    // TODO I don't know to get the line height from element object.
    const lineHeight = 1.3;
    this.textAreaElement.style.height =
      topic.split(/\n/).length * lineHeight + "em";
    element.innerHTML = "";
    element.appendChild(this.textAreaElement);
    element.style.zIndex = "5";
    element.classList.add("editing");
    this.textAreaElement.focus();
    this.textAreaElement.select();

    setTimeout(this.adjustEditorElementSize.bind(this), 0);
  }

  editNodeEnd(): void {
    if (this.editingNode != null) {
      const node = this.editingNode;
      this.editingNode = null;
      const viewData = node.data.view;
      const element = viewData.element;
      const topic = this.textAreaElement.value;
      element.style.zIndex = "auto";
      element.classList.remove("editing");
      element.removeChild(this.textAreaElement);
      if (isEmpty(topic) || node.topic === topic) {
        element.innerHTML = this.renderer(node.topic);
        setTimeout(() => {
          viewData.width = element.clientWidth;
          viewData.height = element.clientHeight;
          this.layout.layout();
          this.show();
        }, 0);
      } else {
        this.mindCheese.updateNode(node.id, topic);
      }
    }
  }

  getViewOffset(): Point {
    const bounds = this.layout.bounds;
    const x = (this.size.w - bounds.e - bounds.w) / 2;
    const y = this.size.h / 2;
    return new Point(x, y);
  }

  // TODO remove this method?
  resize(): void {
    this.graph.setSize(1, 1);
    this.mcnodes.style.width = "1px";
    this.mcnodes.style.height = "1px";

    this.expandSize();
    this.doShow();
  }

  private doShow(): void {
    this.graph.setSize(this.size.w, this.size.h);
    this.mcnodes.style.width = this.size.w + "px";
    this.mcnodes.style.height = this.size.h + "px";
    this.showNodes();
    this.showLines();
    //this.layout.cache_valid = true;
    this.mindCheese.draggable.resize();
  }

  centerRoot(): void {
    // center root node
    const outerW = this.mindCheeseInnerElement.clientWidth;
    const outerH = this.mindCheeseInnerElement.clientHeight;
    if (this.size.w > outerW) {
      const offset = this.getViewOffset();
      this.mindCheeseInnerElement.scrollLeft = offset.x - outerW / 2;
    }
    if (this.size.h > outerH) {
      this.mindCheeseInnerElement.scrollTop = (this.size.h - outerH) / 2;
    }
  }

  show(): void {
    console.debug("view.show");
    this.expandSize();
    this.doShow();
  }

  takeLocation(node: MindNode): Point {
    const vd = node.data.view;
    return new Point(
      parseInt(vd.element.style.left) - this.mindCheeseInnerElement.scrollLeft,
      parseInt(vd.element.style.top) - this.mindCheeseInnerElement.scrollTop
    );
  }

  restoreLocation(node: MindNode, location: Point): void {
    const vd = node.data.view;
    this.mindCheeseInnerElement.scrollLeft =
      parseInt(vd.element.style.left) - location.x;
    this.mindCheeseInnerElement.scrollTop =
      parseInt(vd.element.style.top) - location.y;
  }

  clearNodes(): void {
    const mind = this.mindCheese.mind;
    if (mind == null) {
      return;
    }
    const nodes = mind.nodes;
    let node = null;
    for (const nodeid in nodes) {
      node = nodes[nodeid];
      node.data.view.element = null;
      node.data.view.expander = null;
    }
    this.mcnodes.innerHTML = "";
  }

  showNodes(): void {
    const nodes = this.mindCheese.mind.nodes;
    let node = null;
    let nodeElement = null;
    let expander = null;
    let expanderPoint = null;
    let expanderText = "-";
    let viewData = null;
    const offset = this.getViewOffset();
    for (const nodeid in nodes) {
      node = nodes[nodeid];
      viewData = node.data.view;
      nodeElement = viewData.element;
      expander = viewData.expander;
      if (!node.data.layout.visible) {
        nodeElement.style.display = "none";
        expander.style.display = "none";
        continue;
      }
      const p = this.layout.getNodePoint(node);
      viewData.absX = offset.x + p.x;
      viewData.absY = offset.y + p.y;
      nodeElement.style.left = offset.x + p.x + "px";
      nodeElement.style.top = offset.y + p.y + "px";
      nodeElement.style.display = "";
      nodeElement.style.visibility = "visible";
      if (!node.isroot && node.children.length > 0) {
        expanderText = node.expanded ? "-" : "+";
        expanderPoint = this.layout.getExpanderPoint(node);
        expander.style.left = offset.x + expanderPoint.x + "px";
        expander.style.top = offset.y + expanderPoint.y + "px";
        expander.style.display = "";
        expander.style.visibility = "visible";
        expander.innerText = expanderText;
      }
      // hide expander while all children have been removed
      if (!node.isroot && node.children.length == 0) {
        expander.style.display = "none";
        expander.style.visibility = "hidden";
      }
    }
  }

  showLines(): void {
    this.graph.clear();
    const nodes = this.mindCheese.mind.nodes;
    const offset = this.getViewOffset();
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      if (node.isroot) {
        continue;
      }
      if ("visible" in node.data.layout && !node.data.layout.visible) {
        continue;
      }
      const pin = this.layout.getNodePointIn(node);
      const pout = this.layout.getNodePointOut(node.parent);
      this.graph.drawLine(pout, pin, offset);
    }
  }
}
