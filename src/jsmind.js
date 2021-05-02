/*
 * Released under BSD License
 * Copyright (c) 2014-2016 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

/**
 * Modified by tokuhirom.
 * - replace var with let/const.
 */

"use strict";

function initJsMind(Node, Mind, NodeTree, DataProvider, GraphCanvas, ShortcutProvider, LayoutProvider,
                    ViewProvider) {
  const $w = window;
  console.log(`WTF????  Node=${Node} Mind=${require("./mindmap/Mind")}`);
  console.log(`WTF????  Node=${Node} Mind==${Object.keys(Mind)}`);
  // set 'jsMind' as the library name.
  // __name__ should be a const value, Never try to change it easily.
  const __name__ = "jsMind";
  // library version
  const __version__ = "0.4.6";
  // author
  const __author__ = "hizzgdev@163.com";

  // shortcut of methods in dom
  const $d = $w.document;

  if (typeof String.prototype.startsWith != "function") {
    String.prototype.startsWith = function (p) {
      return this.slice(0, p.length) === p;
    };
  }

  const DEFAULT_OPTIONS = {
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

  // core object
  const jm = function (options) {
    jm.current = this;

    this.version = __version__;
    const opts = {};
    jm.util.json.merge(opts, DEFAULT_OPTIONS);
    jm.util.json.merge(opts, options);

    if (!opts.container) {
      console.error("the options.container should not be null or empty.");
      return;
    }
    this.options = opts;
    this.inited = false;
    this.mind = null;
    this.event_handles = [];
    this.init();
  };

  // ============= static object =============================================
  jm.direction = { left: -1, center: 0, right: 1 };
  jm.event_type = { show: 1, resize: 2, edit: 3, select: 4 };
  jm.key = { meta: 1 << 13, ctrl: 1 << 12, alt: 1 << 11, shift: 1 << 10 };

  jm.format = { // TODO remove this
    node_tree: new NodeTree(),
  };

  // ============= utility object =============================================

  jm.util = {
    is_node: function (node) {
      return !!node && node instanceof Node;
    },
    ajax: {
      _xhr: function () {
        var xhr = null;
        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest();
        } else {
          try {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (e) {}
        }
        return xhr;
      },
      _eurl: function (url) {
        return encodeURIComponent(url);
      },
      request: function (url, param, method, callback, fail_callback) {
        var a = jm.util.ajax;
        var p = null;
        var tmp_param = [];
        for (var k in param) {
          tmp_param.push(a._eurl(k) + "=" + a._eurl(param[k]));
        }
        if (tmp_param.length > 0) {
          p = tmp_param.join("&");
        }
        var xhr = a._xhr();
        if (!xhr) {
          return;
        }
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            if (xhr.status == 200 || xhr.status == 0) {
              if (typeof callback === "function") {
                var data = jm.util.json.string2json(xhr.responseText);
                if (data != null) {
                  callback(data);
                } else {
                  callback(xhr.responseText);
                }
              }
            } else {
              if (typeof fail_callback === "function") {
                fail_callback(xhr);
              } else {
                console.error("xhr request failed.", xhr);
              }
            }
          }
        };
        method = method || "GET";
        xhr.open(method, url, true);
        xhr.setRequestHeader("If-Modified-Since", "0");
        if (method == "POST") {
          xhr.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded;charset=utf-8"
          );
          xhr.send(p);
        } else {
          xhr.send();
        }
      },
      get: function (url, callback) {
        return jm.util.ajax.request(url, {}, "GET", callback);
      },
      post: function (url, param, callback) {
        return jm.util.ajax.request(url, param, "POST", callback);
      },
    },

    dom: {
      //target,eventType,handler
      add_event: function (t, e, h) {
        if (!!t.addEventListener) {
          t.addEventListener(e, h, false);
        } else {
          t.attachEvent("on" + e, h);
        }
      },
    },

    file: {
      read: function (file_data, fn_callback) {
        var reader = new FileReader();
        reader.onload = function () {
          if (typeof fn_callback === "function") {
            fn_callback(this.result, file_data.name);
          }
        };
        reader.readAsText(file_data);
      },

      save: function (file_data, type, name) {
        var blob;
        if (typeof $w.Blob === "function") {
          blob = new Blob([file_data], { type: type });
        } else {
          var BlobBuilder =
            $w.BlobBuilder ||
            $w.MozBlobBuilder ||
            $w.WebKitBlobBuilder ||
            $w.MSBlobBuilder;
          var bb = new BlobBuilder();
          bb.append(file_data);
          blob = bb.getBlob(type);
        }
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, name);
        } else {
          var URL = $w.URL || $w.webkitURL;
          var bloburl = URL.createObjectURL(blob);
          var anchor = document.createElement("a");
          if ("download" in anchor) {
            anchor.style.visibility = "hidden";
            anchor.href = bloburl;
            anchor.download = name;
            $d.body.appendChild(anchor);
            var evt = $d.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            anchor.dispatchEvent(evt);
            $d.body.removeChild(anchor);
          } else {
            location.href = bloburl;
          }
        }
      },
    },

    json: {
      json2string: function (json) {
        if (!!JSON) {
          try {
            var json_str = JSON.stringify(json);
            return json_str;
          } catch (e) {
            console.warn(e);
            console.warn("can not convert to string");
            return null;
          }
        }
      },
      string2json: function (json_str) {
        if (!!JSON) {
          try {
            var json = JSON.parse(json_str);
            return json;
          } catch (e) {
            console.warn(e);
            console.warn("can not parse to json");
            return null;
          }
        }
      },
      merge: function (b, a) {
        for (var o in a) {
          if (o in b) {
            if (
              typeof b[o] === "object" &&
              Object.prototype.toString.call(b[o]).toLowerCase() ==
                "[object object]" &&
              !b[o].length
            ) {
              jm.util.json.merge(b[o], a[o]);
            } else {
              b[o] = a[o];
            }
          } else {
            b[o] = a[o];
          }
        }
        return b;
      },
    },

    text: {
      is_empty: function (s) {
        if (!s) {
          return true;
        }
        return s.replace(/\s*/, "").length == 0;
      },
    },
  };

  jm.prototype = {
    init: function () {
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

      jm.init_plugins(this);
    },

    enable_edit: function () {
      this.options.editable = true;
    },

    disable_edit: function () {
      this.options.editable = false;
    },

    // call enable_event_handle('dblclick')
    // options are 'mousedown', 'click', 'dblclick'
    enable_event_handle: function (event_handle) {
      this.options.default_event_handle[
        "enable_" + event_handle + "_handle"
      ] = true;
    },

    // call disable_event_handle('dblclick')
    // options are 'mousedown', 'click', 'dblclick'
    disable_event_handle: function (event_handle) {
      this.options.default_event_handle[
        "enable_" + event_handle + "_handle"
      ] = false;
    },

    get_editable: function () {
      return this.options.editable;
    },

    set_theme: function (theme) {
      var theme_old = this.options.theme;
      this.options.theme = !!theme ? theme : null;
      if (theme_old !== this.options.theme) {
        this.view.reset_theme();
        this.view.reset_custom_style();
      }
    },
    _event_bind: function () {
      this.view.add_event(this, "mousedown", this.mousedown_handle);
      this.view.add_event(this, "click", this.click_handle);
      this.view.add_event(this, "dblclick", this.dblclick_handle);
    },

    mousedown_handle: function (e) {
      if (!this.options.default_event_handle["enable_mousedown_handle"]) {
        return;
      }
      var element = e.target || event.srcElement;
      var nodeid = this.view.get_binded_nodeid(element);
      if (!!nodeid) {
        if (element.tagName.toLowerCase() === "jmnode") {
          this.select_node(nodeid);
        }
      } else {
        this.select_clear();
      }
    },

    click_handle: function (e) {
      if (!this.options.default_event_handle["enable_click_handle"]) {
        return;
      }
      var element = e.target || event.srcElement;
      var isexpander = this.view.is_expander(element);
      if (isexpander) {
        var nodeid = this.view.get_binded_nodeid(element);
        if (!!nodeid) {
          this.toggle_node(nodeid);
        }
      }
    },

    dblclick_handle: function (e) {
      if (!this.options.default_event_handle["enable_dblclick_handle"]) {
        return;
      }
      if (this.get_editable()) {
        var element = e.target || event.srcElement;
        var nodeid = this.view.get_binded_nodeid(element);
        if (!!nodeid) {
          this.begin_edit(nodeid);
        }
      }
    },

    begin_edit: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return false;
        } else {
          return this.begin_edit(the_node);
        }
      }
      if (this.get_editable()) {
        this.view.edit_node_begin(node);
      } else {
        console.error("fail, this mind map is not editable.");
        return;
      }
    },

    end_edit: function () {
      this.view.edit_node_end();
    },

    toggle_node: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return;
        } else {
          return this.toggle_node(the_node);
        }
      }
      if (node.isroot) {
        return;
      }
      this.view.save_location(node);
      this.layout.toggle_node(node);
      this.view.relayout();
      this.view.restore_location(node);
    },

    expand_node: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return;
        } else {
          return this.expand_node(the_node);
        }
      }
      if (node.isroot) {
        return;
      }
      this.view.save_location(node);
      this.layout.expand_node(node);
      this.view.relayout();
      this.view.restore_location(node);
    },

    collapse_node: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return;
        } else {
          return this.collapse_node(the_node);
        }
      }
      if (node.isroot) {
        return;
      }
      this.view.save_location(node);
      this.layout.collapse_node(node);
      this.view.relayout();
      this.view.restore_location(node);
    },

    expand_all: function () {
      this.layout.expand_all();
      this.view.relayout();
    },

    collapse_all: function () {
      this.layout.collapse_all();
      this.view.relayout();
    },

    expand_to_depth: function (depth) {
      this.layout.expand_to_depth(depth);
      this.view.relayout();
    },

    _reset: function () {
      this.view.reset();
      this.layout.reset();
    },

    _show: function (mind) {
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
    },

    show: function (mind) {
      this._reset();
      this._show(mind);
    },

    get_meta: function () {
      return {
        name: this.mind.name,
        author: this.mind.author,
        version: this.mind.version,
      };
    },

    get_data: function (data_format) {
      return this.data.get_data(data_format);
    },

    get_root: function () {
      return this.mind.root;
    },

    get_node: function (nodeid) {
      return this.mind.get_node(nodeid);
    },

    add_node: function (parent_node, nodeid, topic, data) {
      if (this.get_editable()) {
        const node = this.mind.add_node(parent_node, nodeid, topic, data);
        if (!!node) {
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
    },

    insert_node_before: function (node_before, nodeid, topic, data) {
      if (this.get_editable()) {
        var beforeid = jm.util.is_node(node_before)
          ? node_before.id
          : node_before;
        var node = this.mind.insert_node_before(
          node_before,
          nodeid,
          topic,
          data
        );
        if (!!node) {
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
    },

    insert_node_after: function (node_after, nodeid, topic, data) {
      if (this.get_editable()) {
        var afterid = jm.util.is_node(node_after) ? node_after.id : node_after;
        var node = this.mind.insert_node_after(node_after, nodeid, topic, data);
        if (!!node) {
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
    },

    remove_node: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return false;
        } else {
          return this.remove_node(the_node);
        }
      }
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
    },

    update_node: function (nodeid, topic) {
      if (this.get_editable()) {
        if (jm.util.text.is_empty(topic)) {
          console.warn("fail, topic can not be empty");
          return;
        }
        var node = this.get_node(nodeid);
        if (!!node) {
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
    },

    move_node: function (nodeid, beforeid, parentid, direction) {
      console.log(
        `jm.move_node: ${nodeid} ${beforeid} ${parentid} ${direction}`
      );
      if (this.get_editable()) {
        const node = this.mind.move_node(nodeid, beforeid, parentid, direction);
        if (!!node) {
          this.view.update_node(node);
          this.layout.layout();
          this.view.show(false);
          this.invoke_event_handle(jm.event_type.edit, {
            evt: "move_node",
            data: [nodeid, beforeid, parentid, direction],
            node: nodeid,
          });
        }
      } else {
        console.error("fail, this mind map is not editable");
        return;
      }
    },

    select_node: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return;
        } else {
          return this.select_node(the_node);
        }
      }
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
    },

    get_selected_node: function () {
      if (!!this.mind) {
        return this.mind.selected;
      } else {
        return null;
      }
    },

    select_clear: function () {
      if (!!this.mind) {
        this.mind.selected = null;
        this.view.select_clear();
      }
    },

    is_node_visible: function (node) {
      return this.layout.is_visible(node);
    },

    find_node_before: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return;
        } else {
          return this.find_node_before(the_node);
        }
      }
      if (node.isroot) {
        return null;
      }
      var n = null;
      if (node.parent.isroot) {
        var c = node.parent.children;
        var prev = null;
        var ni = null;
        for (var i = 0; i < c.length; i++) {
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
    },

    find_node_after: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          console.error("the node[id=" + node + "] can not be found.");
          return;
        } else {
          return this.find_node_after(the_node);
        }
      }
      if (node.isroot) {
        return null;
      }
      var n = null;
      if (node.parent.isroot) {
        var c = node.parent.children;
        var getthis = false;
        var ni = null;
        for (var i = 0; i < c.length; i++) {
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
    },

    set_node_color: function (nodeid, bgcolor, fgcolor) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!!bgcolor) {
            node.data["background-color"] = bgcolor;
          }
          if (!!fgcolor) {
            node.data["foreground-color"] = fgcolor;
          }
          this.view.reset_node_custom_style(node);
        }
      } else {
        console.error("fail, this mind map is not editable");
        return null;
      }
    },

    set_node_font_style: function (nodeid, size, weight, style) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!!size) {
            node.data["font-size"] = size;
          }
          if (!!weight) {
            node.data["font-weight"] = weight;
          }
          if (!!style) {
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
    },

    set_node_background_image: function (
      nodeid,
      image,
      width,
      height,
      rotation
    ) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!!image) {
            node.data["background-image"] = image;
          }
          if (!!width) {
            node.data["width"] = width;
          }
          if (!!height) {
            node.data["height"] = height;
          }
          if (!!rotation) {
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
    },

    set_node_background_rotation: function (nodeid, rotation) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
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
    },

    resize: function () {
      this.view.resize();
    },

    // callback(type ,data)
    add_event_listener: function (callback) {
      if (typeof callback === "function") {
        this.event_handles.push(callback);
      }
    },

    clear_event_listener: function () {
      this.event_handles = [];
    },

    invoke_event_handle: function (type, data) {
      var j = this;
      $w.setTimeout(function () {
        j._invoke_event_handle(type, data);
      }, 0);
    },

    _invoke_event_handle: function (type, data) {
      var l = this.event_handles.length;
      for (var i = 0; i < l; i++) {
        this.event_handles[i](type, data);
      }
    },
  };

  // ============= layout provider ===========================================



  // plugin
  jm.plugin = function (name, init) {
    this.name = name;
    this.init = init;
  };

  jm.plugins = [];

  jm.register_plugin = function (plugin) {
    if (plugin instanceof jm.plugin) {
      jm.plugins.push(plugin);
    }
  };

  jm.init_plugins = function (sender) {
    $w.setTimeout(function () {
      jm._init_plugins(sender);
    }, 0);
  };

  jm._init_plugins = function (sender) {
    var l = jm.plugins.length;
    var fn_init = null;
    for (var i = 0; i < l; i++) {
      fn_init = jm.plugins[i].init;
      if (typeof fn_init === "function") {
        fn_init(sender);
      }
    }
  };

  // quick way
  jm.show = function (options, mind) {
    var _jm = new jm(options);
    _jm.show(mind);
    return _jm;
  };

  // export jsmind
  // if (typeof module !== 'undefined' && typeof exports === 'object') {
  //     module.exports = jm;
  // } else if (typeof define === 'function' && (define.amd || define.cmd)) {
  //     define(function () { return jm; });
  // } else {
  //     $w[__name__] = jm;
  // }
  return jm;
}

module.exports = {
  initJsMind,
};
