(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) i(n);
  new MutationObserver((n) => {
    for (const s of n)
      if (s.type === "childList")
        for (const r of s.addedNodes)
          r.tagName === "LINK" && r.rel === "modulepreload" && i(r);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(n) {
    const s = {};
    return (
      n.integrity && (s.integrity = n.integrity),
      n.referrerPolicy && (s.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === "use-credentials"
        ? (s.credentials = "include")
        : n.crossOrigin === "anonymous"
          ? (s.credentials = "omit")
          : (s.credentials = "same-origin"),
      s
    );
  }
  function i(n) {
    if (n.ep) return;
    n.ep = !0;
    const s = t(n);
    fetch(n.href, s);
  }
})();
var u = ((o) => (
    (o[(o.LEFT = -1)] = "LEFT"),
    (o[(o.CENTER = 0)] = "CENTER"),
    (o[(o.RIGHT = 1)] = "RIGHT"),
    o
  ))(u || {}),
  g = ((o) => ((o[(o.AfterEdit = 1)] = "AfterEdit"), o))(g || {});
const W = "_first_",
  R = "_last_";
var f = ((o) => (
  (o[(o.NONE = 0)] = "NONE"),
  (o[(o.META = 2)] = "META"),
  (o[(o.CTRL = 4)] = "CTRL"),
  (o[(o.ALT = 8)] = "ALT"),
  (o[(o.SHIFT = 16)] = "SHIFT"),
  o
))(f || {});
const $ = 13,
  Z = 27;
class Q {
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
    for (const n of t) {
      const [s, r] = n;
      if (s === i) return r(this.mindCheese, e);
    }
    return !0;
  }
  compileHandlers(e) {
    const t = {};
    return (
      e.forEach((i) => {
        const [n, s, r] = i;
        t[s] || (t[s] = []), t[s].push([n, r]);
      }),
      t
    );
  }
}
class J {
  constructor() {
    (this.element = null),
      (this.adder = null),
      (this.elementSizeCache = null),
      (this.elementTopLeft = null);
  }
}
class ee {
  constructor(e) {
    (this.data = e), (this.index = 0);
  }
  take() {
    const e = this.data[this.index++];
    return this.index == this.data.length && (this.index = 0), e;
  }
}
const te = new ee([
  "#cc0000",
  "#00cc00",
  "#0000cc",
  "#00cccc",
  "#cc00cc",
  "#cccc00",
]);
class S {
  constructor(e, t, i, n, s, r) {
    if (!e) throw new Error("invalid nodeid");
    (this.id = e),
      (this.index = t),
      (this.topic = i),
      (this.isroot = n),
      (this.parent = s),
      (this.direction = r),
      (this.children = []),
      (this.viewData = new J()),
      s
        ? s && s.color
          ? (this.color = s.color)
          : (this.color = te.take())
        : (this.color = null);
  }
  static compare(e, t) {
    let i;
    const n = e.index,
      s = t.index;
    return (
      n >= 0 && s >= 0
        ? (i = n - s)
        : n === -1 && s === -1
          ? (i = 0)
          : n === -1
            ? (i = 1)
            : s === -1
              ? (i = -1)
              : (i = 0),
      i
    );
  }
  static inherited(e, t) {
    if (e && t) {
      if (e.id === t.id || e.isroot) return !0;
      const i = e.id;
      let n = t;
      for (; !n.isroot; ) if (((n = n.parent), n.id === i)) return !0;
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
        (e.direction = this.direction == u.LEFT ? "left" : "right"),
      e
    );
  }
  applyColor(e) {
    this.color = e;
    for (let t = 0, i = this.children.length; t < i; t++)
      this.children[t].applyColor(e);
  }
}
class _ {
  constructor() {
    (this.root = null), (this.selected = null), (this.nodes = {});
  }
  getNodeById(e) {
    if (e in this.nodes) return this.nodes[e];
    throw new Error(`the node[id=${e}] can not be found...`);
  }
  setRoot(e, t) {
    if (this.root != null) throw new Error("root node is already exist");
    (this.root = new S(e, 0, t, !0, null, u.CENTER)), this.putNode(this.root);
  }
  addNode(e, t, i, n, s) {
    const r = n || -1;
    let d;
    if (e.isroot) {
      let l;
      if (s == null) {
        const h = e.children,
          a = h.length;
        let c = 0;
        for (let m = 0; m < a; m++) h[m].direction === u.LEFT ? c-- : c++;
        l = a > 1 && c > 0 ? u.LEFT : u.RIGHT;
      } else l = s === u.LEFT ? u.LEFT : u.RIGHT;
      d = new S(t, r, i, !1, e, l);
    } else d = new S(t, r, i, !1, e, e.direction);
    return this.putNode(d), e.children.push(d), this.reindex(e), d;
  }
  getNodeBefore(e) {
    if (e.isroot) return null;
    const t = e.index - 2;
    return t >= 0 ? e.parent.children[t] : null;
  }
  insertNodeAfter(e, t, i) {
    const n = e.index + 0.5;
    return this.addNode(e.parent, t, i, n, e.direction);
  }
  getNodeAfter(e) {
    if (e.isroot) return null;
    const t = e.index;
    return e.parent.children.length >= t ? e.parent.children[t] : null;
  }
  moveNode(e, t, i, n) {
    console.log(`move_node: ${e} ${t} ${i.id} ${n}`),
      this.doMoveNode(e, t, i, n),
      i.color && e.color != i.color && e.applyColor(i.color);
  }
  flowNodeDirection(e, t) {
    typeof t > "u" ? (t = e.direction) : (e.direction = t);
    let i = e.children.length;
    for (; i--; ) this.flowNodeDirection(e.children[i], t);
  }
  moveNodeInternal(e, t) {
    if (e && t)
      if (t === R) (e.index = -1), this.reindex(e.parent);
      else if (t === W) (e.index = 0), this.reindex(e.parent);
      else {
        const i = t ? this.getNodeById(t) : null;
        i != null && i.parent != null && i.parent.id === e.parent.id
          ? ((e.index = i.index - 0.5), this.reindex(e.parent))
          : console.error(`Missing node_before: ${t}`);
      }
    return e;
  }
  doMoveNode(e, t, i, n) {
    if (
      (console.log(`_move_node: node=${e}, ${t}, parentid=${i.id}, ${n}`),
      e && i.id)
    ) {
      if (
        (console.assert(e.parent, `node.parent is null: ${e}`),
        e.parent.id !== i.id)
      ) {
        console.log("_move_node: node.parent.id!==parentid");
        const s = e.parent.children;
        let r = s.length;
        for (; r--; )
          if ((console.assert(s[r], "sibling[si] is null"), s[r].id === e.id)) {
            s.splice(r, 1);
            break;
          }
        (e.parent = this.getNodeById(i.id)), e.parent.children.push(e);
      }
      e.parent.isroot ? (e.direction = n) : (e.direction = e.parent.direction),
        this.moveNodeInternal(e, t),
        this.flowNodeDirection(e, n);
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
    const n = e.parent.children;
    let s = n.length;
    for (; s--; )
      if (n[s].id === e.id) {
        n.splice(s, 1);
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
function U(o) {
  let e = o;
  for (; e; ) {
    if (e.tagName.toLowerCase() == "mcnode") return e;
    e = e.parentElement;
  }
  return null;
}
class T {
  constructor(e, t) {
    (this.x = e), (this.y = t);
  }
}
function A(o) {
  if (o instanceof MouseEvent) return o;
  if (o instanceof TouchEvent) return o.touches[0];
  throw new Error("Unknown event type");
}
class ie {
  constructor(e, t, i, n) {
    (this.node = e), (this.direction = t), (this.sp = i), (this.np = n);
  }
}
class L {
  constructor(e) {
    (this.clientHW = 0),
      (this.clientHH = 0),
      (this.lineWidth = 5),
      (this.lookupDelay = 500),
      (this.lookupInterval = 80),
      (this.mindCheese = e),
      (this.canvasElement = L.createCanvas()),
      this.mindCheese.wrapperView.appendChild(this.canvasElement),
      (this.canvasContext = this.canvasElement.getContext("2d")),
      (this.shadow = L.createShadow()),
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
  canvasLineTo(e, t, i, n) {
    this.canvasContext.beginPath(),
      this.canvasContext.moveTo(e, t),
      this.canvasContext.bezierCurveTo(e + ((i - e) * 2) / 3, t, e, n, i, n),
      this.canvasContext.stroke();
  }
  doLookupCloseNode() {
    const e = this.mindCheese.mind.root,
      t = e.viewData.elementTopLeft,
      i = e.viewData.elementSizeCache,
      n = t.x + i.width / 2,
      s = this.shadowW,
      r = this.shadowH,
      d = this.shadow.offsetLeft,
      l = this.shadow.offsetTop,
      h = d + s / 2 >= n ? u.RIGHT : u.LEFT,
      a = this.mindCheese.mind.nodes;
    let c = Number.MAX_VALUE,
      m = null,
      y = null,
      b = null;
    for (const K in a) {
      let D, O;
      const N = a[K];
      let k = 0;
      if (N.isroot || N.direction == h) {
        if (N.id == this.activeNode.id) continue;
        const v = N.viewData.elementSizeCache,
          w = N.viewData.elementTopLeft;
        if (h == u.RIGHT) {
          if (d - w.x - v.width <= 0) continue;
          (k =
            Math.abs(d - w.x - v.width) +
            Math.abs(l + r / 2 - w.y - v.height / 2)),
            (D = new T(
              w.x + v.width - this.lineWidth,
              w.y + (N.isroot ? v.height / 2 : v.height),
            )),
            (O = new T(d + this.lineWidth, l + r));
        } else {
          if (w.x - d - s <= 0) continue;
          (k =
            Math.abs(d + s - w.x) + Math.abs(l + r / 2 - w.y - v.height / 2)),
            (D = new T(
              w.x + this.lineWidth,
              w.y + (N.isroot ? v.height / 2 : v.height),
            )),
            (O = new T(d + s - this.lineWidth, l + r));
        }
        k < c && ((m = N), (y = D), (b = O), (c = k));
      }
    }
    return m ? new ie(m, h, b, y) : null;
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
      i = U(e.target);
    if (!i) return;
    const n = t.getBindedNodeId(i);
    if (n) {
      const s = this.mindCheese.mind.getNodeById(n);
      if (!s.isroot) {
        this.resetShadow(i), (this.activeNode = s);
        const r = A(e);
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
      const t = A(e),
        i = t.clientX - this.offsetX,
        n = t.clientY - this.offsetY;
      (this.shadow.style.left = i + "px"),
        (this.shadow.style.top = n + "px"),
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
    const n = this.shadow.offsetTop;
    if (t && e && !S.inherited(e, t)) {
      console.log("let's move!");
      const s = t.children;
      let r = Number.MAX_VALUE,
        d = null,
        l = R;
      for (let h = s.length - 1; h >= 0; h--) {
        const a = s[h];
        if (a.direction === i && a.id !== e.id) {
          const c = a.viewData.elementTopLeft.y - n;
          c > 0 && c < r && ((r = c), (d = a), (l = W));
        }
      }
      d && (l = d.id),
        console.log(`Calling jm.move_node: ${e.id}, ${l}, ${t.id}, ${i}`),
        this.mindCheese.moveNode(e, l, t, i);
    }
    (this.activeNode = null),
      (this.targetNode = null),
      (this.targetDirect = null);
  }
}
class ne {
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
function G(o) {
  const e = new _();
  return se(e, o), e;
}
function se(o, e) {
  if ((o.setRoot(e.id, e.topic), "children" in e)) {
    const t = e.children;
    for (let i = 0; i < t.length; i++) Y(o, o.root, t[i]);
  }
}
function Y(o, e, t) {
  let i = null;
  e.isroot && (i = t.direction == "left" ? u.LEFT : u.RIGHT);
  const n = o.addNode(e, t.id, t.topic, null, i);
  if ("children" in t) {
    const s = t.children;
    for (let r = 0; r < s.length; r++) Y(o, n, s[r]);
  }
}
function z() {
  return (
    new Date().getTime().toString(16) + Math.random().toString(16).substring(2)
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
      const i = z(),
        n = e.addNode(t, i, "New Node");
      n && (e.selectNode(n), e.checkEditable(), e.wrapperView.editNodeBegin(n));
    }
    return !1;
  }
  static addBrother(e, t) {
    t.preventDefault();
    const i = e.getSelectedNode();
    if (i && !i.isroot) {
      const n = z(),
        s = e.insertNodeAfter(i, n, "New Node");
      s && (e.selectNode(s), e.checkEditable(), e.wrapperView.editNodeBegin(s));
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
      let n = e.findNodeBefore(i);
      if (!n) {
        const s = e.findNodeBefore(i.parent);
        s && s.children.length > 0 && (n = s.children[s.children.length - 1]);
      }
      n && e.selectNode(n), t.stopPropagation(), t.preventDefault();
    }
    return !1;
  }
  static down(e, t) {
    const i = e.getSelectedNode();
    if (i.isroot) return !1;
    if (i) {
      let n = e.findNodeAfter(i);
      if (!n) {
        const s = e.findNodeAfter(i.parent);
        s && s.children.length > 0 && (n = s.children[0]);
      }
      n && e.selectNode(n), t.stopPropagation(), t.preventDefault();
    }
    return !1;
  }
  static left(e, t) {
    return p.handleDirection(e, t, u.LEFT), !1;
  }
  static right(e, t) {
    return p.handleDirection(e, t, u.RIGHT), !1;
  }
  static handleDirection(e, t, i) {
    let n;
    const s = e.getSelectedNode();
    let r = null;
    if (s) {
      if (s.isroot) {
        const d = s.children;
        n = [];
        for (let l = 0; l < d.length; l++) d[l].direction === i && n.push(l);
        r = d[n[Math.floor((n.length - 1) / 2)]];
      } else if (s.direction === i) {
        n = s.children;
        const d = n.length;
        d > 0 && (r = n[Math.floor((d - 1) / 2)]);
      } else r = s.parent;
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
const q = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
  "{": "&#123;",
  "}": "&#125;",
};
function M(o) {
  return o.replace(/([&><"'`{}])/g, (e, t) => q[t]);
}
class oe {
  render(e) {
    return e.replace(
      /(\n)|\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|([&><"'`{}])|(.)/g,
      (t, i, n, s, r, d, l) => {
        if (i) return "<br>";
        if (n) return `<b>${M(n)}</b>`;
        if (s) return `<i>${M(s)}</i>`;
        if (r) return `<code>${M(r)}</code>`;
        if (d) return q[d];
        if (l) return l;
      },
    );
  }
}
class re {
  constructor() {
    (this.theme = "primary"),
      (this.view = new le()),
      (this.layout = new de()),
      (this.shortcut = new ae());
  }
}
class le {
  constructor() {
    (this.hmargin = 100),
      (this.vmargin = 50),
      (this.lineWidth = 2),
      (this.lineColor = "#555"),
      (this.renderer = new oe());
  }
}
class de {
  constructor() {
    (this.hspace = 30), (this.vspace = 20), (this.pspace = 13);
  }
}
class ae {
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
function he(o) {
  return X(o.root, 0);
}
function X(o, e) {
  let t = "";
  if (o.topic) {
    const i = o.topic.split(`
`);
    for (let n = 0; n < i.length; n++) {
      for (let s = 0; s < e; s++) t += "	";
      n === 0 ? (t += o.direction == u.LEFT ? "+ " : "- ") : (t += "  "),
        (t += i[n]),
        n + 1 < i.length && (t += " \\"),
        (t += `
`);
    }
  }
  if (o.children) {
    const i = o.children;
    for (let n = 0, s = i.length; n < s; n++) t += X(i[n], e + 1);
  }
  return t;
}
function ce(o) {
  if (o == null) throw new Error("md should not be null");
  const e = o.split(/\n/);
  let t = "";
  const i = { id: "root", topic: "DUMMY", children: [] };
  let n = 0,
    s = i;
  const r = { 0: i };
  let d = !1;
  for (const h of e)
    if (h.match(/\S/))
      if (d) {
        let a = h;
        a.match(/ [\\ ]$/)
          ? ((a = a.replace(/ [\\ ]$/, "")), (d = !0))
          : (d = !1);
        for (let c = 0; c < t.length + 2; c++) a = a.replace(/^\s/, "");
        s.topic +=
          `
` + a;
      } else {
        const a = h.match(/^(\s*)([+-])\s*(.*?)$/);
        if (!a) {
          console.log(`'${h}' is not a bullet list.`);
          continue;
        }
        const c = a[1],
          m = a[2];
        let y = a[3];
        y.match(/ [\\ ]$/)
          ? ((y = y.replace(/ [\\ ]$/, "")), (d = !0))
          : (d = !1);
        const b = {
          id: ++n,
          topic: y,
          direction: m === "+" ? "left" : "right",
          children: [],
        };
        t.length === c.length || (t.length < c.length && (r[c.length] = s)),
          r[c.length].children.push(b),
          (s = b),
          (t = c);
      }
  const l = i.children[0];
  if (!l)
    throw new Error(
      "MindCheese can't parse this markdown as a mindmap: '" + o + "'",
    );
  return l;
}
function ue(o) {
  const e = ce(o.replace(/^---$.*^---$/ms, ""));
  return G(e);
}
class B {
  constructor(e, t) {
    (this.x = e), (this.y = t);
  }
}
class E {
  constructor(e, t) {
    (this.x = e), (this.y = t);
  }
}
class C {
  constructor(e, t) {
    (this.width = e), (this.height = t);
  }
}
class fe {
  constructor(e, t, i, n) {
    (this.n = e),
      (this.e = t),
      (this.w = i),
      (this.s = n),
      (this.size = new C(this.e + this.w * -1, this.s + this.n * -1)),
      console.log(
        `size: e=${t},w=${i},s=${n},n=${e} w=${this.size.width},h=${this.size.height}`,
      );
  }
}
class F {
  constructor(e, t) {
    (this.x = e), (this.y = t);
  }
}
class pe extends F {
  convertCenterOfNodeOffsetFromRootNode(e) {
    return new F(this.x + e.x, this.y + e.y);
  }
}
class me {
  constructor(e) {
    this._relativeFromRootMap = e;
  }
  getCenterOffsetOfTheNodeFromRootNode(e) {
    return this._relativeFromRootMap[e.id];
  }
  getNodePointIn(e) {
    const t = this.getCenterOffsetOfTheNodeFromRootNode(e);
    return new E(
      t.x - (e.viewData.elementSizeCache.width / 2) * e.direction,
      t.y + e.viewData.elementSizeCache.height / 2,
    );
  }
  getNodePointOut(e, t) {
    if (e.isroot) {
      const i = (e.viewData.elementSizeCache.width / 2) * t.direction;
      return new E(i, -(e.viewData.elementSizeCache.height / 2));
    } else {
      const i = this.getCenterOffsetOfTheNodeFromRootNode(e),
        n = i.x + (e.viewData.elementSizeCache.width / 2) * e.direction;
      return new E(n, i.y + e.viewData.elementSizeCache.height / 2);
    }
  }
  getAdderPosition(e, t) {
    const i = this.getCenterOffsetOfTheNodeFromRootNode(e),
      n =
        i.x +
        (e.viewData.elementSizeCache.width / 2 + t) * e.direction -
        (e.direction == u.RIGHT ? t : 0),
      s = i.y + e.viewData.elementSizeCache.height / 2 - Math.ceil(t / 2);
    return new E(n, s);
  }
  getTopLeft(e, t) {
    const i = e.viewData.elementSizeCache,
      n = this.getCenterOffsetOfTheNodeFromRootNode(e);
    if (e.isroot) {
      const s = n.x + (i.width / 2) * -1,
        r = n.y - i.height - t;
      return new E(s, r);
    } else {
      const s = n.x + (i.width / 2) * -1,
        r = n.y - i.height / 2 - t;
      return new E(s, r);
    }
  }
  getBounds(e) {
    const t = e.nodes;
    let i = 0,
      n = 0,
      s = 0,
      r = 0;
    for (const d in t) {
      const l = t[d],
        h = this.getCenterOffsetOfTheNodeFromRootNode(l);
      console.log(`getMinSize: id=${l.id}, x=${h.x}, y=${h.y}`);
      const a = l.viewData.elementSizeCache;
      (n = Math.max(h.x + a.width / 2, n)),
        (s = Math.min(h.x - a.width / 2, s)),
        (i = Math.min(h.y - a.height / 2, i)),
        (r = Math.max(h.y + a.height / 2, r));
    }
    return (
      console.log(`getMinSize: n=${i}, e=${n}, w=${s}, s=${r}`),
      new fe(i, n, s, r)
    );
  }
  getOffsetOfTheRootNode(e) {
    const t = this.getBounds(e);
    console.log(`getViewOffset: e=${t.e}, w=${t.w}`);
    const i = -t.w + e.root.viewData.elementSizeCache.width / 2,
      n = -t.n + e.root.viewData.elementSizeCache.height / 2;
    return new pe(i, n);
  }
}
class I {
  constructor(e, t, i) {
    (this.hSpace = e), (this.vSpace = t), (this.pSpace = i);
  }
  layout(e) {
    const t = e.root,
      i = {};
    (i[e.root.id] = new B(0, 0)),
      this.layoutOffsetSubNodes(
        t.children.filter((s) => s.direction == u.LEFT),
        i,
      ),
      this.layoutOffsetSubNodes(
        t.children.filter((s) => s.direction == u.RIGHT),
        i,
      );
    const n = {};
    for (const s of Object.values(e.nodes))
      n[s.id] = I.calcRelativeOffsetFromRoot(s, i);
    return new me(n);
  }
  static calcRelativeOffsetFromRoot(e, t) {
    let i = 0,
      n = 0,
      s = e;
    do (i += t[s.id].x), (n += t[s.id].y), (s = s.parent);
    while (s && !s.isroot);
    return new E(i, n);
  }
  layoutOffsetSubNodes(e, t) {
    var n;
    if (e.length == 0) return 0;
    let i = 0;
    {
      let s = 0;
      for (let r = 0, d = e.length; r < d; r++) {
        const l = e[r],
          h = this.layoutOffsetSubNodes(l.children, t),
          a = Math.max(l.viewData.elementSizeCache.height, h),
          c =
            this.hSpace * l.direction +
            (l.parent.viewData.elementSizeCache.width / 2) * l.direction +
            this.hSpace * l.direction +
            (l.viewData.elementSizeCache.width / 2) * l.direction +
            ((n = l.parent) != null && n.isroot
              ? 0
              : this.pSpace * l.direction),
          m = s + a / 2;
        (t[l.id] = new B(c, m)), (s += a + this.vSpace), (i += a);
      }
    }
    e.length > 1 && (i += this.vSpace * (e.length - 1));
    {
      const s = i / 2;
      for (let r = 0, d = e.length; r < d; r++) t[e[r].id].y -= s;
    }
    return i;
  }
}
class j {
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
  drawLine(e, t, i, n) {
    const s = this.canvasContext;
    (s.strokeStyle = i),
      (s.lineWidth = this.lineWidth),
      (s.lineCap = n),
      j.bezierTo(s, t.x, t.y, e.x, e.y);
  }
  static bezierTo(e, t, i, n, s) {
    e.beginPath(),
      e.moveTo(t, i),
      e.bezierCurveTo(t + ((n - t) * 2) / 3, i, t, s, n, s),
      e.stroke();
  }
}
class x {
  constructor(e, t, i, n, s) {
    (this.wrapperView = e),
      (this.mindCheese = t),
      (this.textFormatter = i),
      (this.lineWidth = n),
      (this.pSpace = s),
      (this.mcnodes = document.createElement("mcnodes")),
      this.bindEvent();
  }
  bindEvent() {
    this.mcnodes.addEventListener("keydown", (e) => {
      const t = e.target;
      if (
        (console.debug(
          `keydown=${e.keyCode}==${$} tagName=${t.tagName} shiftkey=${e.shiftKey}`,
        ),
        t.tagName != "MCNODE")
      ) {
        console.log(`It's not MCNODE. ${t.tagName}`);
        return;
      }
      ((e.keyCode === $ && !e.shiftKey) || e.keyCode == Z) &&
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
      this.mcnodes.addEventListener("dblclick", this.dblclickHandle.bind(this));
  }
  mousedownHandle(e) {
    const t = e.target,
      i = this.wrapperView.getBindedNodeId(t);
    if (i) {
      if (U(t)) {
        const n = this.mindCheese.mind.getNodeById(i);
        return this.mindCheese.selectNode(n);
      }
    } else this.mindCheese.selectClear();
  }
  clickHandle(e) {
    const t = e.target;
    switch (t.tagName.toLowerCase()) {
      case "mcadder": {
        const i = this.wrapperView.getBindedNodeId(t);
        if (i) {
          const n = this.mindCheese.mind.getNodeById(i);
          if (n) {
            console.log(`element: ${t.tagName.toLowerCase()}`);
            const s = z(),
              r = this.mindCheese.addNode(n, s, "New Node");
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
      const n = this.mindCheese.mind.getNodeById(i);
      if (n.viewData.element.contentEditable == "true") return !1;
      if (!n) throw new Error(`the node[id=${i}] can not be found.`);
      return this.wrapperView.editNodeBegin(n), !1;
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
    this.createNodeElement(e, this.mcnodes), x.initNodeSize(e);
  }
  static initNodeSize(e) {
    const t = e.viewData;
    t.elementSizeCache = new C(t.element.clientWidth, t.element.clientHeight);
  }
  createNodeElement(e, t) {
    const i = document.createElement("mcnode");
    if (e.isroot) i.className = "root";
    else {
      const n = document.createElement("mcadder");
      (n.innerText = "-"),
        n.setAttribute("nodeid", e.id),
        (n.style.visibility = "hidden"),
        t.appendChild(n),
        (e.viewData.adder = n);
    }
    e.topic && (i.innerHTML = this.textFormatter.render(e.topic)),
      i.setAttribute("nodeid", e.id),
      (i.style.visibility = "hidden"),
      t.appendChild(i),
      (e.viewData.element = i);
  }
  cacheNodeSize() {
    const e = this.mindCheese.mind.nodes;
    for (const t of Object.values(e)) x.initNodeSize(t);
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
    for (const n of Object.values(t)) {
      const s = n.viewData,
        r = s.element,
        d = e.getTopLeft(n, this.lineWidth);
      if (
        ((s.elementTopLeft = i.convertCenterOfNodeOffsetFromRootNode(d)),
        (r.style.left = s.elementTopLeft.x + "px"),
        (r.style.top = s.elementTopLeft.y + "px"),
        (r.style.display = ""),
        (r.style.visibility = "visible"),
        !n.isroot && n.children.length == 0)
      ) {
        const l = s.adder,
          h = "+",
          a = i.convertCenterOfNodeOffsetFromRootNode(
            e.getAdderPosition(n, this.pSpace),
          );
        (l.style.left = a.x + "px"),
          (l.style.top = a.y + "px"),
          (l.style.display = ""),
          (l.style.visibility = "visible"),
          (l.innerText = h);
      }
    }
  }
}
class we {
  constructor(e, t) {
    (this.x = e), (this.y = t);
  }
}
class ge {
  constructor(e) {
    (this.graphCanvas = e), (this.lineWidth = this.graphCanvas.lineWidth);
  }
  renderLines(e, t, i) {
    this.graphCanvas.clear();
    for (const n of Object.values(e.nodes).filter((s) => !s.isroot)) {
      const s = t.getNodePointIn(n);
      {
        const r = t.getNodePointOut(n.parent, n);
        this.graphCanvas.drawLine(
          i.convertCenterOfNodeOffsetFromRootNode(r),
          i.convertCenterOfNodeOffsetFromRootNode(s),
          n.color,
          "round",
        );
      }
      {
        const r = new E(
          s.x + n.viewData.elementSizeCache.width * n.direction,
          s.y,
        );
        this.graphCanvas.drawLine(
          i.convertCenterOfNodeOffsetFromRootNode(r),
          i.convertCenterOfNodeOffsetFromRootNode(s),
          n.color,
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
  constructor(e, t, i, n, s, r, d, l) {
    (this.zoomScale = 1),
      (this.layoutResult = null),
      (this.mindCheese = e),
      (this.textFormatter = s),
      (this.layoutEngine = r),
      (this.pSpace = d),
      (this.graphView = new ge(n)),
      (this.nodesView = new x(this, this.mindCheese, s, l, this.pSpace)),
      (this.size = new C(0, 0)),
      (this.hMargin = t),
      (this.vMargin = i),
      (this.mindCheese = e),
      (this.wrapperElement = document.createElement("div")),
      (this.wrapperElement.className = "mindcheese-inner"),
      this.wrapperElement.appendChild(n.element()),
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
      n = i.width + this.hMargin * 2,
      s = i.height + this.vMargin * 2,
      r = this.wrapperElement.clientWidth,
      d = this.wrapperElement.clientHeight;
    return (
      console.log(`expandSize: ${d} ${s}`),
      new C(Math.max(r, n), Math.max(d, s))
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
      const i = this.layoutResult.getOffsetOfTheRootNode(this.mindCheese.mind);
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
    function i(n) {
      const s = document.createRange();
      s.selectNodeContents(n);
      const r = window.getSelection();
      r.removeAllRanges(), r.addRange(s);
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
          (e.viewData.elementSizeCache = new C(t.clientWidth, t.clientHeight)),
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
      (this.size = this.getCanvasSize(this.layoutResult, this.mindCheese.mind)),
      console.log(`doShow: ${this.size.width} ${this.size.height}`),
      this.graphView.setSize(this.size.width, this.size.height),
      this.mindCheese.draggable.resize(this.size.width, this.size.height),
      this.setSize(this.size.width, this.size.height),
      this.nodesView.renderNodes(this.layoutResult);
    const e = this.layoutResult.getOffsetOfTheRootNode(this.mindCheese.mind);
    this.graphView.renderLines(this.mindCheese.mind, this.layoutResult, e);
  }
}
class ve {
  constructor() {
    this.eventHandlersMap = { 1: [] };
  }
  addEventListener(e, t) {
    this.eventHandlersMap[e].push(t);
  }
  invokeEventHandler(e, t) {
    const i = this.eventHandlersMap[e].length;
    for (let n = 0; n < i; n++) this.eventHandlersMap[e][n](t);
  }
}
class V {
  constructor(e, t = new re()) {
    if (!e) throw new Error("container shouldn't be null!");
    (this.container = e),
      (this.options = t),
      (this.mind = new _()),
      (this.editable = !0),
      (this.eventRouter = new ve());
    const i = new j(t.view.lineColor, t.view.lineWidth),
      n = new I(t.layout.hspace, t.layout.vspace, t.layout.pspace);
    (this.wrapperView = new H(
      this,
      t.view.hmargin,
      t.view.vmargin,
      i,
      t.view.renderer,
      n,
      t.layout.pspace,
      t.view.lineWidth,
    )),
      (this.shortcut = new Q(this, t.shortcut.enable, t.shortcut.mappings)),
      (this.draggable = new L(this)),
      (this.undoManager = new ne(this)),
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
    if (!this.editable) throw new Error("fail, this mind map is not editable");
  }
  setTheme(e) {
    const t = this.options.theme;
    (this.options.theme = e),
      t !== this.options.theme && this.wrapperView.setTheme(this.options.theme);
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
    this.showMind(G(e));
  }
  showMarkdown(e) {
    this.showMind(ue(e));
  }
  getMarkdown() {
    return he(this.mind);
  }
  getNodeTree() {
    return this.mind.root.toObject();
  }
  addNode(e, t, i) {
    this.checkEditable(),
      this.undoManager.recordSnapshot(),
      (e.viewData.adder.style.display = "none");
    const n = this.mind.addNode(e, t, i, null, null);
    return (
      n &&
        (this.wrapperView.nodesView.addNode(n),
        this.wrapperView.renderAgain(),
        this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind)),
      n
    );
  }
  insertNodeAfter(e, t, i) {
    this.checkEditable(), this.undoManager.recordSnapshot();
    const n = this.mind.insertNodeAfter(e, t, i);
    return (
      this.wrapperView.nodesView.addNode(n),
      this.wrapperView.renderAgain(),
      this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind),
      n
    );
  }
  removeNode(e) {
    if ((this.checkEditable(), e.isroot))
      throw new Error("fail, cannot remove root node");
    const t = e.id,
      i = e.parent;
    this.undoManager.recordSnapshot();
    const n = V.findUpperBrotherOrParentNode(i, t),
      s = this.wrapperView.saveScroll(e);
    return (
      this.wrapperView.removeNode(e),
      this.mind.removeNode(e),
      this.wrapperView.renderAgain(),
      i.children.length > 0 &&
        ((this.mind.selected = n), this.wrapperView.selectNode(n)),
      this.wrapperView.restoreScroll(i, s),
      this.eventRouter.invokeEventHandler(g.AfterEdit, this.mind),
      !0
    );
  }
  static findUpperBrotherOrParentNode(e, t) {
    const i = e.children;
    for (let n = 0; n < i.length; n++)
      if (i[n].id == t) return n == 0 ? e : i[n - 1];
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
  moveNode(e, t, i, n) {
    console.log(`jm.move_node: ${e.id} ${t} ${i.id} ${n}`),
      this.checkEditable(),
      this.undoManager.recordSnapshot(),
      this.mind.moveNode(e, t, i, n),
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
    this.mind && ((this.mind.selected = null), this.wrapperView.selectClear());
  }
  findNodeBefore(e) {
    if (e.isroot) return null;
    if (e.parent.isroot) {
      const t = e.parent.children.filter((i) => i.direction === e.direction);
      for (let i = 0; i < t.length; i++) {
        const n = t[i];
        if (e.id === n.id) return i !== 0 ? t[i - 1] : null;
      }
      throw new Error(`Missing the node in parent: ${e.id}`);
    } else return this.mind.getNodeBefore(e);
  }
  findNodeAfter(e) {
    if (e.isroot) return null;
    if (e.parent.isroot) {
      const t = e.parent.children.filter((i) => i.direction == e.direction);
      for (let i = 0; i < t.length; i++) {
        const n = t[i];
        if (e.id === n.id) return i + 1 < t.length ? t[i + 1] : null;
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
          this.moveNode(e, R, e.parent, e.direction),
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
const Ne = {
    id: "root",
    topic: "mindCheese 🧀",
    children: [
      {
        id: "easy",
        topic: "Easy",
        direction: "left",
        children: [
          { id: "easy1", topic: "Easy to show" },
          { id: "easy2", topic: "Easy to edit" },
          { id: "easy3", topic: "Easy to store" },
          { id: "easy4", topic: "Easy to embed" },
        ],
      },
      {
        id: "open",
        topic: "Open Source",
        direction: "right",
        children: [
          { id: "open1", topic: "on GitHub" },
          { id: "open2", topic: "BSD License" },
        ],
      },
      {
        id: "powerful",
        topic: "Powerful",
        direction: "right",
        children: [
          { id: "powerful1", topic: "Base on **TypeScript**" },
          {
            id: "powerful2",
            topic: "Base on **jsMind**",
            children: [
              { id: "jsMind1", topic: "Base on HTML5" },
              { id: "jsMind2", topic: "Supported CJK chars" },
            ],
          },
          { id: "powerful4", topic: "Depends on you" },
        ],
      },
      {
        id: "other",
        topic: "test node",
        direction: "left",
        children: [
          { id: "other1", topic: "I'm from local variable" },
          { id: "other2", topic: "I can do everything: `3*2`" },
          {
            id: "other3",
            topic: `Multi line
Multi line
Multi line
Multi line
Multi line
Multi line
Multi line
Multi line
Multi line`,
            children: [
              { id: "hello1", topic: "こんにちは" },
              { id: "hello2", topic: "Hello" },
              { id: "hello3", topic: "Здравствуйте" },
            ],
          },
          {
            id: "other4",
            topic:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget mauris pharetra et ultrices neque ornare aenean euismod elementum. Tempus egestas sed sed risus. Lacus vel facilisis volutpat est velit egestas. Odio aenean sed adipiscing diam donec adipiscing tristique risus. Eu ultrices vitae auctor eu augue ut lectus. Nulla pharetra diam sit amet. Integer quis auctor elit sed vulputate mi sit amet. Interdum varius sit amet mattis vulputate enim nulla aliquet. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Sed euismod nisi porta lorem. Suspendisse potenti nullam ac tortor. Curabitur gravida arcu ac tortor.",
          },
        ],
      },
    ],
  },
  Ee = `- マークダウンのテスト
  - a1
    - b1
        - dddddddddddddddddddd1
          - eeeeeeeeeeeeeeeeeeeeee2
            - ffffffffffffffffffffff3
              - gggggggggggggggggggggggggg3
                - hhhhhhhhhhhhhhhhhhhhhh2
                  - iiiiiiiiiiiiii52iiiiiiiiiii
                    - jjjjjjjjjjjjjj25jjjjjjjjjjjj
                      - kkkkkkkkk2342kkkkkkkkkkkkkkkkk2
                        - lllllllllll52llllllllllllllllllll
    - b2
    - b3
      - c1
      - c2
        - dddddddddddddddddddd
          - eeeeeeeeeeeeeeeeeeeeee
            - ffffffffffffffffffffff
              - gggggggggggggggggggggggggg
                - hhhhhhhhhhhhhhhhhhhhhh
                  - iiiiiiiiiiiiiiiiiiiiiiiii
                    - jjjjjjjjjjjjjjjjjjjjjjjjjj
                      - kkkkkkkkkkkkkkkkkkkkkkkkkk
                        - lllllllllllllllllllllllllllllll
  + a2 \\
    複数行だよ
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
`;
var ye = {};
console.log("Loaded browser.ts!111");
function P(o, e) {
  const t = document.createElement("a");
  t.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(e),
  ),
    t.setAttribute("download", o),
    (t.style.display = "none"),
    document.body.appendChild(t),
    t.click(),
    document.body.removeChild(t);
}
function Ce() {
  const o = document.getElementById("container"),
    e = new V(o);
  (this.mindCheese = e),
    e.showNodeTree(Ne),
    e.addEventListener(g.AfterEdit, (i) => {
      console.log("AfterEdit"), console.log(i);
    }),
    document.getElementById("download_json").addEventListener("click", () => {
      const i = e.getNodeTree();
      return (
        P(
          encodeURIComponent(e.mind.root.topic) + ".json",
          JSON.stringify(i, null, 2),
        ),
        !1
      );
    }),
    document
      .getElementById("download_markdown")
      .addEventListener("click", () => {
        const i = e.getMarkdown();
        return P(encodeURIComponent(e.mind.root.topic) + ".md", i), !1;
      }),
    document
      .getElementById("undo")
      .addEventListener("click", () => (e.undo(), !1)),
    ye.BUILD == "development"
      ? document
          .getElementById("load_markdown")
          .addEventListener("click", () => (e.showMarkdown(Ee), !1))
      : (document.getElementById("navItemDebug").style.display = "none");
  let t = !0;
  document
    .getElementById("toggle_theme")
    .addEventListener(
      "click",
      () => (e.setTheme(t ? "dark" : "primary"), (t = !t), !1),
    );
}
window.initDemo = Ce;
