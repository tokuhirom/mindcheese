import { DataProvider } from "./DataProvider";
import LayoutProvider from "../LayoutProvider";
import ViewProvider from "./ViewProvider";
import ShortcutProvider from "../ShortcutProvider";
import { Node } from "./Node";
import { Mind } from "./Mind";
import PluginManager from "./PluginManager";

const jm = {
  // TODO remove
  direction: {
    left: -1,
    center: 0,
    right: 1,
  },
  event_type: { show: 1, resize: 2, edit: 3, select: 4 },
};

function is_empty(s: string) {
  if (!s) {
    return true;
  }
  return s.replace(/\s*/, "").length == 0;
}

const DEFAULT_OPTIONS: any = {
  container: "", // id of the container
  editable: false, // you can change it in your options
  theme: null,
  mode: "full", // full or side
  support_html: true,

  view: {
    hmargin: 100,
    vmargin: 50,
    line_width: 2,
    line_color: "#555",
  },
  layout: {
    hspace: 30,
    vspace: 20,
    pspace: 13,
  },
  default_event_handle: {
    enable_mousedown_handle: true,
    enable_click_handle: true,
    enable_dblclick_handle: true,
  },
  shortcut: {
    enable: true,
    handles: {},
    mapping: {
      addchild: 45, // Insert
      addbrother: 13, // Enter
      editnode: 113, // F2
      delnode: 46, // Delete
      toggle: 32, // Space
      left: 37, // Left
      up: 38, // Up
      right: 39, // Right
      down: 40, // Down
    },
  },
};

export default class JsMind {
  private options: any;
  private inited: boolean;
  public mind: Mind;
  private event_handles: any[];
  private data: DataProvider;
  private layout: LayoutProvider;
  private view: ViewProvider;
  private shortcut: ShortcutProvider;
  private plugin_manager: PluginManager;

  constructor(options: any, pluginManager: PluginManager) {
    let opts = Object.assign({}, DEFAULT_OPTIONS);
    opts = Object.assign(opts, options);
    if (!opts.container) {
      console.error("the options.container should not be null or empty.");
      return;
    }
    this.options = opts;
    this.inited = false;
    this.mind = new Mind(); // TODO original では null が入っていた
    this.event_handles = [];
    this.plugin_manager = pluginManager;
    this.init();
  }

  init() {
    if (this.inited) {
      return;
    }
    this.inited = true;

    const opts = this.options;

    const opts_layout = {
      mode: opts.mode,
      hspace: opts.layout.hspace,
      vspace: opts.layout.vspace,
      pspace: opts.layout.pspace,
    };
    const opts_view = {
      container: opts.container,
      support_html: opts.support_html,
      hmargin: opts.view.hmargin,
      vmargin: opts.view.vmargin,
      line_width: opts.view.line_width,
      line_color: opts.view.line_color,
    };
    // create instance of function provider
    this.data = new DataProvider(this);
    this.layout = new LayoutProvider(this, opts_layout);
    this.view = new ViewProvider(this, opts_view);
    this.shortcut = new ShortcutProvider(this, opts.shortcut);

    this.layout.init();
    this.view.init();
    this.shortcut.init();

    this._event_bind();

    this.plugin_manager.init(this);
  }

  enable_edit() {
    this.options.editable = true;
  }

  disable_edit() {
    this.options.editable = false;
  }

  // call enable_event_handle('dblclick')
  // options are 'mousedown', 'click', 'dblclick'
  enable_event_handle(event_handle: any) {
    this.options.default_event_handle[
      "enable_" + event_handle + "_handle"
    ] = true;
  }

  // call disable_event_handle('dblclick')
  // options are 'mousedown', 'click', 'dblclick'
  disable_event_handle(event_handle: any) {
    this.options.default_event_handle[
      "enable_" + event_handle + "_handle"
    ] = false;
  }

  get_editable() {
    return this.options.editable;
  }

  set_theme(theme: string) {
    const theme_old = this.options.theme;
    this.options.theme = theme ? theme : null;
    if (theme_old !== this.options.theme) {
      this.view.reset_theme();
      this.view.reset_custom_style();
    }
  }

