(function (b, c) {
  typeof exports == "object" && typeof module < "u"
    ? c(exports)
    : typeof define == "function" && define.amd
      ? define(["exports"], c)
      : ((b = typeof globalThis < "u" ? globalThis : b || self),
        c((b.mindcheese = {})));
})(this, function (b) {
  "use strict";
  var c = ((o) => (
      (o[(o.LEFT = -1)] = "LEFT"),
      (o[(o.CENTER = 0)] = "CENTER"),
      (o[(o.RIGHT = 1)] = "RIGHT"),
      o
    ))(c || {}),
    g = ((o) => ((o[(o.AfterEdit = 1)] = "AfterEdit"), o))(g || {});
  const F = "_first_",
    z = "_last_";
  var f = ((o) => (
    (o[(o.NONE = 0)] = "NONE"),
    (o[(o.META = 2)] = "META"),
    (o[(o.CTRL = 4)] = "CTRL"),
    (o[(o.ALT = 8)] = "ALT"),
    (o[(o.SHIFT = 16)] = "SHIFT"),
    o
  ))(f || {});
  const B = 13,
    Z = 27;
  class q {
    constructor(e, t, i) {
      (this.mindCheese = e),
        (this.enable = t),
        (this.mappings = this.compileHandlers(i));
    }
    bindKeyEvents() {
      document.addEventListener("keydown", this.handler.bind(this));
    }
    enableShortcut() {
      this.enable = !0;
    }
    disableShortcut() {
      this.enable = !1;
    }
    handler(e) {
      if (
        (e.which == 9 && e.preventDefault(),
        this.mindCheese.wrapperView.isEditing() || !this.enable)
      )
        return !0;
      console.debug(`ShortcutProvider.handler: ${e.code}`);
      const t = this.mappings[e.code];
      if (!t) return !0;
      const i =
        (e.metaKey ? f.META : 0) |
        (e.ctrlKey ? f.CTRL : 0) |
        (e.altKey ? f.ALT : 0) |
        (e.shiftKey ? f.SHIFT : 0);
      for (const s of t) {
        const [n, r] = s;
        if (n === i) return r(this.mindCheese, e);
      }
      return !0;
    }
    compileHandlers(e) {
      const t = {};
      return (
        e.forEach((i) => {
          const [s, n, r] = i;
          t[n] || (t[n] = []), t[n].push([s, r]);
        }),
        t
      );
    }
  }
  class Q {
    constructor() {
      (this.element = null),
        (this.adder = null),
        (this.elementSizeCache = null),
        (this.elementTopLeft = null);
    }
  }
  class J {
    constructor(e) {
      (this.data = e), (this.index = 0);
    }
    take() {
      const e = this.data[this.index++];
      return this.index == this.data.length && (this.index = 0), e;
    }
  }
  const ee = new J([
    "#cc0000",
    "#00cc00",
    "#0000cc",
    "#00cccc",
    "#cc00cc",
    "#cccc00",
  ]);
  class S {
    constructor(e, t, i, s, n, r) {
      if (!e) throw new Error("invalid nodeid");
      (this.id = e),
        (this.index = t),
        (this.topic = i),
        (this.isroot = s),
        (this.parent = n),
        (this.direction = r),
        (this.children = []),
        (this.viewData = new Q()),
        n
          ? n && n.color
            ? (this.color = n.color)
            : (this.color = ee.take())
          : (this.color = null);
    }
    static compare(e, t) {
      let i;
      const s = e.index,
        n = t.index;
      return (
        s >= 0 && n >= 0
          ? (i = s - n)
          : s === -1 && n === -1
            ? (i = 0)
            : s === -1
              ? (i = 1)
              : n === -1
                ? (i = -1)
                : (i = 0),
        i
      );
    }
    static inherited(e, t) {
      if (e && t) {
        if (e.id === t.id || e.isroot) return !0;
        const i = e.id;
        let s = t;
        for (; !s.isroot; ) if (((s = s.parent), s.id === i)) return !0;
      }
      return !1;
    }
    toObject() {
      const e = {
        id: this.id,
        topic: this.topic,
        children: this.children.map((t) => t.toObject()),
      };
      return (
        this.parent &&
          this.parent.isroot &&
          (e.direction = this.direction == c.LEFT ? "left" : "right"),
        e
      );
    }
    applyColor(e) {
      this.color = e;
      for (let t = 0, i = this.children.length; t < i; t++)
        this.children[t].applyColor(e);
    }
  }
  class P {
    constructor() {
      (this.root = null), (this.selected = null), (this.nodes = {});
    }
    getNodeById(e) {
      if (e in this.nodes) return this.nodes[e];
      throw new Error(`the node[id=${e}] can not be found...`);
    }
    setRoot(e, t) {
      if (this.root != null) throw new Error("root node is already exist");
      (this.root = new S(e, 0, t, !0, null, c.CENTER)), this.putNode(this.root);
    }
    addNode(e, t, i, s, n) {
      const r = s || -1;
      let h;
      if (e.isroot) {
        let l;
        if (n == null) {
          const a = e.children,
            d = a.length;
          let u = 0;
          for (let w = 0; w < d; w++) a[w].direction === c.LEFT ? u-- : u++;
          l = d > 1 && u > 0 ? c.LEFT : c.RIGHT;
        } else l = n === c.LEFT ? c.LEFT : c.RIGHT;
        h = new S(t, r, i, !1, e, l);
      } else h = new S(t, r, i, !1, e, e.direction);
      return this.putNode(h), e.children.push(h), this.reindex(e), h;
    }
    getNodeBefore(e) {
      if (e.isroot) return null;
      const t = e.index - 2;
      return t >= 0 ? e.parent.children[t] : null;
    }
    insertNodeAfter(e, t, i) {
      const s = e.index + 0.5;
      return this.addNode(e.parent, t, i, s, e.direction);
    }
    getNodeAfter(e) {
      if (e.isroot) return null;
      const t = e.index;
      return e.parent.children.length >= t ? e.parent.children[t] : null;
    }
    moveNode(e, t, i, s) {
      console.log(`move_node: ${e} ${t} ${i.id} ${s}`),
        this.doMoveNode(e, t, i, s),
        i.color && e.color != i.color && e.applyColor(i.color);
    }
    flowNodeDirection(e, t) {
      typeof t > "u" ? (t = e.direction) : (e.direction = t);
      let i = e.children.length;
      for (; i--; ) this.flowNodeDirection(e.children[i], t);
    }
    moveNodeInternal(e, t) {
      if (e && t)
        if (t === z) (e.index = -1), this.reindex(e.parent);
        else if (t === F) (e.index = 0), this.reindex(e.parent);
        else {
          const i = t ? this.getNodeById(t) : null;
          i != null && i.parent != null && i.parent.id === e.parent.id
            ? ((e.index = i.index - 0.5), this.reindex(e.parent))
            : console.error(`Missing node_before: ${t}`);
        }
      return e;
    }
    doMoveNode(e, t, i, s) {
      if (
        (console.log(`_move_node: node=${e}, ${t}, parentid=${i.id}, ${s}`),
        e && i.id)
      ) {
        if (
          (console.assert(e.parent, `node.parent is null: ${e}`),
          e.parent.id !== i.id)
        ) {
          console.log("_move_node: node.parent.id!==parentid");
          const n = e.parent.children;
          let r = n.length;
          for (; r--; )
            if (
              (console.assert(n[r], "sibling[si] is null"), n[r].id === e.id)
            ) {
              n.splice(r, 1);
              break;
            }
          (e.parent = this.getNodeById(i.id)), e.parent.children.push(e);
        }
        e.parent.isroot
          ? (e.direction = s)
          : (e.direction = e.parent.direction),
          this.moveNodeInternal(e, t),
          this.flowNodeDirection(e, s);
      }
    }
    removeNode(e) {
      if (e.isroot) throw new Error("fail, can not remove root node");
      this.selected != null &&
        this.selected.id === e.id &&
        (this.selected = null);
      const t = e.children;
      let i = t.length;
      for (; i--; ) this.removeNode(t[i]);
      t.length = 0;
      const s = e.parent.children;
      let n = s.length;
      for (; n--; )
        if (s[n].id === e.id) {
          s.splice(n, 1);
          break;
        }
      return delete this.nodes[e.id], !0;
    }
    putNode(e) {
      if (e.id in this.nodes)
        throw new Error("the nodeid '" + e.id + "' has been already exist.");
      this.nodes[e.id] = e;
    }
    reindex(e) {
      e.children.sort(S.compare);
      for (let t = 0; t < e.children.length; t++) e.children[t].index = t + 1;
    }
  }
  function W(o) {
    let e = o;
    for (; e; ) {
      if (e.tagName.toLowerCase() == "mcnode") return e;
      e = e.parentElement;
    }
    return null;
  }
  class x {
    constructor(e, t) {
      (this.x = e), (this.y = t);
    }
  }
  function j(o) {
    if (o instanceof MouseEvent) return o;
    if (o instanceof TouchEvent) return o.touches[0];
    throw new Error("Unknown event type");
  }
  class te {
    constructor(e, t, i, s) {
      (this.node = e), (this.direction = t), (this.sp = i), (this.np = s);
    }
  }
  class D {
    constructor(e) {
      (this.clientHW = 0),
        (this.clientHH = 0),
        (this.lineWidth = 5),
        (this.lookupDelay = 500),
        (this.lookupInterval = 80),
        (this.mindCheese = e),
        (this.canvasElement = D.createCanvas()),
        this.mindCheese.wrapperView.appendChild(this.canvasElement),
        (this.canvasContext = this.canvasElement.getContext("2d")),
        (this.shadow = D.createShadow()),
        (this.shadowW = 0),
        (this.shadowH = 0),
        (this.activeNode = null),
        (this.targetNode = null),
        (this.targetDirect = null),
        (this.clientW = 0),
        (this.clientH = 0),
        (this.offsetX = 0),
        (this.offsetY = 0),
        (this.hlookupDelay = 0),
        (this.hlookupTimer = 0),
        (this.capture = !1),
        (this.moved = !1);
    }
    resize(e, t) {
      this.mindCheese.wrapperView.nodesView.appendChild(this.shadow),
        (this.canvasElement.width = e),
        (this.canvasElement.height = t);
    }
    static createCanvas() {
      const e = document.createElement("canvas");
      return (e.className = "mindcheese-draggable-graph"), e;
    }
    static createShadow() {
      const e = document.createElement("mcnode");
      return (
        (e.style.visibility = "hidden"),
        (e.style.zIndex = "3"),
        (e.style.cursor = "move"),
        (e.style.opacity = "0.7"),
        e
      );
    }
    resetShadow(e) {
      const t = this.shadow.style;
      (this.shadow.innerHTML = e.innerHTML),
        (t.left = e.style.left),
        (t.top = e.style.top),
        (t.width = e.style.width),
        (t.height = e.style.height),
        (t.backgroundImage = e.style.backgroundImage),
        (t.backgroundSize = e.style.backgroundSize),
        (t.transform = e.style.transform),
        (this.shadowW = this.shadow.clientWidth),
        (this.shadowH = this.shadow.clientHeight);
    }
    showShadow() {
      this.moved || (this.shadow.style.visibility = "visible");
    }
    hideShadow() {
      this.shadow.style.visibility = "hidden";
    }
    magnetShadow(e, t) {
      (this.canvasContext.lineWidth = this.lineWidth),
        (this.canvasContext.strokeStyle = "rgba(0,0,0,0.3)"),
        (this.canvasContext.lineCap = "round"),
        this.clearLines(),
        this.canvasLineTo(e.x, e.y, t.x, t.y);
    }
    clearLines() {
      this.canvasContext.clearRect(
        0,
        0,
        this.mindCheese.wrapperView.size.width,
        this.mindCheese.wrapperView.size.height,
      );
    }
    canvasLineTo(e, t, i, s) {
      this.canvasContext.beginPath(),
        this.canvasContext.moveTo(e, t),
        this.canvasContext.bezierCurveTo(e + ((i - e) * 2) / 3, t, e, s, i, s),
        this.canvasContext.stroke();
    }
    doLookupCloseNode() {
      const e = this.mindCheese.mind.root,
        t = e.viewData.elementTopLeft,
        i = e.viewData.elementSizeCache,
        s = t.x + i.width / 2,
        n = this.shadowW,
        r = this.shadowH,
        h = this.shadow.offsetLeft,
        l = this.shadow.offsetTop,
        a = h + n / 2 >= s ? c.RIGHT : c.LEFT,
        d = this.mindCheese.mind.nodes;
      let u = Number.MAX_VALUE,
        w = null,
        y = null,
        T = null;
      for (const ve in d) {
        let I, A;
        const E = d[ve];
        let k = 0;
        if (E.isroot || E.direction == a) {
          if (E.id == this.activeNode.id) continue;
          const v = E.viewData.elementSizeCache,
            m = E.viewData.elementTopLeft;
          if (a == c.RIGHT) {
            if (h - m.x - v.width <= 0) continue;
            (k =
              Math.abs(h - m.x - v.width) +
              Math.abs(l + r / 2 - m.y - v.height / 2)),
              (I = new x(
                m.x + v.width - this.lineWidth,
                m.y + (E.isroot ? v.height / 2 : v.height),
              )),
              (A = new x(h + this.lineWidth, l + r));
          } else {
            if (m.x - h - n <= 0) continue;
            (k =
              Math.abs(h + n - m.x) + Math.abs(l + r / 2 - m.y - v.height / 2)),
              (I = new x(
                m.x + this.lineWidth,
                m.y + (E.isroot ? v.height / 2 : v.height),
              )),
              (A = new x(h + n - this.lineWidth, l + r));
          }
          k < u && ((w = E), (y = I), (T = A), (u = k));
        }
      }
      return w ? new te(w, a, T, y) : null;
    }
    lookupCloseNode() {
      const e = this.doLookupCloseNode();
      e &&
        (this.magnetShadow(e.sp, e.np),
        (this.targetNode = e.node),
        (this.targetDirect = e.direction));
    }
    eventBind(e) {
      e.addEventListener("mousedown", this.dragstart.bind(this), !1),
        e.addEventListener("mousemove", this.drag.bind(this), !1),
        e.addEventListener("mouseup", this.dragend.bind(this), !1);
      {
        let t = 0;
        e.addEventListener(
          "touchstart",
          (i) => {
            t
              ? this.mindCheese.wrapperView.nodesView.dblclickHandle(i)
              : (++t,
                this.dragstart(i),
                setTimeout(function () {
                  t = 0;
                }, 350));
          },
          { passive: !0 },
        );
      }
      e.addEventListener("touchmove", this.drag.bind(this), { passive: !0 }),
        e.addEventListener("touchend", this.dragend.bind(this), !1);
    }
    dragstart(e) {
      if (!this.mindCheese.isEditable() || this.capture) return;
      this.activeNode = null;
      const t = this.mindCheese.wrapperView,
        i = W(e.target);
      if (!i) return;
      const s = t.getBindedNodeId(i);
      if (s) {
        const n = this.mindCheese.mind.getNodeById(s);
        if (!n.isroot) {
          this.resetShadow(i), (this.activeNode = n);
          const r = j(e);
          (this.offsetX = r.clientX - i.offsetLeft),
            (this.offsetY = r.clientY - i.offsetTop),
            (this.clientHW = Math.floor(i.clientWidth / 2)),
            (this.clientHH = Math.floor(i.clientHeight / 2)),
            this.hlookupDelay !== 0 && window.clearTimeout(this.hlookupDelay),
            this.hlookupTimer !== 0 && window.clearInterval(this.hlookupTimer),
            (this.hlookupDelay = window.setTimeout(() => {
              (this.hlookupDelay = 0),
                (this.hlookupTimer = window.setInterval(
                  this.lookupCloseNode.bind(this),
                  this.lookupInterval,
                ));
            }, this.lookupDelay)),
            (this.capture = !0);
        }
      }
    }
    drag(e) {
      if (this.mindCheese.isEditable() && this.capture) {
        e.preventDefault(),
          this.showShadow(),
          (this.moved = !0),
          window.getSelection().removeAllRanges();
        const t = j(e),
          i = t.clientX - this.offsetX,
          s = t.clientY - this.offsetY;
        (this.shadow.style.left = i + "px"),
          (this.shadow.style.top = s + "px"),
          window.getSelection().removeAllRanges();
      }
    }
    dragend() {
      if (this.mindCheese.isEditable()) {
        if (this.capture) {
          if (
            (this.hlookupDelay !== 0 &&
              (window.clearTimeout(this.hlookupDelay),
              (this.hlookupDelay = 0),
              this.clearLines()),
            this.hlookupTimer !== 0 &&
              (window.clearInterval(this.hlookupTimer),
              (this.hlookupTimer = 0),
              this.clearLines()),
            this.moved)
          ) {
            const e = this.activeNode,
              t = this.targetNode,
              i = this.targetDirect;
            this.moveNode(e, t, i);
          }
          this.hideShadow();
        }
        (this.moved = !1), (this.capture = !1);
      }
    }
    moveNode(e, t, i) {
      console.log(`Draggable.moveNode: ${e} ${t} ${i}`);
      const s = this.shadow.offsetTop;
      if (t && e && !S.inherited(e, t)) {
        console.log("let's move!");
        const n = t.children;
        let r = Number.MAX_VALUE,
          h = null,
          l = z;
        for (let a = n.length - 1; a >= 0; a--) {
          const d = n[a];
          if (d.direction === i && d.id !== e.id) {
            const u = d.viewData.elementTopLeft.y - s;
            u > 0 && u < r && ((r = u), (h = d), (l = F));
          }
        }
        h && (l = h.id),
          console.log(`Calling jm.move_node: ${e.id}, ${l}, ${t.id}, ${i}`),
          this.mindCheese.moveNode(e, l, t, i);
      }
      (this.activeNode = null),
        (this.targetNode = null),
        (this.targetDirect = null);
    }
  }
  class ie {
    constructor(e, t = 1e4) {
      (this.mindCheese = e), (this.undoStack = []), (this.undoStackLimit = t);
    }
    recordSnapshot() {
      this.undoStack.length > this.undoStackLimit &&
        (console.log("UndoManager: callback event. too much stacks."),
        this.undoStack.shift()),
        console.log("UndoManager: callback event pushing."),
        this.undoStack.push(this.mindCheese.getNodeTree());
    }
    undo() {
      const e = this.undoStack.pop();
      if (e) {
        const t = e;
        console.log(`UndoManager: undo. data=${t}`),
          this.mindCheese.showNodeTree(t);
      } else console.log("UndoManager: undo. stack is empty.");
    }
  }
  function U(o) {
    const e = new P();
    return se(e, o), e;
  }
  function se(o, e) {
    if ((o.setRoot(e.id, e.topic), "children" in e)) {
      const t = e.children;
      for (let i = 0; i < t.length; i++) _(o, o.root, t[i]);
    }
  }
  function _(o, e, t) {
    let i = null;
    e.isroot && (i = t.direction == "left" ? c.LEFT : c.RIGHT);
    const s = o.addNode(e, t.id, t.topic, null, i);
    if ("children" in t) {
      const n = t.children;
      for (let r = 0; r < n.length; r++) _(o, s, n[r]);
    }
  }
  function O() {
    return (
      new Date().getTime().toString(16) +
      Math.random().toString(16).substring(2)
    ).substring(2, 16);
  }
  class p {
    static delete(e) {
      const t = e.getSelectedNode();
      return t && !t.isroot && (e.selectNode(t.parent), e.removeNode(t)), !1;
    }
    static addChild(e) {
      const t = e.getSelectedNode();
      if (t) {
        const i = O(),
          s = e.addNode(t, i, "New Node");
        s &&
          (e.selectNode(s), e.checkEditable(), e.wrapperView.editNodeBegin(s));
      }
      return !1;
    }
    static addBrother(e, t) {
      t.preventDefault();
      const i = e.getSelectedNode();
      if (i && !i.isroot) {
        const s = O(),
          n = e.insertNodeAfter(i, s, "New Node");
        n &&
          (e.selectNode(n), e.checkEditable(), e.wrapperView.editNodeBegin(n));
      }
      return !1;
    }
    static editNode(e) {
      const t = e.getSelectedNode();
      return t && (e.checkEditable(), e.wrapperView.editNodeBegin(t)), !1;
    }
    static moveUp(e) {
      console.debug("ShortcutProvider.handle_move_up");
      const t = e.getSelectedNode();
      return t && (e.moveUp(t), e.selectNode(t)), !1;
    }
    static moveDown(e) {
      const t = e.getSelectedNode();
      return t && (e.moveDown(t), e.selectNode(t)), !1;
    }
    static up(e, t) {
      const i = e.getSelectedNode();
      if (i.isroot) return !1;
      if (i) {
        let s = e.findNodeBefore(i);
        if (!s) {
          const n = e.findNodeBefore(i.parent);
          n && n.children.length > 0 && (s = n.children[n.children.length - 1]);
        }
        s && e.selectNode(s), t.stopPropagation(), t.preventDefault();
      }
      return !1;
    }
    static down(e, t) {
      const i = e.getSelectedNode();
      if (i.isroot) return !1;
      if (i) {
        let s = e.findNodeAfter(i);
        if (!s) {
          const n = e.findNodeAfter(i.parent);
          n && n.children.length > 0 && (s = n.children[0]);
        }
        s && e.selectNode(s), t.stopPropagation(), t.preventDefault();
      }
      return !1;
    }
    static left(e, t) {
      return p.handleDirection(e, t, c.LEFT), !1;
    }
    static right(e, t) {
      return p.handleDirection(e, t, c.RIGHT), !1;
    }
    static handleDirection(e, t, i) {
      let s;
      const n = e.getSelectedNode();
      let r = null;
      if (n) {
        if (n.isroot) {
          const h = n.children;
          s = [];
          for (let l = 0; l < h.length; l++) h[l].direction === i && s.push(l);
          r = h[s[Math.floor((s.length - 1) / 2)]];
        } else if (n.direction === i) {
          s = n.children;
          const h = s.length;
          h > 0 && (r = s[Math.floor((h - 1) / 2)]);
        } else r = n.parent;
        r && e.selectNode(r), t.stopPropagation(), t.preventDefault();
      }
    }
    static undo(e, t) {
      return (
        console.log("UNDO!"),
        e.undo(),
        t.stopPropagation(),
        t.preventDefault(),
        !1
      );
    }
  }
  const G = {
    "&": "&amp;",
    ">": "&gt;",
    "<": "&lt;",
    '"': "&quot;",
    "'": "&#39;",
    "`": "&#96;",
    "{": "&#123;",
    "}": "&#125;",
  };
  function R(o) {
    return o.replace(/([&><"'`{}])/g, (e, t) => G[t]);
  }
  class ne {
    render(e) {
      return e.replace(
        /(\n)|\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|([&><"'`{}])|(.)/g,
        (t, i, s, n, r, h, l) => {
          if (i) return "<br>";
          if (s) return `<b>${R(s)}</b>`;
          if (n) return `<i>${R(n)}</i>`;
          if (r) return `<code>${R(r)}</code>`;
          if (h) return G[h];
          if (l) return l;
        },
      );
    }
  }
  class oe {
    constructor() {
      (this.theme = "primary"),
        (this.view = new re()),
        (this.layout = new le()),
        (this.shortcut = new he());
    }
  }
  class re {
    constructor() {
      (this.hmargin = 100),
        (this.vmargin = 50),
        (this.lineWidth = 2),
        (this.lineColor = "#555"),
        (this.renderer = new ne());
    }
  }
  class le {
    constructor() {
      (this.hspace = 30), (this.vspace = 20), (this.pspace = 13);
    }
  }
  class he {
    constructor() {
      (this.enable = !0),
        (this.mappings = [
          [f.NONE, "Delete", p.delete],
          [f.NONE, "Backspace", p.delete],
          [f.NONE, "Tab", p.addChild],
          [f.NONE, "Enter", p.addBrother],
          [f.CTRL, "Enter", p.editNode],
          [f.META, "Enter", p.editNode],
          [f.SHIFT, "ArrowUp", p.moveUp],
          [f.SHIFT, "ArrowDown", p.moveDown],
          [f.NONE, "ArrowUp", p.up],
          [f.NONE, "ArrowDown", p.down],
          [f.NONE, "ArrowLeft", p.left],
          [f.NONE, "ArrowRight", p.right],
          [f.CTRL, "KeyZ", p.undo],
          [f.META, "KeyZ", p.undo],
        ]);
    }
  }
  function de(o) {
    return Y(o.root, 0);
  }
  function Y(o, e) {
    let t = "";
    if (o.topic) {
      const i = o.topic.split(`
`);
      for (let s = 0; s < i.length; s++) {
        for (let n = 0; n < e; n++) t += "	";
        s === 0 ? (t += o.direction == c.LEFT ? "+ " : "- ") : (t += "  "),
          (t += i[s]),
          s + 1 < i.length && (t += " \\"),
          (t += `
`);
      }
    }
    if (o.children) {
      const i = o.children;
      for (let s = 0, n = i.length; s < n; s++) t += Y(i[s], e + 1);
    }
    return t;
  }
  function ae(o) {
    if (o == null) throw new Error("md should not be null");
    const e = o.split(/\n/);
    let t = "";
    const i = { id: "root", topic: "DUMMY", children: [] };
    let s = 0,
      n = i;
    const r = { 0: i };
    let h = !1;
    for (const a of e)
      if (a.match(/\S/))
        if (h) {
          let d = a;
          d.match(/ [\\ ]$/)
            ? ((d = d.replace(/ [\\ ]$/, "")), (h = !0))
            : (h = !1);
          for (let u = 0; u < t.length + 2; u++) d = d.replace(/^\s/, "");
          n.topic +=
            `
` + d;
        } else {
          const d = a.match(/^(\s*)([+-])\s*(.*?)$/);
          if (!d) {
            console.log(`'${a}' is not a bullet list.`);
            continue;
          }
          const u = d[1],
            w = d[2];
          let y = d[3];
          y.match(/ [\\ ]$/)
            ? ((y = y.replace(/ [\\ ]$/, "")), (h = !0))
            : (h = !1);
          const T = {
            id: ++s,
            topic: y,
            direction: w === "+" ? "left" : "right",
            children: [],
          };
          t.length === u.length || (t.length < u.length && (r[u.length] = n)),
            r[u.length].children.push(T),
            (n = T),
            (t = u);
        }
    const l = i.children[0];
    if (!l)
      throw new Error(
        "MindCheese can't parse this markdown as a mindmap: '" + o + "'",
      );
    return l;
  }
  function ce(o) {
    const e = ae(o.replace(/^---$.*^---$/ms, ""));
    return U(e);
  }
  class X {
    constructor(e, t) {
      (this.x = e), (this.y = t);
    }
  }
  class N {
    constructor(e, t) {
      (this.x = e), (this.y = t);
    }
  }
  class C {
    constructor(e, t) {
      (this.width = e), (this.height = t);
    }
  }
  class ue {
    constructor(e, t, i, s) {
      (this.n = e),
        (this.e = t),
        (this.w = i),
        (this.s = s),
        (this.size = new C(this.e + this.w * -1, this.s + this.n * -1)),
        console.log(
          `size: e=${t},w=${i},s=${s},n=${e} w=${this.size.width},h=${this.size.height}`,
        );
    }
  }
  class K {
    constructor(e, t) {
      (this.x = e), (this.y = t);
    }
  }
  class fe extends K {
    convertCenterOfNodeOffsetFromRootNode(e) {
      return new K(this.x + e.x, this.y + e.y);
    }
  }
  class pe {
    constructor(e) {
      this._relativeFromRootMap = e;
    }
    getCenterOffsetOfTheNodeFromRootNode(e) {
      return this._relativeFromRootMap[e.id];
    }
    getNodePointIn(e) {
      const t = this.getCenterOffsetOfTheNodeFromRootNode(e);
      return new N(
        t.x - (e.viewData.elementSizeCache.width / 2) * e.direction,
        t.y + e.viewData.elementSizeCache.height / 2,
      );
    }
    getNodePointOut(e, t) {
      if (e.isroot) {
        const i = (e.viewData.elementSizeCache.width / 2) * t.direction;
        return new N(i, -(e.viewData.elementSizeCache.height / 2));
      } else {
        const i = this.getCenterOffsetOfTheNodeFromRootNode(e),
          s = i.x + (e.viewData.elementSizeCache.width / 2) * e.direction;
        return new N(s, i.y + e.viewData.elementSizeCache.height / 2);
      }
    }
    getAdderPosition(e, t) {
      const i = this.getCenterOffsetOfTheNodeFromRootNode(e),
        s =
          i.x +
          (e.viewData.elementSizeCache.width / 2 + t) * e.direction -
          (e.direction == c.RIGHT ? t : 0),
        n = i.y + e.viewData.elementSizeCache.height / 2 - Math.ceil(t / 2);
      return new N(s, n);
    }
    getTopLeft(e, t) {
      const i = e.viewData.elementSizeCache,
        s = this.getCenterOffsetOfTheNodeFromRootNode(e);
      if (e.isroot) {
        const n = s.x + (i.width / 2) * -1,
          r = s.y - i.height - t;
        return new N(n, r);
      } else {
        const n = s.x + (i.width / 2) * -1,
          r = s.y - i.height / 2 - t;
        return new N(n, r);
      }
    }
    getBounds(e) {
      const t = e.nodes;
      let i = 0,
        s = 0,
        n = 0,
        r = 0;
      for (const h in t) {
        const l = t[h],
          a = this.getCenterOffsetOfTheNodeFromRootNode(l);
        console.log(`getMinSize: id=${l.id}, x=${a.x}, y=${a.y}`);
        const d = l.viewData.elementSizeCache;
        (s = Math.max(a.x + d.width / 2, s)),
          (n = Math.min(a.x - d.width / 2, n)),
          (i = Math.min(a.y - d.height / 2, i)),
          (r = Math.max(a.y + d.height / 2, r));
      }
      return (
        console.log(`getMinSize: n=${i}, e=${s}, w=${n}, s=${r}`),
        new ue(i, s, n, r)
      );
    }
    getOffsetOfTheRootNode(e) {
      const t = this.getBounds(e);
      console.log(`getViewOffset: e=${t.e}, w=${t.w}`);
      const i = -t.w + e.root.viewData.elementSizeCache.width / 2,
        s = -t.n + e.root.viewData.elementSizeCache.height / 2;
      return new fe(i, s);
    }
  }
  class M {
    constructor(e, t, i) {
      (this.hSpace = e), (this.vSpace = t), (this.pSpace = i);
    }
    layout(e) {
      const t = e.root,
        i = {};
      (i[e.root.id] = new X(0, 0)),
        this.layoutOffsetSubNodes(
          t.children.filter((n) => n.direction == c.LEFT),
          i,
        ),
        this.layoutOffsetSubNodes(
          t.children.filter((n) => n.direction == c.RIGHT),
          i,
        );
      const s = {};
      for (const n of Object.values(e.nodes))
        s[n.id] = M.calcRelativeOffsetFromRoot(n, i);
      return new pe(s);
    }
    static calcRelativeOffsetFromRoot(e, t) {
      let i = 0,
        s = 0,
        n = e;
      do (i += t[n.id].x), (s += t[n.id].y), (n = n.parent);
      while (n && !n.isroot);
      return new N(i, s);
    }
    layoutOffsetSubNodes(e, t) {
      var s;
      if (e.length == 0) return 0;
      let i = 0;
      {
        let n = 0;
        for (let r = 0, h = e.length; r < h; r++) {
          const l = e[r],
            a = this.layoutOffsetSubNodes(l.children, t),
            d = Math.max(l.viewData.elementSizeCache.height, a),
            u =
              this.hSpace * l.direction +
              (l.parent.viewData.elementSizeCache.width / 2) * l.direction +
              this.hSpace * l.direction +
              (l.viewData.elementSizeCache.width / 2) * l.direction +
              ((s = l.parent) != null && s.isroot
                ? 0
                : this.pSpace * l.direction),
            w = n + d / 2;
          (t[l.id] = new X(u, w)), (n += d + this.vSpace), (i += d);
        }
      }
      e.length > 1 && (i += this.vSpace * (e.length - 1));
      {
        const n = i / 2;
        for (let r = 0, h = e.length; r < h; r++) t[e[r].id].y -= n;
      }
      return i;
    }
  }
  class V {
    constructor(e, t) {
      (this.lineColor = e),
        (this.lineWidth = t),
        (this.canvasElement = document.createElement("canvas")),
        (this.canvasElement.className = "mindcheese-graph-canvas"),
        (this.canvasContext = this.canvasElement.getContext("2d"));
    }
    element() {
      return this.canvasElement;
    }
    setSize(e, t) {
      (this.canvasElement.width = e), (this.canvasElement.height = t);
    }
    clear() {
      this.canvasContext.clearRect(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height,
      );
    }
    drawLine(e, t, i, s) {
      const n = this.canvasContext;
      (n.strokeStyle = i),
        (n.lineWidth = this.lineWidth),
        (n.lineCap = s),
        V.bezierTo(n, t.x, t.y, e.x, e.y);
    }
    static bezierTo(e, t, i, s, n) {
      e.beginPath(),
        e.moveTo(t, i),
        e.bezierCurveTo(t + ((s - t) * 2) / 3, i, t, n, s, n),
        e.stroke();
    }
  }
  class L {
    constructor(e, t, i, s, n) {
      (this.wrapperView = e),
        (this.mindCheese = t),
        (this.textFormatter = i),
        (this.lineWidth = s),
        (this.pSpace = n),
        (this.mcnodes = document.createElement("mcnodes")),
        this.bindEvent();
    }
    bindEvent() {
      this.mcnodes.addEventListener("keydown", (e) => {
        const t = e.target;
        if (
          (console.debug(
            `keydown=${e.keyCode}==${B} tagName=${t.tagName} shiftkey=${e.shiftKey}`,
          ),
          t.tagName != "MCNODE")
        ) {
          console.log(`It's not MCNODE. ${t.tagName}`);
          return;
        }
        ((e.keyCode === B && !e.shiftKey) || e.keyCode == Z) &&
          (console.log("editNodeEnd"),
          e.stopPropagation(),
          e.preventDefault(),
          this.wrapperView.editNodeEnd());
      }),
        this.mcnodes.addEventListener("keyup", () => {
          this.wrapperView.renderAgain();
        }),
        this.mcnodes.addEventListener("input", () => {
          this.wrapperView.renderAgain();
        }),
        this.mcnodes.addEventListener(
          "blur",
          (e) => {
            e.target.tagName.toLowerCase() == "mcnode" &&
              this.wrapperView.editNodeEnd();
          },
          !0,
        ),
        this.mcnodes.addEventListener(
          "mousedown",
          this.mousedownHandle.bind(this),
        ),
        this.mcnodes.addEventListener("click", this.clickHandle.bind(this)),
        this.mcnodes.addEventListener(
          "dblclick",
          this.dblclickHandle.bind(this),
        );
    }
    mousedownHandle(e) {
      const t = e.target,
        i = this.wrapperView.getBindedNodeId(t);
      if (i) {
        if (W(t)) {
          const s = this.mindCheese.mind.getNodeById(i);
          return this.mindCheese.selectNode(s);
        }
      } else this.mindCheese.selectClear();
    }
    clickHandle(e) {
      const t = e.target;
      switch (t.tagName.toLowerCase()) {
        case "mcadder": {
          const i = this.wrapperView.getBindedNodeId(t);
          if (i) {
            const s = this.mindCheese.mind.getNodeById(i);
            if (s) {
              console.log(`element: ${t.tagName.toLowerCase()}`);
              const n = O(),
                r = this.mindCheese.addNode(s, n, "New Node");
              r &&
                (this.mindCheese.selectNode(r),
                this.checkEditable(),
                this.wrapperView.editNodeBegin(r));
            } else throw new Error("the node[id=" + i + "] can not be found.");
          }
          return !1;
        }
      }
      return !0;
    }
    dblclickHandle(e) {
      this.checkEditable(), e.preventDefault(), e.stopPropagation();
      const t = e.target,
        i = this.wrapperView.getBindedNodeId(t);
      if (i) {
        const s = this.mindCheese.mind.getNodeById(i);
        if (s.viewData.element.contentEditable == "true") return !1;
        if (!s) throw new Error(`the node[id=${i}] can not be found.`);
        return this.wrapperView.editNodeBegin(s), !1;
      }
      return !0;
    }
    attach(e) {
      e.appendChild(this.mcnodes);
    }
    checkEditable() {
      return this.mindCheese.isEditable();
    }
    resetSize() {
      (this.mcnodes.style.width = "1px"), (this.mcnodes.style.height = "1px");
    }
    createNodes() {
      const e = this.mindCheese.mind.nodes,
        t = document.createDocumentFragment();
      for (const i of Object.values(e)) this.createNodeElement(i, t);
      this.mcnodes.appendChild(t);
    }
    addNode(e) {
      this.createNodeElement(e, this.mcnodes), L.initNodeSize(e);
    }
    static initNodeSize(e) {
      const t = e.viewData;
      t.elementSizeCache = new C(t.element.clientWidth, t.element.clientHeight);
    }
    createNodeElement(e, t) {
      const i = document.createElement("mcnode");
      if (e.isroot) i.className = "root";
      else {
        const s = document.createElement("mcadder");
        (s.innerText = "-"),
          s.setAttribute("nodeid", e.id),
          (s.style.visibility = "hidden"),
          t.appendChild(s),
          (e.viewData.adder = s);
      }
      e.topic && (i.innerHTML = this.textFormatter.render(e.topic)),
        i.setAttribute("nodeid", e.id),
        (i.style.visibility = "hidden"),
        t.appendChild(i),
        (e.viewData.element = i);
    }
    cacheNodeSize() {
      const e = this.mindCheese.mind.nodes;
      for (const t of Object.values(e)) L.initNodeSize(t);
    }
    clearNodes() {
      const e = this.mindCheese.mind.nodes;
      for (const t of Object.values(e))
        (t.viewData.element = null), (t.viewData.adder = null);
      this.mcnodes.innerHTML = "";
    }
    removeNode(e) {
      const t = e.viewData.element,
        i = e.viewData.adder;
      this.mcnodes.removeChild(t),
        this.mcnodes.removeChild(i),
        (e.viewData.element = null),
        (e.viewData.adder = null);
    }
    appendChild(e) {
      this.mcnodes.appendChild(e);
    }
    renderNodes(e) {
      const t = this.mindCheese.mind.nodes,
        i = e.getOffsetOfTheRootNode(this.mindCheese.mind);
      for (const s of Object.values(t)) {
        const n = s.viewData,
          r = n.element,
          h = e.getTopLeft(s, this.lineWidth);
        if (
          ((n.elementTopLeft = i.convertCenterOfNodeOffsetFromRootNode(h)),
          (r.style.left = n.elementTopLeft.x + "px"),
          (r.style.top = n.elementTopLeft.y + "px"),
          (r.style.display = ""),
          (r.style.visibility = "visible"),
          !s.isroot && s.children.length == 0)
        ) {
          const l = n.adder,
            a = "+",
            d = i.convertCenterOfNodeOffsetFromRootNode(
              e.getAdderPosition(s, this.pSpace),
            );
          (l.style.left = d.x + "px"),
            (l.style.top = d.y + "px"),
            (l.style.display = ""),
            (l.style.visibility = "visible"),
            (l.innerText = a);
        }
      }
    }
  }
  class we {
    constructor(e, t) {
      (this.x = e), (this.y = t);
    }
  }
  class me {
    constructor(e) {
      (this.graphCanvas = e), (this.lineWidth = this.graphCanvas.lineWidth);
    }
    renderLines(e, t, i) {
      this.graphCanvas.clear();
      for (const s of Object.values(e.nodes).filter((n) => !n.isroot)) {
        const n = t.getNodePointIn(s);
        {
          const r = t.getNodePointOut(s.parent, s);
          this.graphCanvas.drawLine(
            i.convertCenterOfNodeOffsetFromRootNode(r),
            i.convertCenterOfNodeOffsetFromRootNode(n),
            s.color,
            "round",
          );
        }
        {
          const r = new N(
            n.x + s.viewData.elementSizeCache.width * s.direction,
            n.y,
          );
          this.graphCanvas.drawLine(
            i.convertCenterOfNodeOffsetFromRootNode(r),
            i.convertCenterOfNodeOffsetFromRootNode(n),
            s.color,
            "butt",
          );
        }
      }
    }
    setSize(e, t) {
      this.graphCanvas.setSize(e, t);
    }
    clear() {
      this.graphCanvas.clear();
    }
  }
  class H {
    constructor(e, t, i, s, n, r, h, l) {
      (this.zoomScale = 1),
        (this.layoutResult = null),
        (this.mindCheese = e),
        (this.textFormatter = n),
        (this.layoutEngine = r),
        (this.pSpace = h),
        (this.graphView = new me(s)),
        (this.nodesView = new L(this, this.mindCheese, n, l, this.pSpace)),
        (this.size = new C(0, 0)),
        (this.hMargin = t),
        (this.vMargin = i),
        (this.mindCheese = e),
        (this.wrapperElement = document.createElement("div")),
        (this.wrapperElement.className = "mindcheese-inner"),
        this.wrapperElement.appendChild(s.element()),
        this.nodesView.attach(this.wrapperElement),
        (this.selectedNode = null),
        (this.editingNode = null),
        this.bindEvents();
    }
    bindEvents() {
      this.wrapperElement.addEventListener(
        "wheel",
        (e) => {
          e.ctrlKey &&
            (e.stopPropagation(),
            e.deltaY > 0 ? (this.zoomScale -= 0.1) : (this.zoomScale += 0.1),
            (this.zoomScale = Math.min(Math.max(this.zoomScale, 0.2), 20)),
            this.zoom(this.zoomScale));
        },
        { passive: !0 },
      );
    }
    getCanvasSize(e, t) {
      const i = e.getBounds(t).size,
        s = i.width + this.hMargin * 2,
        n = i.height + this.vMargin * 2,
        r = this.wrapperElement.clientWidth,
        h = this.wrapperElement.clientHeight;
      return (
        console.log(`expandSize: ${h} ${n}`),
        new C(Math.max(r, s), Math.max(h, n))
      );
    }
    attach(e) {
      e.appendChild(this.wrapperElement);
    }
    setTheme(e) {
      e
        ? (this.wrapperElement.className = "theme-" + e)
        : (this.wrapperElement.className = "");
    }
    centerRoot() {
      const e = this.wrapperElement.clientWidth,
        t = this.wrapperElement.clientHeight;
      if (this.size.width > e) {
        const i = this.layoutResult.getOffsetOfTheRootNode(
          this.mindCheese.mind,
        );
        this.wrapperElement.scrollLeft = i.x - e / 2;
      }
      this.size.height > t &&
        (this.wrapperElement.scrollTop = (this.size.height - t) / 2);
    }
    setSize(e, t) {
      (this.wrapperElement.style.width = e + "px"),
        (this.wrapperElement.style.height = t + "px");
    }
    restoreScroll(e, t) {
      const i = e.viewData;
      (this.wrapperElement.scrollLeft = parseInt(i.element.style.left) - t.x),
        (this.wrapperElement.scrollTop = parseInt(i.element.style.top) - t.y);
    }
    saveScroll(e) {
      const t = e.viewData;
      return new we(
        parseInt(t.element.style.left) - this.wrapperElement.scrollLeft,
        parseInt(t.element.style.top) - this.wrapperElement.scrollTop,
      );
    }
    zoom(e) {
      this.wrapperElement.style.transform = `scale(${e})`;
    }
    appendChild(e) {
      this.wrapperElement.appendChild(e);
    }
    reset() {
      console.debug("view.reset"),
        (this.selectedNode = null),
        this.graphView.clear(),
        this.nodesView.clearNodes(),
        this.setTheme(this.mindCheese.options.theme);
    }
    selectClear() {
      this.selectedNode &&
        this.selectedNode.viewData.element.classList.remove("selected");
    }
    selectNode(e) {
      this.selectedNode &&
        this.selectedNode.viewData.element.classList.remove("selected"),
        e &&
          ((this.selectedNode = e),
          e.viewData.element.classList.add("selected"),
          H.adjustScrollBar(e));
    }
    static adjustScrollBar(e) {
      const t = e.viewData.element;
      t.getBoundingClientRect().bottom > window.innerHeight &&
        t.scrollIntoView(!1),
        t.getBoundingClientRect().top < 0 && t.scrollIntoView(),
        t.getBoundingClientRect().left > window.innerWidth &&
          t.scrollIntoView(!1),
        (t.getBoundingClientRect().left < 0 ||
          t.getBoundingClientRect().right < 0) &&
          t.scrollIntoView();
    }
    removeNode(e) {
      this.selectedNode != null &&
        this.selectedNode.id == e.id &&
        (this.selectedNode = null),
        this.editingNode != null &&
          this.editingNode.id == e.id &&
          ((e.viewData.element.contentEditable = "false"),
          (this.editingNode = null));
      for (let t = 0, i = e.children.length; t < i; t++)
        this.removeNode(e.children[t]);
      e.viewData && this.nodesView.removeNode(e);
    }
    isEditing() {
      return !!this.editingNode;
    }
    editNodeBegin(e) {
      if (!e.topic) {
        console.warn("don't edit image nodes");
        return;
      }
      this.editingNode != null && this.editNodeEnd(), (this.editingNode = e);
      const t = e.viewData.element;
      (t.contentEditable = "true"),
        (t.innerText = e.topic),
        (e.viewData.elementSizeCache = new C(t.clientWidth, t.clientHeight));
      function i(s) {
        const n = document.createRange();
        n.selectNodeContents(s);
        const r = window.getSelection();
        r.removeAllRanges(), r.addRange(n);
      }
      i(t), t.focus(), this.renderAgain();
    }
    getBindedNodeId(e) {
      if (e == null) return null;
      const t = e.tagName.toLowerCase();
      return t === "mcnodes" || t === "body" || t === "html"
        ? null
        : t === "mcnode" || t == "mcadder"
          ? e.getAttribute("nodeid")
          : this.getBindedNodeId(e.parentElement);
    }
    updateNode(e) {
      const t = e.viewData,
        i = t.element;
      e.topic && (i.innerHTML = this.textFormatter.render(e.topic)),
        (t.elementSizeCache = new C(i.clientWidth, i.clientHeight));
    }
    editNodeEnd() {
      if (
        (console.log(`editNodeEnd(editingNode=${this.editingNode})`),
        this.editingNode != null)
      ) {
        const e = this.editingNode;
        this.editingNode = null;
        const t = e.viewData.element;
        t.contentEditable = "false";
        const i = t.innerText;
        !i || i.replace(/\s*/, "").length == 0 || e.topic === i
          ? (console.debug("Calling updateNode"),
            (t.innerHTML = this.textFormatter.render(e.topic)),
            (e.viewData.elementSizeCache = new C(
              t.clientWidth,
              t.clientHeight,
            )),
            this.renderAgain())
          : (console.debug("Calling updateNode"),
            this.mindCheese.updateNode(e.id, i));
      }
    }
    resetSize() {
      this.graphView.setSize(1, 1),
        this.nodesView.resetSize(),
        this.renderAgain();
    }
    renderAgain() {
      (this.layoutResult = this.layoutEngine.layout(this.mindCheese.mind)),
        (this.size = this.getCanvasSize(
          this.layoutResult,
          this.mindCheese.mind,
        )),
        console.log(`doShow: ${this.size.width} ${this.size.height}`),
        this.graphView.setSize(this.size.width, this.size.height),
        this.mindCheese.draggable.resize(this.size.width, this.size.height),
        this.setSize(this.size.width, this.size.height),
        this.nodesView.renderNodes(this.layoutResult);
      const e = this.layoutResult.getOffsetOfTheRootNode(this.mindCheese.mind);
      this.graphView.renderLines(this.mindCheese.mind, this.layoutResult, e);
    }
  }
  class ge {
    constructor() {
      this.eventHandlersMap = { 1: [] };
    }
    addEventListener(e, t) {
      this.eventHandlersMap[e].push(t);
    }
    invokeEventHandler(e, t) {
      const i = this.eventHandlersMap[e].length;
      for (let s = 0; s < i; s++) this.eventHandlersMap[e][s](t);
    }
  }
  class $ {
    constructor(e, t = new oe()) {
      if (!e) throw new Error("container shouldn't be null!");
      (this.container = e),
        (this.options = t),
        (this.mind = new P()),
        (this.editable = !0),
        (this.eventRouter = new ge());
      const i = new V(t.view.lineColor, t.view.lineWidth),
        s = new M(t.layout.hspace, t.layout.vspace, t.layout.pspace);
      (this.wrapperView = new H(
        this,
        t.view.hmargin,
        t.view.vmargin,
        i,
        t.view.renderer,
        s,
        t.layout.pspace,
        t.view.lineWidth,
      )),
        (this.shortcut = new q(this, t.shortcut.enable, t.shortcut.mappings)),
        (this.draggable = new D(this)),
        (this.undoManager = new ie(this)),
        this.wrapperView.attach(this.container),
        this.draggable.eventBind(this.container),
        this.shortcut.bindKeyEvents(),
        this.bindEvent();
    }
    addEventListener(e, t) {
      this.eventRouter.addEventListener(e, t);
    }
    enableEdit() {
      this.editable = !0;
    }
    disableEdit() {
      this.editable = !1;
    }
    isEditable() {
      return this.editable;
    }
    checkEditable() {
      if (!this.editable)
        throw new Error("fail, this mind map is not editable");
    }
    setTheme(e) {
      const t = this.options.theme;
      (this.options.theme = e),
        t !== this.options.theme &&
          this.wrapperView.setTheme(this.options.theme);
    }
    bindEvent() {
      window.addEventListener("resize", () => (this.resize(), !1));
    }
    showMind(e) {
      this.wrapperView.reset(),
        (this.mind = e),
        this.wrapperView.nodesView.createNodes(),
        this.wrapperView.nodesView.cacheNodeSize(),
        this.wrapperView.renderAgain(),
        this.wrapperView.centerRoot();
    }
    showNodeTree(e) {
      this.showMind(U(e));
    }
    showMarkdown(e) {
      this.showMind(ce(e));
    }
    getMarkdown() {
      return de(this.mind);
    }
    getNodeTree() {
      return this.mind.root.toObject();
    }
    addNode(e, t, i) {
      this.checkEditable(),
        this.undoManager.recordSnapshot(),
        (e.viewData.adder.style.display = "none");
      const s = this.mind.addNode(e, t, i, null, null);
      return (
        s &&
          (this.wrapperView.nodesView.addNode(s),
          this.wrapperView.renderAgain(),
          this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind)),
        s
      );
    }
    insertNodeAfter(e, t, i) {
      this.checkEditable(), this.undoManager.recordSnapshot();
      const s = this.mind.insertNodeAfter(e, t, i);
      return (
        this.wrapperView.nodesView.addNode(s),
        this.wrapperView.renderAgain(),
        this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind),
        s
      );
    }
    removeNode(e) {
      if ((this.checkEditable(), e.isroot))
        throw new Error("fail, cannot remove root node");
      const t = e.id,
        i = e.parent;
      this.undoManager.recordSnapshot();
      const s = $.findUpperBrotherOrParentNode(i, t),
        n = this.wrapperView.saveScroll(e);
      return (
        this.wrapperView.removeNode(e),
        this.mind.removeNode(e),
        this.wrapperView.renderAgain(),
        i.children.length > 0 &&
          ((this.mind.selected = s), this.wrapperView.selectNode(s)),
        this.wrapperView.restoreScroll(i, n),
        this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind),
        !0
      );
    }
    static findUpperBrotherOrParentNode(e, t) {
      const i = e.children;
      for (let s = 0; s < i.length; s++)
        if (i[s].id == t) return s == 0 ? e : i[s - 1];
      return e;
    }
    updateNode(e, t) {
      if ((this.checkEditable(), !t || t.replace(/\s*/, "").length == 0))
        throw new Error("fail, topic can not be empty");
      const i = this.mind.getNodeById(e);
      if ((this.undoManager.recordSnapshot(), i.topic === t)) {
        console.info("nothing changed"), this.wrapperView.updateNode(i);
        return;
      }
      (i.topic = t),
        this.wrapperView.updateNode(i),
        this.wrapperView.renderAgain(),
        this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind);
    }
    moveNode(e, t, i, s) {
      console.log(`jm.move_node: ${e.id} ${t} ${i.id} ${s}`),
        this.checkEditable(),
        this.undoManager.recordSnapshot(),
        this.mind.moveNode(e, t, i, s),
        this.wrapperView.updateNode(e),
        this.wrapperView.renderAgain(),
        this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind);
    }
    selectNode(e) {
      (this.mind.selected = e), this.wrapperView.selectNode(e);
    }
    getSelectedNode() {
      return this.mind ? this.mind.selected : null;
    }
    selectClear() {
      this.mind &&
        ((this.mind.selected = null), this.wrapperView.selectClear());
    }
    findNodeBefore(e) {
      if (e.isroot) return null;
      if (e.parent.isroot) {
        const t = e.parent.children.filter((i) => i.direction === e.direction);
        for (let i = 0; i < t.length; i++) {
          const s = t[i];
          if (e.id === s.id) return i !== 0 ? t[i - 1] : null;
        }
        throw new Error(`Missing the node in parent: ${e.id}`);
      } else return this.mind.getNodeBefore(e);
    }
    findNodeAfter(e) {
      if (e.isroot) return null;
      if (e.parent.isroot) {
        const t = e.parent.children.filter((i) => i.direction == e.direction);
        for (let i = 0; i < t.length; i++) {
          const s = t[i];
          if (e.id === s.id) return i + 1 < t.length ? t[i + 1] : null;
        }
        throw new Error(
          `Illegal state. The parent node doesn't have this child: ${e.id}`,
        );
      } else return this.mind.getNodeAfter(e);
    }
    resize() {
      console.log("MindCheese.resize()"), this.wrapperView.resetSize();
    }
    undo() {
      this.undoManager.undo();
    }
    moveUp(e) {
      const t = this.findNodeBefore(e);
      t &&
        (this.moveNode(e, t.id, e.parent, e.direction),
        this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind));
    }
    moveDown(e) {
      const t = e.parent.children.filter((i) => i.direction === e.direction);
      for (let i = 0; i < t.length; i++)
        if (t[i].id == e.id) {
          if (i === t.length - 1) return;
          if (i === t.length - 2) {
            this.moveNode(e, z, e.parent, e.direction),
              this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind);
            return;
          } else {
            console.debug(
              `MindCheese.moveDown: topic=${e.topic} before.topic=${t[i + 1].topic} direction=${e.direction}`,
            ),
              this.moveNode(e, t[i + 2].id, e.parent, e.direction),
              this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind);
            return;
          }
        }
    }
  }
  (b.MindCheese = $),
    Object.defineProperty(b, Symbol.toStringTag, { value: "Module" });
});
