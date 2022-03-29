import { GraphCanvas } from "./GraphCanvas";
import { MindNode } from "./model/MindNode";
import { KEYCODE_ENTER, KEYCODE_ESC } from "./MindmapConstants";
import { MindCheese } from "./MindCheese";
import { TextFormatter } from "./renderer/TextFormatter";
import { Size } from "./model/Size";
import { CenterOfNodeOffsetFromRootNode } from "./layout/CenterOfNodeOffsetFromRootNode";
import { RootNodeOffsetFromTopLeftOfMcnodes } from "./layout/RootNodeOffsetFromTopLeftOfMcnodes";
import { ScrollSnapshot } from "./layout/ScrollSnapshot";
import { LayoutResult } from "./layout/LayoutResult";
import { LayoutEngine } from "./layout/LayoutEngine";

/**
 * View renderer
 */
export class ViewProvider {
  private readonly mindCheese: MindCheese;
  private readonly layoutEngine: LayoutEngine;
  readonly mindCheeseInnerElement: HTMLDivElement; // div.mindcheese-inner
  readonly mcnodes: HTMLElement; // <mcnodes>
  size: Size;
  private selectedNode: MindNode | null;
  private editingNode: MindNode | null;
  private readonly graph: GraphCanvas;
  private readonly textFormatter: TextFormatter;
  private readonly hMargin: number;
  private readonly vMargin: number;
  private layoutResult: LayoutResult | null = null;
  private readonly pSpace: number;