  _event_bind() {
    this.view.add_event(this, "mousedown", this.mousedown_handle.bind(this));
    this.view.add_event(this, "click", this.click_handle.bind(this));
    this.view.add_event(this, "dblclick", this.dblclick_handle.bind(this));
  }

  mousedown_handle(e: Event): void {
    if (!this.options.default_event_handle["enable_mousedown_handle"]) {
      return;
    }
    const element = e.target as HTMLElement;
    const nodeid = this.view.get_binded_nodeid(element);
    if (nodeid) {
      if (element.tagName.toLowerCase() === "jmnode") {
        const the_node = this.get_node(nodeid);
        if (!the_node) {
          console.error("the node[id=" + nodeid + "] can not be found.");
          return;
        } else {
          return this.select_node(the_node);
        }
      }
    } else {
      this.select_clear();
    }
  }

  click_handle(e: Event): void {
    if (!this.options.default_event_handle["enable_click_handle"]) {
      return;
    }
    const element = e.target as HTMLElement;
    const isexpander = this.view.is_expander(element);
    if (isexpander) {
      const nodeid = this.view.get_binded_nodeid(element);
      if (nodeid) {
        const the_node = this.get_node(nodeid);
        if (!the_node) {
          console.error("the node[id=" + nodeid + "] can not be found.");
          return;
        } else {
          return this.toggle_node(the_node);
        }
      }
    }
  }

  dblclick_handle(e: Event): void {
    if (!this.options.default_event_handle["enable_dblclick_handle"]) {
      return;
    }
    if (this.get_editable()) {
      const element = e.target;
      const nodeid = this.view.get_binded_nodeid(element);
      if (nodeid) {
        if (nodeid) {
          const the_node = this.get_node(nodeid);
          if (!the_node) {
            console.error("the node[id=" + nodeid + "] can not be found.");
            return;
          } else {
            return this.begin_edit(the_node);
          }
        }
      }
    }
  }

  begin_edit(node: Node): void {
    if (this.get_editable()) {
      this.view.edit_node_begin(node);
    } else {
      console.error("fail, this mind map is not editable.");
    }
  }

  end_edit() {
    this.view.edit_node_end();
  }

  toggle_node(node: Node): void {
    if (node.isroot) {
      return;
    }
    this.view.save_location(node);
    this.layout.toggle_node(node);
    this.view.relayout();
    this.view.restore_location(node);
  }

  expand_node(node: Node) {
    if (node.isroot) {
      return;
    }
    this.view.save_location(node);
    this.layout.expand_node(node);
    this.view.relayout();
    this.view.restore_location(node);
  }

  collapse_node(node: Node) {
    if (node.isroot) {
      return;
    }
    this.view.save_location(node);
    this.layout.collapse_node(node);
    this.view.relayout();
    this.view.restore_location(node);
  }

  expand_all() {
    this.layout.expand_all();
    this.view.relayout();
  }

  collapse_all() {
    this.layout.collapse_all();
    this.view.relayout();
  }

  expand_to_depth(depth: number) {
    this.layout.expand_to_depth(depth, null, null);
    this.view.relayout();
  }

  _reset() {
    this.view.reset();
    this.layout.reset();
  }

  _show(mind: any) {
    this.mind = this.data.load(mind);
    if (!this.mind) {
      console.error("data.load error");
      return;
    } else {
      console.debug("data.load ok");
    }

    this.view.load();
    console.debug("view.load ok");

    this.layout.layout();
    console.debug("layout.layout ok");

    this.view.show(true);
    console.debug("view.show ok");

    this.invoke_event_handle(jm.event_type.show, { data: [mind] });
  }

  show(mind: any): void {
    this._reset();
    this._show(mind);
  }

  get_meta() {
    return {
      name: this.mind.name,
      author: this.mind.author,
      version: this.mind.version,
    };
  }

  get_data(data_format: string) {
    return this.data.get_data(data_format);
  }

  get_root() {
    return this.mind.root;
  }

  get_node(nodeid: string) {
    return this.mind.get_node(nodeid);
  }

