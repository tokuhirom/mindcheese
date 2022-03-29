import { MindNode } from "./model/MindNode";
import { MindCheese } from "./MindCheese";
import { TextFormatter } from "./renderer/TextFormatter";
import { Size } from "./model/Size";
import { ScrollSnapshot } from "./view/wrapper/ScrollSnapshot";
import { LayoutResult } from "./layout/LayoutResult";
import { LayoutEngine } from "./layout/LayoutEngine";
import { GraphCanvas } from "./view/graph/GraphCanvas";
import { GraphView } from "./view/graph/GraphView";
import { NodesView } from "./view/node/NodesView";
import { WrapperView } from "./view/wrapper/WrapperView";

/**
 * View renderer
 */
export class ViewProvider {
  private readonly mindCheese: MindCheese;
  private readonly layoutEngine: LayoutEngine;
  size: Size;
  private selectedNode: MindNode | null;
  private editingNode: MindNode | null;
  private readonly graphView: GraphView;
  private readonly textFormatter: TextFormatter;
  private layoutResult: LayoutResult | null = null;
  private readonly pSpace: number;
  readonly nodesView: NodesView; // TODO make this private
  readonly wrapperView: WrapperView; // TODO make this private

  /**
   *
   * @param mindCheese MindCheese instance
   * @param hmargin ???
   * @param vmargin ???
   * @param graphCanvas instance of GraphCanvas
   * @param textFormatter Formatter of the text
   * @param layoutEngine
   * @param pSpace Horizontal spacing between node and connection line (to place node adder)
   * @param lineWidth
   */
  constructor(
    mindCheese: MindCheese,
    hmargin: number,
    vmargin: number,
    graphCanvas: GraphCanvas,
    textFormatter: TextFormatter,
    layoutEngine: LayoutEngine,
    pSpace: number,
    lineWidth: number
  ) {
    this.mindCheese = mindCheese;
    this.textFormatter = textFormatter;
    this.layoutEngine = layoutEngine;
    this.pSpace = pSpace;

    this.graphView = new GraphView(graphCanvas);
    this.nodesView = new NodesView(
      this,
      this.mindCheese,
      textFormatter,
      lineWidth,
      this.pSpace
    );
    this.wrapperView = new WrapperView(
      hmargin,
      vmargin,
      this.nodesView,
      graphCanvas
    );

    this.size = new Size(0, 0);

    this.selectedNode = null;
    this.editingNode = null;
  }

  init(container: HTMLElement): void {
    console.debug("view.init");
    this.wrapperView.attach(container);
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
    this.graphView.clear();
    this.nodesView.clearNodes();
    this.resetTheme();
  }

  resetTheme(): void {
    this.wrapperView.setTheme(this.mindCheese.options.theme);
  }

  removeNode(node: MindNode): void {
    if (this.selectedNode != null && this.selectedNode.id == node.id) {
      this.selectedNode = null;
    }
    if (this.editingNode != null && this.editingNode.id == node.id) {
      node.viewData.element!.contentEditable = "false";
      this.editingNode = null;
    }
    for (let i = 0, l = node.children.length; i < l; i++) {
      this.removeNode(node.children[i]);
    }
    if (node.viewData) {
      this.nodesView.removeNode(node);
    }
  }

  updateNode(node: MindNode): void {
    const viewData = node.viewData;
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
      const el = this.selectedNode.viewData.element!;
      el.classList.remove("selected");
    }
    if (node) {
      this.selectedNode = node;
      node.viewData.element!.classList.add("selected");
      // Note: scrollIntoView is not the best method.
      ViewProvider.adjustScrollBar(node);
    }
  }

  // Adjust the scroll bar. show node in the browser.
  private static adjustScrollBar(node: MindNode): void {
    const nodeEl = node.viewData.element!;

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
      const el = this.selectedNode.viewData.element!;
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

    const element = node.viewData.element!;
    element.contentEditable = "true";
    element.innerText = node.topic;
    node.viewData.elementSizeCache = new Size(
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

      const element = node.viewData.element!;
      element.contentEditable = "false";
      const topic = element.innerText;
      if (
        !topic ||
        topic.replace(/\s*/, "").length == 0 ||
        node.topic === topic
      ) {
        console.debug("Calling updateNode");
        element.innerHTML = this.textFormatter.render(node.topic);
        node.viewData.elementSizeCache = new Size(
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

  resetSize(): void {
    this.graphView.setSize(1, 1);
    this.nodesView.resetSize();
    this.renderAgain();
  }

  // Display root position at center of container element.
  centerRoot(): void {
    this.wrapperView.centerRoot(
      this.layoutResult!,
      this.size,
      this.mindCheese.mind
    );
  }

  // TODO pull this method to MindCheese?
  renderAgain(): void {
    this.layoutResult = this.layoutEngine.layout(this.mindCheese.mind);
    this.size = this.wrapperView.getCanvasSize(
      this.layoutResult,
      this.mindCheese.mind
    );

    console.log(`doShow: ${this.size.width} ${this.size.height}`);
    this.graphView.setSize(this.size.width, this.size.height);
    this.mindCheese.draggable.resize(this.size.width, this.size.height);
    this.wrapperView.setSize(this.size.width, this.size.height);

    this.nodesView.renderNodes(this.layoutResult!);

    const offset = this.layoutResult!.getOffsetOfTheRootNode(
      this.mindCheese.mind
    );
    this.graphView.renderLines(this.mindCheese.mind, this.layoutResult, offset);
  }

  saveScroll(node: MindNode): ScrollSnapshot {
    return this.wrapperView.saveScroll(node);
  }

  restoreScroll(node: MindNode, scrollSnapshot: ScrollSnapshot): void {
    this.wrapperView.restoreScroll(node, scrollSnapshot);
  }
}
