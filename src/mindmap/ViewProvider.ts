import GraphCanvas from "./GraphCanvas";
import MindNode from "./MindNode";
import { Direction, KEYCODE_ENTER, KEYCODE_ESC } from "./MindmapConstants";
import MindCheese from "./MindCheese";
import LayoutProvider, { Point } from "./LayoutProvider";
import { TextFormatter } from "./renderer/TextFormatter";
import { Size } from "./Size";

/**
 * View renderer
 */
export default class ViewProvider {
  private readonly mindCheese: MindCheese;
  private readonly layout: LayoutProvider;
  readonly mindCheeseInnerElement: HTMLDivElement; // div.mindcheese-inner
  readonly mcnodes: HTMLElement; // <mcnodes>
  size: Size;
  private selectedNode: MindNode;
  private editingNode: MindNode;
  private readonly graph: GraphCanvas;
  private readonly textFormatter: TextFormatter;
  private readonly hMargin: number;
  private readonly vMargin: number;

  /**
   *
   * @param mindCheese MindCheese instance
   * @param container container element
   * @param hmargin ???
   * @param vmargin ???
   * @param graph instance of GraphCanvas
   * @param textFormatter Formatter of the text
   */
  constructor(
    mindCheese: MindCheese,
    hmargin: number,
    vmargin: number,
    graph: GraphCanvas,
    textFormatter: TextFormatter
  ) {
    this.mindCheese = mindCheese;
    this.textFormatter = textFormatter;
    this.layout = mindCheese.layout;

    this.mcnodes = document.createElement("mcnodes");

    this.mcnodes.addEventListener("keydown", (e) => {
      const el = e.target as HTMLElement;
      console.debug(
        `keydown=${e.keyCode}==${KEYCODE_ENTER} tagName=${el.tagName} shiftkey=${e.shiftKey}`
      );
      if (el.tagName != "MCNODE") {
        console.log(`It's not MCNODE. ${el.tagName}`);
        return;
      }

      // https://qiita.com/ledsun/items/31e43a97413dd3c8e38e
      // keyCode is deprecated field. But it's a hack for Japanese IME.
      // noinspection JSDeprecatedSymbols
      if (
        (e.keyCode === KEYCODE_ENTER && !e.shiftKey) ||
        e.keyCode == KEYCODE_ESC
      ) {
        console.log("editNodeEnd");
        e.stopPropagation();
        e.preventDefault();
        this.editNodeEnd();
      }
    });
    // adjust size dynamically.
    this.mcnodes.addEventListener("keyup", () => {
      this.layout.layout();
      this.show();
    });
    this.mcnodes.addEventListener("input", () => {
      // TODO is this required?
      this.layout.layout();
      this.show();
    });
    // when the element lost focus.
    this.mcnodes.addEventListener("blur", (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName != "mcnode") {
        return;
      }

      this.editNodeEnd();
    });

    this.mindCheeseInnerElement = document.createElement("div");
    this.mindCheeseInnerElement.className = "mindcheese-inner";
    this.mindCheeseInnerElement.appendChild(graph.element());
    this.mindCheeseInnerElement.appendChild(this.mcnodes);

    this.size = { w: 0, h: 0 };

    this.selectedNode = null;
    this.editingNode = null;

    this.hMargin = hmargin;
    this.vMargin = vmargin;