  add_node(parent_node: Node, nodeid: string, topic: string, data: any) {
    if (this.get_editable()) {
      const node = this.mind.add_node(
        parent_node,
        nodeid,
        topic,
        data,
        null,
        null,
        null
      );
      if (node) {
        this.view.add_node(node);
        this.layout.layout();
        this.view.show(false);
        this.view.reset_node_custom_style(node);
        this.expand_node(parent_node);
        this.invoke_event_handle(jm.event_type.edit, {
          evt: "add_node",
          data: [parent_node.id, nodeid, topic, data],
          node: nodeid,
        });
      }
      return node;
    } else {
      console.error("fail, this mind map is not editable");
      return null;
    }
  }

  insert_node_before(
    node_before: Node,
    nodeid: string,
    topic: string,
    data: any
  ) {
    if (this.get_editable()) {
      const beforeid = node_before.id;
      const node = this.mind.insert_node_before(
        node_before,
        nodeid,
        topic,
        data
      );
      if (node) {
        this.view.add_node(node);
        this.layout.layout();
        this.view.show(false);
        this.invoke_event_handle(jm.event_type.edit, {
          evt: "insert_node_before",
          data: [beforeid, nodeid, topic, data],
          node: nodeid,
        });
      }
      return node;
    } else {
      console.error("fail, this mind map is not editable");
      return null;
    }
  }

  insert_node_after(
    node_after: Node,
    nodeid: string,
    topic: string,
    data: any
  ) {
    if (this.get_editable()) {
      const afterid = node_after.id;
      const node = this.mind.insert_node_after(node_after, nodeid, topic, data);
      if (node) {
        this.view.add_node(node);
        this.layout.layout();
        this.view.show(false);
        this.invoke_event_handle(jm.event_type.edit, {
          evt: "insert_node_after",
          data: [afterid, nodeid, topic, data],
          node: nodeid,
        });
      }
      return node;
    } else {
      console.error("fail, this mind map is not editable");
      return null;
    }
  }

  remove_node(node: Node): boolean {
    if (this.get_editable()) {
      if (node.isroot) {
        console.error("fail, can not remove root node");
        return false;
      }
      var nodeid = node.id;
      var parentid = node.parent.id;
      var parent_node = this.get_node(parentid);
      this.view.save_location(parent_node);
      this.view.remove_node(node);
      this.mind.remove_node(node);
      this.layout.layout();
      this.view.show(false);
      this.view.restore_location(parent_node);
      this.invoke_event_handle(jm.event_type.edit, {
        evt: "remove_node",
        data: [nodeid],
        node: parentid,
      });
      return true;
    } else {
      console.error("fail, this mind map is not editable");
      return false;
    }
  }

  update_node(nodeid: string, topic: string) {
    if (this.get_editable()) {
      if (is_empty(topic)) {
        console.warn("fail, topic can not be empty");
        return;
      }
      const node = this.get_node(nodeid);
      if (node) {
        if (node.topic === topic) {
          console.info("nothing changed");
          this.view.update_node(node);
          return;
        }
        node.topic = topic;
        this.view.update_node(node);
        this.layout.layout();
        this.view.show(false);
        this.invoke_event_handle(jm.event_type.edit, {
          evt: "update_node",
          data: [nodeid, topic],
          node: nodeid,
        });
      }
    } else {
      console.error("fail, this mind map is not editable");
      return;
    }
  }

  move_node(
    nodeid: string,
    beforeid: string,
    parentid: string,
    direction: any
  ) {
    console.log(`jm.move_node: ${nodeid} ${beforeid} ${parentid} ${direction}`);
    if (this.get_editable()) {
      const the_node = this.get_node(nodeid);
      if (!the_node) {
        console.error("the node[id=" + nodeid + "] can not be found.");
        return;
      } else {
        const node = this.mind.move_node(
          the_node,
          beforeid,
          parentid,
          direction
        );
        if (node) {
          this.view.update_node(node);
          this.layout.layout();
          this.view.show(false);
          this.invoke_event_handle(jm.event_type.edit, {
            evt: "move_node",
            data: [nodeid, beforeid, parentid, direction],
            node: nodeid,
          });
        }
      }
    } else {
      console.error("fail, this mind map is not editable");
      return;
    }
  }

  select_node(node: Node) {
    if (!this.layout.is_visible(node)) {
      return;
    }
    this.mind.selected = node;
    this.view.select_node(node);
    this.invoke_event_handle(jm.event_type.select, {
      evt: "select_node",
      data: [],
      node: node.id,
    });
  }

