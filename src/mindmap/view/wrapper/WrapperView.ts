import { Size } from "../../model/Size";
import { LayoutResult } from "../../layout/LayoutResult";
import { Mind } from "../../model/Mind";
import { NodesView } from "../node/NodesView";
import { GraphCanvas } from "../graph/GraphCanvas";
import { MindNode } from "../../model/MindNode";
import { ScrollSnapshot } from "./ScrollSnapshot";
import { GraphView } from "../graph/GraphView";
import { MindCheese } from "../../MindCheese";
import { LayoutEngine } from "../../layout/LayoutEngine";
import { TextFormatter } from "../../renderer/TextFormatter";

export class WrapperView {
  private readonly wrapperElement: HTMLElement;
  private readonly hMargin: number;
  private readonly vMargin: number;
  readonly nodesView: NodesView;
  private zoomScale = 1.0;
  private graphView: GraphView;
  private readonly mindCheese: MindCheese;
  private selectedNode: MindNode | null;
  private editingNode: MindNode | null;

  private readonly layoutEngine: LayoutEngine;
  size: Size;
  private readonly textFormatter: TextFormatter;
  private layoutResult: LayoutResult | null = null;
  private readonly pSpace: number;

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

    this.size = new Size(0, 0);

    this.hMargin = hmargin;
    this.vMargin = vmargin;
    this.mindCheese = mindCheese;

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = "mindcheese-inner";
    this.wrapperElement.appendChild(graphCanvas.element());

    this.nodesView.attach(this.wrapperElement);

    this.selectedNode = null;
    this.editingNode = null;

    this.bindEvents();
  }

  private bindEvents() {
    this.wrapperElement.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey) {
          e.stopPropagation();
          if (e.deltaY > 0) {
            this.zoomScale -= 0.1;
          } else {
            this.zoomScale += 0.1;
          }
          this.zoomScale = Math.min(Math.max(this.zoomScale, 0.2), 20);
          this.zoom(this.zoomScale);
        }
      },
      { passive: true }
    );
  }

  getCanvasSize(layoutResult: LayoutResult, mind: Mind): Size {
    const minSize = layoutResult!.getBounds(mind).size;

    const minWidth = minSize.width + this.hMargin * 2;
    const minHeight = minSize.height + this.vMargin * 2;
    const clientW = this.wrapperElement.clientWidth;
    const clientH = this.wrapperElement.clientHeight;

    console.log(`expandSize: ${clientH} ${minHeight}`);
    return new Size(Math.max(clientW, minWidth), Math.max(clientH, minHeight));
  }

  attach(container: HTMLElement) {
    container.appendChild(this.wrapperElement);
  }

  setTheme(themeName: string) {
    if (themeName) {
      this.wrapperElement!.className = "theme-" + themeName;
    } else {
      this.wrapperElement!.className = "";
    }
  }

  // Display root position at center of container element.
  centerRoot(): void {
    const outerW = this.wrapperElement.clientWidth;
    const outerH = this.wrapperElement.clientHeight;
    if (this.size.width > outerW) {
      const offset = this.layoutResult!.getOffsetOfTheRootNode(
        this.mindCheese.mind
      );
      this.wrapperElement.scrollLeft = offset.x - outerW / 2;
    }
    if (this.size.height > outerH) {
      this.wrapperElement.scrollTop = (this.size.height - outerH) / 2;
    }
  }

  setSize(width: number, height: number) {
    this.wrapperElement!.style.width = width + "px";
    this.wrapperElement!.style.height = height + "px";
  }

  restoreScroll(node: MindNode, scrollSnapshot: ScrollSnapshot) {
    const viewData = node.viewData;
    this.wrapperElement.scrollLeft =
      parseInt(viewData.element!.style.left) - scrollSnapshot.x;
    this.wrapperElement.scrollTop =
      parseInt(viewData.element!.style.top) - scrollSnapshot.y;
  }

  saveScroll(node: MindNode) {
    const viewData = node.viewData;
    return new ScrollSnapshot(
      parseInt(viewData.element!.style.left) - this.wrapperElement.scrollLeft,
      parseInt(viewData.element!.style.top) - this.wrapperElement.scrollTop
    );
  }

  zoom(n: number) {
    this.wrapperElement.style.transform = `scale(${n})`;
  }

  appendChild(element: HTMLCanvasElement) {
    this.wrapperElement.appendChild(element);
  }

  reset(): void {
    console.debug("view.reset");
    this.selectedNode = null;
    this.graphView.clear();
    this.nodesView.clearNodes();
    this.setTheme(this.mindCheese.options.theme);
  }

  selectClear(): void {
    if (this.selectedNode) {
      const el = this.selectedNode.viewData.element!;
      el.classList.remove("selected");
    }
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
      WrapperView.adjustScrollBar(node);
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

  // TODO pull this method to MindCheese?
  renderAgain(): void {
    this.layoutResult = this.layoutEngine.layout(this.mindCheese.mind);
    this.size = this.getCanvasSize(this.layoutResult, this.mindCheese.mind);

    console.log(`doShow: ${this.size.width} ${this.size.height}`);
    this.graphView.setSize(this.size.width, this.size.height);
    this.mindCheese.draggable.resize(this.size.width, this.size.height);
    this.setSize(this.size.width, this.size.height);

    this.nodesView.renderNodes(this.layoutResult!);

    const offset = this.layoutResult!.getOffsetOfTheRootNode(
      this.mindCheese.mind
    );
    this.graphView.renderLines(this.mindCheese.mind, this.layoutResult, offset);
  }
}
