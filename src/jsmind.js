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

function initJsMind(
  Node,
  Mind,
  NodeTree,
  DataProvider,
  GraphCanvas,
  ShortcutProvider,
  LayoutProvider,
  ViewProvider
) {
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

  // core object
  const jm = function () {};

  // ============= static object =============================================
  // jm.direction = { left: -1, center: 0, right: 1 };
  // jm.event_type = { show: 1, resize: 2, edit: 3, select: 4 };
  // jm.key = { meta: 1 << 13, ctrl: 1 << 12, alt: 1 << 11, shift: 1 << 10 };

  // jm.format = { // TODO remove this
  //   node_tree: new NodeTree(),
  // };

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
        if (t.addEventListener) {
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
        if (JSON) {
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
        if (JSON) {
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

  return jm;
}

module.exports = {
  initJsMind,
};