  get_selected_node() {
    if (this.mind) {
      return this.mind.selected;
    } else {
      return null;
    }
  }

  select_clear() {
    if (this.mind) {
      this.mind.selected = null;
      this.view.select_clear();
    }
  }

  is_node_visible(node: Node) {
    return this.layout.is_visible(node);
  }

  find_node_before(node: Node) {
    if (node.isroot) {
      return null;
    }
    let n = null;
    if (node.parent.isroot) {
      const c = node.parent.children;
      let prev = null;
      let ni = null;
      for (let i = 0; i < c.length; i++) {
        ni = c[i];
        if (node.direction === ni.direction) {
          if (node.id === ni.id) {
            n = prev;
          }
          prev = ni;
        }
      }
    } else {
      n = this.mind.get_node_before(node);
    }
    return n;
  }

  find_node_after(node: Node) {
    if (node.isroot) {
      return null;
    }
    let n = null;
    if (node.parent.isroot) {
      const c = node.parent.children;
      let getthis = false;
      let ni = null;
      for (let i = 0; i < c.length; i++) {
        ni = c[i];
        if (node.direction === ni.direction) {
          if (getthis) {
            n = ni;
            break;
          }
          if (node.id === ni.id) {
            getthis = true;
          }
        }
      }
    } else {
      n = this.mind.get_node_after(node);
    }
    return n;
  }

  set_node_color(nodeid: string, bgcolor: any, fgcolor: any): void {
    if (this.get_editable()) {
      const node = this.mind.get_node(nodeid);
      if (node) {
        if (bgcolor) {
          node.data["background-color"] = bgcolor;
        }
        if (fgcolor) {
          node.data["foreground-color"] = fgcolor;
        }
        this.view.reset_node_custom_style(node);
      }
    } else {
      console.error("fail, this mind map is not editable");
    }
  }

  set_node_font_style(
    nodeid: string,
    size: any,
    weight: any,
    style: any
  ): void {
    if (this.get_editable()) {
      const node = this.mind.get_node(nodeid);
      if (node) {
        if (size) {
          node.data["font-size"] = size;
        }
        if (weight) {
          node.data["font-weight"] = weight;
        }
        if (style) {
          node.data["font-style"] = style;
        }
        this.view.reset_node_custom_style(node);
        this.view.update_node(node);
        this.layout.layout();
        this.view.show(false);
      }
    } else {
      console.error("fail, this mind map is not editable");
      return null;
    }
  }

  set_node_background_image(
    nodeid: string,
    image: any,
    width: any,
    height: number,
    rotation: any
  ): void {
    if (this.get_editable()) {
      const node = this.mind.get_node(nodeid);
      if (node) {
        if (image) {
          node.data["background-image"] = image;
        }
        if (width) {
          node.data["width"] = width;
        }
        if (height) {
          node.data["height"] = height;
        }
        if (rotation) {
          node.data["background-rotation"] = rotation;
        }
        this.view.reset_node_custom_style(node);
        this.view.update_node(node);
        this.layout.layout();
        this.view.show(false);
      }
    } else {
      console.error("fail, this mind map is not editable");
      return null;
    }
  }

  set_node_background_rotation(nodeid: string, rotation: any): void {
    if (this.get_editable()) {
      const node = this.mind.get_node(nodeid);
      if (node) {
        if (!node.data["background-image"]) {
          console.error(
            "fail, only can change rotation angle of node with background image"
          );
          return null;
        }
        node.data["background-rotation"] = rotation;
        this.view.reset_node_custom_style(node);
        this.view.update_node(node);
        this.layout.layout();
        this.view.show(false);
      }
    } else {
      console.error("fail, this mind map is not editable");
      return null;
    }
  }

  resize() {
    this.view.resize();
  }

  // callback(type ,data)
  add_event_listener(callback: any) {
    if (typeof callback === "function") {
      this.event_handles.push(callback);
    }
  }

  clear_event_listener() {
    this.event_handles = [];
  }

  invoke_event_handle(type: any, data: any) {
    const j = this;
    setTimeout(function () {
      j._invoke_event_handle(type, data);
    }, 0);
  }

  _invoke_event_handle(type: any, data: any) {
    const l = this.event_handles.length;
    for (let i = 0; i < l; i++) {
      this.event_handles[i](type, data);
    }
  }
}
