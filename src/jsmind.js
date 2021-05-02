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

function initJsMind(Node, Mind, NodeTree, DataProvider, GraphCanvas, ShortcutProvider, LayoutProvider) {
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

  // an noop function define
  const _noop = function () {};
  const logger =
    typeof console === "undefined"
      ? {
          log: _noop,
          debug: _noop,
          error: _noop,
          warn: _noop,
          info: _noop,
        }
      : console;

  // check global variables
  if (typeof module === "undefined" || !module.exports) {
    if (typeof $w[__name__] != "undefined") {
      logger.log(__name__ + " has been already exist.");
      return;
    }
  }

  // shortcut of methods in dom
  const $d = $w.document;
  const $t = function (n, t) {
    if (n.hasChildNodes()) {
      n.firstChild.nodeValue = t;
    } else {
      n.appendChild($d.createTextNode(t));
    }
  };

  const $h = function (n, t) {
    if (t instanceof HTMLElement) {
      n.innerHTML = "";
      n.appendChild(t);
    } else {
      n.innerHTML = t;
    }
  };
  // detect isElement
  const $i = function (el) {
    return (
      !!el &&
      typeof el === "object" &&
      el.nodeType === 1 &&
      typeof el.style === "object" &&
      typeof el.ownerDocument === "object"
    );
  };
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
      logger.error("the options.container should not be null or empty.");
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

  jm.format = {
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
                logger.error("xhr request failed.", xhr);
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
            logger.warn(e);
            logger.warn("can not convert to string");
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
            logger.warn(e);
            logger.warn("can not parse to json");
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
      this.view = new jm.view_provider(this, opts_view);
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
          logger.error("the node[id=" + node + "] can not be found.");
          return false;
        } else {
          return this.begin_edit(the_node);
        }
      }
      if (this.get_editable()) {
        this.view.edit_node_begin(node);
      } else {
        logger.error("fail, this mind map is not editable.");
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
          logger.error("the node[id=" + node + "] can not be found.");
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
          logger.error("the node[id=" + node + "] can not be found.");
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
          logger.error("the node[id=" + node + "] can not be found.");
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
        logger.error("data.load error");
        return;
      } else {
        logger.debug("data.load ok");
      }

      this.view.load();
      logger.debug("view.load ok");

      this.layout.layout();
      logger.debug("layout.layout ok");

      this.view.show(true);
      logger.debug("view.show ok");

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
        logger.error("fail, this mind map is not editable");
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
        logger.error("fail, this mind map is not editable");
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
        logger.error("fail, this mind map is not editable");
        return null;
      }
    },

    remove_node: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error("the node[id=" + node + "] can not be found.");
          return false;
        } else {
          return this.remove_node(the_node);
        }
      }
      if (this.get_editable()) {
        if (node.isroot) {
          logger.error("fail, can not remove root node");
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
        logger.error("fail, this mind map is not editable");
        return false;
      }
    },

    update_node: function (nodeid, topic) {
      if (this.get_editable()) {
        if (jm.util.text.is_empty(topic)) {
          logger.warn("fail, topic can not be empty");
          return;
        }
        var node = this.get_node(nodeid);
        if (!!node) {
          if (node.topic === topic) {
            logger.info("nothing changed");
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
        logger.error("fail, this mind map is not editable");
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
        logger.error("fail, this mind map is not editable");
        return;
      }
    },

    select_node: function (node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error("the node[id=" + node + "] can not be found.");
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
          logger.error("the node[id=" + node + "] can not be found.");
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
          logger.error("the node[id=" + node + "] can not be found.");
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
        logger.error("fail, this mind map is not editable");
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
        logger.error("fail, this mind map is not editable");
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
        logger.error("fail, this mind map is not editable");
        return null;
      }
    },

    set_node_background_rotation: function (nodeid, rotation) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!node.data["background-image"]) {
            logger.error(
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
        logger.error("fail, this mind map is not editable");
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


  // view provider
  jm.view_provider = function (jm, options) {
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
  };

  jm.view_provider.prototype = {
    init: function () {
      logger.debug("view.init");

      this.container = $i(this.opts.container)
        ? this.opts.container
        : document.getElementById(this.opts.container);
      if (!this.container) {
        logger.error("the options.view.container was not be found in dom");
        return;
      }
      this.e_panel = document.createElement("div");
      this.e_nodes = document.createElement("jmnodes");
      this.e_editor = document.createElement("input");

      this.graph = new GraphCanvas(this);

      this.e_panel.className = "jsmind-inner";
      this.e_panel.appendChild(this.graph.element());
      this.e_panel.appendChild(this.e_nodes);

      this.e_editor.className = "jsmind-editor";
      this.e_editor.type = "text";

      this.actualZoom = 1;
      this.zoomStep = 0.1;
      this.minZoom = 0.5;
      this.maxZoom = 2;

      var v = this;
      jm.util.dom.add_event(this.e_editor, "keydown", function (e) {
        var evt = e || event;
        if (evt.keyCode == 13) {
          v.edit_node_end();
          evt.stopPropagation();
        }
      });
      jm.util.dom.add_event(this.e_editor, "blur", function (e) {
        v.edit_node_end();
      });

      this.container.appendChild(this.e_panel);
    },

    add_event: function (obj, event_name, event_handle) {
      jm.util.dom.add_event(this.e_nodes, event_name, function (e) {
        var evt = e || event;
        event_handle.call(obj, evt);
      });
    },

    get_binded_nodeid: function (element) {
      if (element == null) {
        return null;
      }
      var tagName = element.tagName.toLowerCase();
      if (tagName == "jmnodes" || tagName == "body" || tagName == "html") {
        return null;
      }
      if (tagName == "jmnode" || tagName == "jmexpander") {
        return element.getAttribute("nodeid");
      } else {
        return this.get_binded_nodeid(element.parentElement);
      }
    },

    is_expander: function (element) {
      return element.tagName.toLowerCase() == "jmexpander";
    },

    reset: function () {
      logger.debug("view.reset");
      this.selected_node = null;
      this.clear_lines();
      this.clear_nodes();
      this.reset_theme();
    },

    reset_theme: function () {
      var theme_name = this.jm.options.theme;
      if (!!theme_name) {
        this.e_nodes.className = "theme-" + theme_name;
      } else {
        this.e_nodes.className = "";
      }
    },

    reset_custom_style: function () {
      var nodes = this.jm.mind.nodes;
      for (var nodeid in nodes) {
        this.reset_node_custom_style(nodes[nodeid]);
      }
    },

    load: function () {
      logger.debug("view.load");
      this.init_nodes();
    },

    expand_size: function () {
      var min_size = this.layout.get_min_size();
      var min_width = min_size.w + this.opts.hmargin * 2;
      var min_height = min_size.h + this.opts.vmargin * 2;
      var client_w = this.e_panel.clientWidth;
      var client_h = this.e_panel.clientHeight;
      if (client_w < min_width) {
        client_w = min_width;
      }
      if (client_h < min_height) {
        client_h = min_height;
      }
      this.size.w = client_w;
      this.size.h = client_h;
    },

    init_nodes_size: function (node) {
      var view_data = node._data.view;
      view_data.width = view_data.element.clientWidth;
      view_data.height = view_data.element.clientHeight;
    },

    init_nodes: function () {
      var nodes = this.jm.mind.nodes;
      var doc_frag = $d.createDocumentFragment();
      for (var nodeid in nodes) {
        this.create_node_element(nodes[nodeid], doc_frag);
      }
      this.e_nodes.appendChild(doc_frag);
      for (var nodeid in nodes) {
        this.init_nodes_size(nodes[nodeid]);
      }
    },

    add_node: function (node) {
      this.create_node_element(node, this.e_nodes);
      this.init_nodes_size(node);
    },

    create_node_element: function (node, parent_node) {
      var view_data = null;
      if ("view" in node._data) {
        view_data = node._data.view;
      } else {
        view_data = {};
        node._data.view = view_data;
      }

      var d = document.createElement("jmnode");
      if (node.isroot) {
        d.className = "root";
      } else {
        var d_e = document.createElement("jmexpander");
        $t(d_e, "-");
        d_e.setAttribute("nodeid", node.id);
        d_e.style.visibility = "hidden";
        parent_node.appendChild(d_e);
        view_data.expander = d_e;
      }
      if (!!node.topic) {
        if (this.opts.support_html) {
          $h(d, node.topic);
        } else {
          $t(d, node.topic);
        }
      }
      d.setAttribute("nodeid", node.id);
      d.style.visibility = "hidden";
      this._reset_node_custom_style(d, node.data);

      parent_node.appendChild(d);
      view_data.element = d;
    },

    remove_node: function (node) {
      if (this.selected_node != null && this.selected_node.id == node.id) {
        this.selected_node = null;
      }
      if (this.editing_node != null && this.editing_node.id == node.id) {
        node._data.view.element.removeChild(this.e_editor);
        this.editing_node = null;
      }
      var children = node.children;
      var i = children.length;
      while (i--) {
        this.remove_node(children[i]);
      }
      if (node._data.view) {
        var element = node._data.view.element;
        var expander = node._data.view.expander;
        this.e_nodes.removeChild(element);
        this.e_nodes.removeChild(expander);
        node._data.view.element = null;
        node._data.view.expander = null;
      }
    },

    update_node: function (node) {
      var view_data = node._data.view;
      var element = view_data.element;
      if (!!node.topic) {
        if (this.opts.support_html) {
          $h(element, node.topic);
        } else {
          $t(element, node.topic);
        }
      }
      view_data.width = element.clientWidth;
      view_data.height = element.clientHeight;
    },

    select_node: function (node) {
      if (!!this.selected_node) {
        this.selected_node._data.view.element.className = this.selected_node._data.view.element.className.replace(
          /\s*selected\b/i,
          ""
        );
        this.reset_node_custom_style(this.selected_node);
      }
      if (!!node) {
        this.selected_node = node;
        node._data.view.element.className += " selected";
        this.clear_node_custom_style(node);
      }
    },

    select_clear: function () {
      this.select_node(null);
    },

    get_editing_node: function () {
      return this.editing_node;
    },

    is_editing: function () {
      return !!this.editing_node;
    },

    edit_node_begin: function (node) {
      if (!node.topic) {
        logger.warn("don't edit image nodes");
        return;
      }
      if (this.editing_node != null) {
        this.edit_node_end();
      }
      this.editing_node = node;
      var view_data = node._data.view;
      var element = view_data.element;
      var topic = node.topic;
      var ncs = getComputedStyle(element);
      this.e_editor.value = topic;
      this.e_editor.style.width =
        element.clientWidth -
        parseInt(ncs.getPropertyValue("padding-left")) -
        parseInt(ncs.getPropertyValue("padding-right")) +
        "px";
      element.innerHTML = "";
      element.appendChild(this.e_editor);
      element.style.zIndex = 5;
      this.e_editor.focus();
      this.e_editor.select();
    },

    edit_node_end: function () {
      if (this.editing_node != null) {
        var node = this.editing_node;
        this.editing_node = null;
        var view_data = node._data.view;
        var element = view_data.element;
        var topic = this.e_editor.value;
        element.style.zIndex = "auto";
        element.removeChild(this.e_editor);
        if (jm.util.text.is_empty(topic) || node.topic === topic) {
          if (this.opts.support_html) {
            $h(element, node.topic);
          } else {
            $t(element, node.topic);
          }
        } else {
          this.jm.update_node(node.id, topic);
        }
      }
    },

    get_view_offset: function () {
      var bounds = this.layout.bounds;
      var _x = (this.size.w - bounds.e - bounds.w) / 2;
      var _y = this.size.h / 2;
      return { x: _x, y: _y };
    },

    resize: function () {
      this.graph.set_size(1, 1);
      this.e_nodes.style.width = "1px";
      this.e_nodes.style.height = "1px";

      this.expand_size();
      this._show();
    },

    _show: function () {
      this.graph.set_size(this.size.w, this.size.h);
      this.e_nodes.style.width = this.size.w + "px";
      this.e_nodes.style.height = this.size.h + "px";
      this.show_nodes();
      this.show_lines();
      //this.layout.cache_valid = true;
      this.jm.invoke_event_handle(jm.event_type.resize, { data: [] });
    },

    zoomIn: function () {
      return this.setZoom(this.actualZoom + this.zoomStep);
    },

    zoomOut: function () {
      return this.setZoom(this.actualZoom - this.zoomStep);
    },

    setZoom: function (zoom) {
      if (zoom < this.minZoom || zoom > this.maxZoom) {
        return false;
      }
      this.actualZoom = zoom;
      for (var i = 0; i < this.e_panel.children.length; i++) {
        this.e_panel.children[i].style.transform = "scale(" + zoom + ")";
      }
      this.show(true);
      return true;
    },

    _center_root: function () {
      // center root node
      var outer_w = this.e_panel.clientWidth;
      var outer_h = this.e_panel.clientHeight;
      if (this.size.w > outer_w) {
        var _offset = this.get_view_offset();
        this.e_panel.scrollLeft = _offset.x - outer_w / 2;
      }
      if (this.size.h > outer_h) {
        this.e_panel.scrollTop = (this.size.h - outer_h) / 2;
      }
    },

    show: function (keep_center) {
      logger.debug("view.show");
      this.expand_size();
      this._show();
      if (!!keep_center) {
        this._center_root();
      }
    },

    relayout: function () {
      this.expand_size();
      this._show();
    },

    save_location: function (node) {
      var vd = node._data.view;
      vd._saved_location = {
        x: parseInt(vd.element.style.left) - this.e_panel.scrollLeft,
        y: parseInt(vd.element.style.top) - this.e_panel.scrollTop,
      };
    },

    restore_location: function (node) {
      var vd = node._data.view;
      this.e_panel.scrollLeft =
        parseInt(vd.element.style.left) - vd._saved_location.x;
      this.e_panel.scrollTop =
        parseInt(vd.element.style.top) - vd._saved_location.y;
    },

    clear_nodes: function () {
      var mind = this.jm.mind;
      if (mind == null) {
        return;
      }
      var nodes = mind.nodes;
      var node = null;
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        node._data.view.element = null;
        node._data.view.expander = null;
      }
      this.e_nodes.innerHTML = "";
    },

    show_nodes: function () {
      var nodes = this.jm.mind.nodes;
      var node = null;
      var node_element = null;
      var expander = null;
      var p = null;
      var p_expander = null;
      var expander_text = "-";
      var view_data = null;
      var _offset = this.get_view_offset();
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
        p = this.layout.get_node_point(node);
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
          $t(expander, expander_text);
        }
        // hide expander while all children have been removed
        if (!node.isroot && node.children.length == 0) {
          expander.style.display = "none";
          expander.style.visibility = "hidden";
        }
      }
    },

    reset_node_custom_style: function (node) {
      this._reset_node_custom_style(node._data.view.element, node.data);
    },

    _reset_node_custom_style: function (node_element, node_data) {
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
            const img = this;
            if (c.getContext) {
              const ctx = c.getContext("2d");
              ctx.drawImage(
                img,
                2,
                2,
                node_element.clientWidth,
                node_element.clientHeight
              );
              var scaledImageData = c.toDataURL();
              node_element.style.backgroundImage =
                "url(" + scaledImageData + ")";
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
    },

    clear_node_custom_style: function (node) {
      const node_element = node._data.view.element;
      node_element.style.backgroundColor = "";
      node_element.style.color = "";
    },

    clear_lines: function () {
      this.graph.clear();
    },

    show_lines: function () {
      this.clear_lines();
      const nodes = this.jm.mind.nodes;
      let node = null;
      let pin = null;
      let pout = null;
      const _offset = this.get_view_offset();
      for (const nodeid in nodes) {
        node = nodes[nodeid];
        if (!!node.isroot) {
          continue;
        }
        if ("visible" in node._data.layout && !node._data.layout.visible) {
          continue;
        }
        pin = this.layout.get_node_point_in(node);
        pout = this.layout.get_node_point_out(node.parent);
        this.graph.draw_line(pout, pin, _offset);
      }
    },
  };


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