    this.graph = graph;
  }

  init(container: HTMLElement): void {
    console.debug("view.init");
    container.appendChild(this.mindCheeseInnerElement);
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
      this.mcnodes.parentElement.className = "theme-" + themeName;
    } else {
      this.mcnodes.parentElement.className = "";
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
    // console.debug(`ViewProvider.expand_size:
    // min_width=${minWidth}
    // min_height=${minHeight}
    // client_w=${clientW}
    // client_h=${clientH}`);
    if (clientW < minWidth) {
      clientW = minWidth;
    }
    if (clientH < minHeight) {
      clientH = minHeight;
    }

    this.size = new Size(clientW, clientH);
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
      nodeEl.innerHTML = this.textFormatter.render(node.topic);
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
      node.data.view.element.contentEditable = "false";
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
      element.innerHTML = this.textFormatter.render(node.topic);
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
      // Adjust the scroll bar. show node in the browser.
      node.data.view.element.scrollIntoView();
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
    console.log("editNodeBegin");
    this.editingNode = node;

    const element: HTMLElement = node.data.view.element;
    element.contentEditable = "true";
    element.innerText = node.topic;
    if (element.getAttribute("mc-initialized") !== "done") {
      element.addEventListener("blur", (e) => {
        this.editNodeEnd();
      });
      element.setAttribute("mc-initialized", "done");
    }
    node.data.view.width = element.clientWidth;
    element.focus();

    this.layout.layout();
    this.show();
  }

  editNodeEnd(): void {
    console.log(`editNodeEnd(editingNode=${this.editingNode})`);
    if (this.editingNode != null) {
      const node = this.editingNode;
      this.editingNode = null;

      const element = node.data.view.element;
      element.contentEditable = "false";
      const topic = element.innerText;
      if (
        !topic ||
        topic.replace(/\s*/, "").length == 0 ||
        node.topic === topic
      ) {
        console.debug("Calling updateNode");
        element.innerHTML = this.textFormatter.render(node.topic);
        node.data.view.width = element.clientWidth;
        this.layout.layout();
        this.show();
      } else {
        console.debug("Calling updateNode");
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

  resize(): void {
    this.graph.setSize(1, 1);
    this.mcnodes.style.width = "1px";
    this.mcnodes.style.height = "1px";

    this.expandSize();
    this.doShow();
  }

  private doShow(): void {
    this.graph.setSize(this.size.w, this.size.h);
    this.mcnodes.parentElement.style.width = this.size.w + "px";
    this.mcnodes.parentElement.style.height = this.size.h + "px";
    this.showNodes();
    this.showLines();
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
    const viewData = node.data.view;
    return new Point(
      parseInt(viewData.element.style.left) -
        this.mindCheeseInnerElement.scrollLeft,
      parseInt(viewData.element.style.top) -
        this.mindCheeseInnerElement.scrollTop
    );
  }

  restoreLocation(node: MindNode, location: Point): void {
    const viewData = node.data.view;
    this.mindCheeseInnerElement.scrollLeft =
      parseInt(viewData.element.style.left) - location.x;
    this.mindCheeseInnerElement.scrollTop =
      parseInt(viewData.element.style.top) - location.y;
  }

  clearNodes(): void {
    const mind = this.mindCheese.mind;
    if (mind == null) {
      return;
    }
    const nodes = mind.nodes;
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      node.data.view.element = null;
      node.data.view.expander = null;
    }
    this.mcnodes.innerHTML = "";
  }

  showNodes(): void {
    const nodes = this.mindCheese.mind.nodes;
    const offset = this.getViewOffset();
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      const viewData = node.data.view;
      const nodeElement = viewData.element;
      const expander = viewData.expander;
      if (!node.data.layout.visible) {
        nodeElement.style.display = "none";
        expander.style.display = "none";
        continue;
      }
      const p = this.layout.getNodePoint(node);
      viewData.location = new Point(offset.x + p.x, offset.y + p.y);
      nodeElement.style.left = offset.x + p.x + "px";
      nodeElement.style.top = offset.y + p.y + "px";
      nodeElement.style.display = "";
      nodeElement.style.visibility = "visible";
      if (!node.isroot && node.children.length > 0) {
        const expanderText = node.expanded ? "-" : "+";
        const expanderPoint = this.layout.getExpanderPoint(node);
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
      {
        // Draw line between previous node and next node
        const pin = this.layout.getNodePointIn(node);
        const pout = this.layout.getNodePointOutWithDestination(
          node.parent,
          node
        );
        this.graph.drawLine(pout, pin, offset, node.color, "round");
      }
      {
        // Draw line under the bottom of the node
        const pin: Point = this.layout.getNodePointIn(node);
        const pout = new Point(
          pin.x -
            node.data.view.width * (node.direction == Direction.LEFT ? 1 : -1),
          pin.y
        );
        this.graph.drawLine(pout, pin, offset, node.color, "butt");
      }
    }
  }
}
