import GraphCanvas from "./GraphCanvas";
import MindNode from "./model/MindNode";
import {Direction, KEYCODE_ENTER, KEYCODE_ESC} from "./MindmapConstants";
import MindCheese from "./MindCheese";
import LayoutProvider, {OffsetFromTopLeftOfMcnodes, Point, RootNodeOffsetFromTopLeftOfMcnodes,} from "./LayoutProvider";
import {TextFormatter} from "./renderer/TextFormatter";
import {Size} from "./Size";

/**
 * View renderer
 */
export default class ViewProvider {
  private readonly mindCheese: MindCheese;
  private readonly layout: LayoutProvider;
  readonly mindCheeseInnerElement: HTMLDivElement; // div.mindcheese-inner
  readonly mcnodes: HTMLElement; // <mcnodes>
  size: Size;
  private selectedNode: MindNode | null;
  private editingNode: MindNode | null;
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
      this.layoutAgain();
    });
    this.mcnodes.addEventListener("input", () => {
      // TODO is this required?
      this.layoutAgain();
    });
    // when the element lost focus.
    this.mcnodes.addEventListener(
      "blur",
      (e: FocusEvent) => {
        const el = e.target as HTMLElement;
        if (el.tagName.toLowerCase() != "mcnode") {
          return;
        }

        this.editNodeEnd();
      },
      true
    );

    this.mindCheeseInnerElement = document.createElement("div");
    this.mindCheeseInnerElement.className = "mindcheese-inner";
    this.mindCheeseInnerElement.appendChild(graph.element());
    this.mindCheeseInnerElement.appendChild(this.mcnodes);

    this.size = new Size(0, 0);

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
      return this.getBindedNodeId(element.parentElement!);
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
      this.mcnodes.parentElement!.className = "theme-" + themeName;
    } else {
      this.mcnodes.parentElement!.className = "";
    }
  }

  createNodes() {
    const nodes = this.mindCheese.mind.nodes;

    const documentFragment = document.createDocumentFragment();
    for (const node of Object.values(nodes)) {
      this.createNodeElement(node, documentFragment);
    }
    this.mcnodes.appendChild(documentFragment);
  }

  cacheNodeSize() {
    const nodes = this.mindCheese.mind.nodes;

    for (const node of Object.values(nodes)) {
      ViewProvider.initNodeSize(node);
    }
  }

  private getCanvasSize(): Size {
    const minSize = this.layout.getBounds().size;

    const minWidth = minSize.width + this.hMargin * 2;
    const minHeight = minSize.height + this.vMargin * 2;
    const clientW = this.mindCheeseInnerElement.clientWidth;
    const clientH = this.mindCheeseInnerElement.clientHeight;

    console.log(`expandSize: ${clientH} ${minHeight}`);
    return new Size(
      Math.max(clientW, minWidth),
      Math.max(clientH, minHeight)
    );
  }

  private static initNodeSize(node: MindNode): void {
    const viewData = node.data.view;
    viewData.width = viewData.element!.clientWidth;
    viewData.height = viewData.element!.clientHeight;
  }

  addNode(node: MindNode): void {
    this.createNodeElement(node, this.mcnodes);
    ViewProvider.initNodeSize(node);
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
      node.data.view.element!.contentEditable = "false";
      this.editingNode = null;
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      this.removeNode(node.children[i]);
    }
    if (node.data.view) {
      const element = node.data.view.element!;
      const expander = node.data.view.expander!;
      this.mcnodes.removeChild(element);
      this.mcnodes.removeChild(expander);
      node.data.view.element = null;
      node.data.view.expander = null;
    }
  }

  updateNode(node: MindNode): void {
    const viewData = node.data.view;
    const element = viewData.element!;
    if (node.topic) {
      element.innerHTML = this.textFormatter.render(node.topic);
    }
    viewData.width = element.clientWidth;
    viewData.height = element.clientHeight;
  }

  private _selectClear(): void {
    if (this.selectedNode) {
      const el = this.selectedNode.data.view.element!;
      el.classList.remove("selected");
    }
  }

  selectNode(node: MindNode | null): void {
    this._selectClear();
    if (node) {
      this.selectedNode = node;
      node.data.view.element!.classList.add("selected");
      // Note: scrollIntoView is not the best method.
      this.adjustScrollBar(node);
    }
  }

  // Adjust the scroll bar. show node in the browser.
  adjustScrollBar(node: MindNode): void {
    const nodeEl = node.data.view.element!;
    const panelEl = this.mindCheeseInnerElement;
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
    this._selectClear();
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

    const element = node.data.view.element!;
    element.contentEditable = "true";
    element.innerText = node.topic;
    node.data.view.width = element.clientWidth;

    // https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element
    function selectElementContents(el: HTMLElement) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
    }

    selectElementContents(element);
    element.focus();

    this.layoutAgain();
  }

  editNodeEnd(): void {
    console.log(`editNodeEnd(editingNode=${this.editingNode})`);
    if (this.editingNode != null) {
      const node = this.editingNode;
      this.editingNode = null;

      const element = node.data.view.element!;
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
        this.layoutAgain();
      } else {
        console.debug("Calling updateNode");
        this.mindCheese.updateNode(node.id, topic);
      }
    }
  }

  // get the center point offset
  getOffsetOfTheRootNode(): RootNodeOffsetFromTopLeftOfMcnodes {
    const bounds = this.layout.getBounds();
    console.log(
      `getViewOffset: size.w=${this.size.width}, e=${bounds.e}, w=${bounds.w}`
    );
    const x = -bounds.w + this.mindCheese.mind.root!.data.view.width / 2;
    // const x = (this.size.w - bounds.e - bounds.w) / 2;
    const y = -bounds.n + this.mindCheese.mind.root!.data.view.height / 2;
    return new RootNodeOffsetFromTopLeftOfMcnodes(x, y);
  }

  resize(): void {
    this.graph.setSize(1, 1);
    this.mcnodes.style.width = "1px";
    this.mcnodes.style.height = "1px";

    this.layoutAgain();
  }
  // Display root position at center of container element.
  centerRoot(): void {
    const outerW = this.mindCheeseInnerElement.clientWidth;
    const outerH = this.mindCheeseInnerElement.clientHeight;
    if (this.size.width > outerW) {
      const offset = this.getOffsetOfTheRootNode();
      this.mindCheeseInnerElement.scrollLeft = offset.x - outerW / 2;
    }
    if (this.size.height > outerH) {
      this.mindCheeseInnerElement.scrollTop = (this.size.height - outerH) / 2;
    }
  }

  layoutAgain(): void {
    this.layout.setVisibleRecursively(this.mindCheese.mind.root!, true);
    this.layout.layout();
    this.size = this.getCanvasSize();

    console.log(`doShow: ${this.size.width} ${this.size.height}`);
    this.graph.setSize(this.size.width, this.size.height);
    this.mcnodes.parentElement!.style.width = this.size.width + "px";
    this.mcnodes.parentElement!.style.height = this.size.height + "px";
    this.showNodes();
    this.showLines();
    this.mindCheese.draggable.resize();
  }

  takeLocation(node: MindNode): Point {
    const viewData = node.data.view;
    return new Point(
      parseInt(viewData.element!.style.left) -
        this.mindCheeseInnerElement.scrollLeft,
      parseInt(viewData.element!.style.top) -
        this.mindCheeseInnerElement.scrollTop
    );
  }

  restoreLocation(node: MindNode, location: Point): void {
    const viewData = node.data.view;
    this.mindCheeseInnerElement.scrollLeft =
      parseInt(viewData.element!.style.left) - location.x;
    this.mindCheeseInnerElement.scrollTop =
      parseInt(viewData.element!.style.top) - location.y;
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
    const offset = this.getOffsetOfTheRootNode();
    for (const nodeid in nodes) {
      const node = nodes[nodeid];
      const viewData = node.data.view;
      const nodeElement = viewData.element!;
      const expander = viewData.expander!;
      if (!node.data.layout.visible) {
        nodeElement.style.display = "none";
        expander.style.display = "none";
        continue;
      }
      const p = this.layout.getNodePoint(node);
      viewData.location = offset.convertCenterOfNodeOffsetFromRootNode(p);
      nodeElement.style.left = viewData.location.x + "px";
      nodeElement.style.top = viewData.location.y + "px";
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
    const offset = this.getOffsetOfTheRootNode();
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
          node.parent!,
          node
        );
        this.graph.drawLine(pout, pin, offset, node.color!, "round");
      }
      {
        // Draw line under the bottom of the node
        const pin: Point = this.layout.getNodePointIn(node);
        const pout = new Point(
          pin.x -
            node.data.view.width * (node.direction == Direction.LEFT ? 1 : -1),
          pin.y
        );
        this.graph.drawLine(pout, pin, offset, node.color!, "butt");
      }
    }
  }
}