  /**
   *
   * @param mindCheese MindCheese instance
   * @param hmargin ???
   * @param vmargin ???
   * @param graph instance of GraphCanvas
   * @param textFormatter Formatter of the text
   * @param layoutEngine
   * @param pSpace Horizontal spacing between node and connection line (to place node adder)
   */
  constructor(
    mindCheese: MindCheese,
    hmargin: number,
    vmargin: number,
    graph: GraphCanvas,
    textFormatter: TextFormatter,
    layoutEngine: LayoutEngine,
    pSpace: number
  ) {
    this.mindCheese = mindCheese;
    this.textFormatter = textFormatter;
    this.layoutEngine = layoutEngine;
    this.pSpace = pSpace;

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
      this.renderAgain();
    });
    this.mcnodes.addEventListener("input", () => {
      // TODO is this required?
      this.renderAgain();
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
    if (tagName === "mcnode" || tagName == "mcadder") {
      return element.getAttribute("nodeid");
    } else {
      return this.getBindedNodeId(element.parentElement!);
    }
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
    const minSize = this.layoutResult!.getBounds(this.mindCheese.mind).size;

    const minWidth = minSize.width + this.hMargin * 2;
    const minHeight = minSize.height + this.vMargin * 2;
    const clientW = this.mindCheeseInnerElement.clientWidth;
    const clientH = this.mindCheeseInnerElement.clientHeight;

    console.log(`expandSize: ${clientH} ${minHeight}`);
    return new Size(Math.max(clientW, minWidth), Math.max(clientH, minHeight));
  }

  private static initNodeSize(node: MindNode): void {
    const viewData = node.data.view;
    viewData.elementSizeCache = new Size(
      viewData.element!.clientWidth,
      viewData.element!.clientHeight
    );
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
      const adderElement = document.createElement("mcadder");
      adderElement.innerText = "-";
      adderElement.setAttribute("nodeid", node.id);
      adderElement.style.visibility = "hidden";
      parentNode.appendChild(adderElement);
      node.data.view.adder = adderElement;
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
      const adder = node.data.view.adder!;
      this.mcnodes.removeChild(element);
      this.mcnodes.removeChild(adder);
      node.data.view.element = null;
      node.data.view.adder = null;
    }
  }

  updateNode(node: MindNode): void {
    const viewData = node.data.view;
    const element = viewData.element!;
    if (node.topic) {
      element.innerHTML = this.textFormatter.render(node.topic);
    }
    viewData.elementSizeCache = new Size(
      element.clientWidth,
      element.clientHeight
    );
  }

  selectNode(node: MindNode | null): void {
    if (this.selectedNode) {
      const el = this.selectedNode.data.view.element!;
      el.classList.remove("selected");
    }
    if (node) {
      this.selectedNode = node;
      node.data.view.element!.classList.add("selected");
      // Note: scrollIntoView is not the best method.
      ViewProvider.adjustScrollBar(node);
    }
  }

  // Adjust the scroll bar. show node in the browser.
  private static adjustScrollBar(node: MindNode): void {
    const nodeEl = node.data.view.element!;

    // https://stackoverflow.com/questions/5685589/scroll-to-element-only-if-not-in-view-jquery
    if (nodeEl.getBoundingClientRect().bottom > window.innerHeight) {
      nodeEl.scrollIntoView(false);
    }

    if (nodeEl.getBoundingClientRect().top < 0) {
      nodeEl.scrollIntoView();
    }

    if (nodeEl.getBoundingClientRect().left > window.innerWidth) {
      nodeEl.scrollIntoView(false);
    }

    if (
      nodeEl.getBoundingClientRect().left < 0 ||
      nodeEl.getBoundingClientRect().right < 0
    ) {
      nodeEl.scrollIntoView();
    }
  }

  selectClear(): void {
    if (this.selectedNode) {
      const el = this.selectedNode.data.view.element!;
      el.classList.remove("selected");
    }
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

    const element = node.data.view.element!;
    element.contentEditable = "true";
    element.innerText = node.topic;
    node.data.view.elementSizeCache = new Size(
      element.clientWidth,
      element.clientHeight
    );

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

    this.renderAgain();
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
        node.data.view.elementSizeCache = new Size(
          element.clientWidth,
          element.clientHeight
        );
        this.renderAgain();
      } else {
        console.debug("Calling updateNode");
        this.mindCheese.updateNode(node.id, topic);
      }
    }
  }

  // get the center point offset
  getOffsetOfTheRootNode(): RootNodeOffsetFromTopLeftOfMcnodes {
    const bounds = this.layoutResult!.getBounds(this.mindCheese.mind);
    console.log(
      `getViewOffset: size.w=${this.size.width}, e=${bounds.e}, w=${bounds.w}`
    );

    const x =
      -bounds.w +
      this.mindCheese.mind.root!.data.view.elementSizeCache!.width / 2;
    // const x = (this.size.w - bounds.e - bounds.w) / 2;
    const y =
      -bounds.n +
      this.mindCheese.mind.root!.data.view.elementSizeCache!.height / 2;
    return new RootNodeOffsetFromTopLeftOfMcnodes(x, y);
  }

  resize(): void {
    this.graph.setSize(1, 1);
    this.mcnodes.style.width = "1px";
    this.mcnodes.style.height = "1px";

    this.renderAgain();
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

  // TODO pull this method to MindCheese?
  renderAgain(): void {
    this.layoutResult = this.layoutEngine.layout(this.mindCheese.mind);
    this.size = this.getCanvasSize();

    console.log(`doShow: ${this.size.width} ${this.size.height}`);
    this.graph.setSize(this.size.width, this.size.height);
    this.mindCheese.draggable.resize(this.size.width, this.size.height);
    this.mcnodes.parentElement!.style.width = this.size.width + "px";
    this.mcnodes.parentElement!.style.height = this.size.height + "px";

    this.showNodes();
    this.showLines();
  }

  saveScroll(node: MindNode): ScrollSnapshot {
    const viewData = node.data.view;
    return new ScrollSnapshot(
      parseInt(viewData.element!.style.left) -
        this.mindCheeseInnerElement.scrollLeft,
      parseInt(viewData.element!.style.top) -
        this.mindCheeseInnerElement.scrollTop
    );
  }

  restoreScroll(node: MindNode, scrollSnapshot: ScrollSnapshot): void {
    const viewData = node.data.view;
    this.mindCheeseInnerElement.scrollLeft =
      parseInt(viewData.element!.style.left) - scrollSnapshot.x;
    this.mindCheeseInnerElement.scrollTop =
      parseInt(viewData.element!.style.top) - scrollSnapshot.y;
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
      node.data.view.adder = null;
    }
    this.mcnodes.innerHTML = "";
  }

  private showNodes(): void {
    const nodes = this.mindCheese.mind.nodes;
    const offset = this.getOffsetOfTheRootNode();

    for (const node of Object.values(nodes)) {
      const viewData = node.data.view;
      const nodeElement = viewData.element!;
      const p = this.layoutResult!.getTopLeft(node, this.graph.lineWidth);
      viewData.elementTopLeft = offset.convertCenterOfNodeOffsetFromRootNode(p);
      nodeElement.style.left = viewData.elementTopLeft.x + "px";
      nodeElement.style.top = viewData.elementTopLeft.y + "px";
      nodeElement.style.display = "";
      nodeElement.style.visibility = "visible";

      if (!node.isroot && node.children.length == 0) {
        const adder = viewData.adder!;
        const adderText = "+";
        const adderPoint = offset.convertCenterOfNodeOffsetFromRootNode(
          this.layoutResult!.getAdderPosition(node, this.pSpace)
        );
        adder.style.left = adderPoint.x + "px";
        adder.style.top = adderPoint.y + "px";
        adder.style.display = "";
        adder.style.visibility = "visible";
        adder.innerText = adderText;
      }
    }
  }

  private showLines(): void {
    this.graph.clear();

    const nodes = this.mindCheese.mind.nodes;
    const offset = this.getOffsetOfTheRootNode();
    for (const node of Object.values(nodes).filter((it) => !it.isroot)) {
      const pin = this.layoutResult!.getNodePointIn(node);
      {
        // Draw line between previous node and next node
        const pout = this.layoutResult!.getNodePointOut(node.parent!, node);
        this.graph.drawLine(
          offset.convertCenterOfNodeOffsetFromRootNode(pout),
          offset.convertCenterOfNodeOffsetFromRootNode(pin),
          node.color!,
          "round"
        );
      }
      {
        // Draw line under the bottom of the node
        const pout = new CenterOfNodeOffsetFromRootNode(
          pin.x + node.data.view.elementSizeCache!.width * node.direction,
          pin.y
        );
        this.graph.drawLine(
          offset.convertCenterOfNodeOffsetFromRootNode(pout),
          offset.convertCenterOfNodeOffsetFromRootNode(pin),
          node.color!,
          "butt"
        );
      }
    }
  }
}
