import { KEYCODE_ENTER, KEYCODE_ESC } from "../../MindmapConstants";
import { findMcnode } from "../../utils/DomUtils";
import { generateNewId } from "../../utils/RandomID";
import { MindCheese } from "../../MindCheese";
import { MindNode } from "../../model/MindNode";
import { Size } from "../../model/Size";
import { TextFormatter } from "../../renderer/TextFormatter";
import { LayoutResult } from "../../layout/LayoutResult";
import { WrapperView } from "../wrapper/WrapperView";

export class NodesView {
  private readonly mcnodes: HTMLElement; // <mcnodes>
  private readonly mindCheese: MindCheese;
  private readonly textFormatter: TextFormatter;
  private readonly lineWidth: number;
  private readonly pSpace: number;
  private wrapperView: WrapperView;

  constructor(
    wrapperView: WrapperView,
    mindCheese: MindCheese,
    textFormatter: TextFormatter,
    lineWidth: number,
    pSpace: number,
  ) {
    this.wrapperView = wrapperView;
    this.mindCheese = mindCheese;
    this.textFormatter = textFormatter;
    this.lineWidth = lineWidth;
    this.pSpace = pSpace;

    this.mcnodes = document.createElement("mcnodes");
    this.bindEvent();
  }

  private bindEvent(): void {
    this.mcnodes.addEventListener("keydown", (e) => {
      const el = e.target as HTMLElement;
      console.debug(
        `keydown=${e.keyCode}==${KEYCODE_ENTER} tagName=${el.tagName} shiftkey=${e.shiftKey}`,
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
        this.wrapperView.editNodeEnd();
      }
    });
    // adjust size dynamically.
    this.mcnodes.addEventListener("keyup", () => {
      this.wrapperView.renderAgain();
    });
    this.mcnodes.addEventListener("input", () => {
      // TODO is this required?
      this.wrapperView.renderAgain();
    });
    // when the element lost focus.
    this.mcnodes.addEventListener(
      "blur",
      (e: FocusEvent) => {
        const el = e.target as HTMLElement;
        if (el.tagName.toLowerCase() != "mcnode") {
          return;
        }

        this.wrapperView.editNodeEnd();
      },
      true,
    );
    this.mcnodes.addEventListener("mousedown", this.mousedownHandle.bind(this));
    this.mcnodes.addEventListener("click", this.clickHandle.bind(this));
    this.mcnodes.addEventListener("dblclick", this.dblclickHandle.bind(this));
  }

  private mousedownHandle(e: Event): void {
    const element = e.target as HTMLElement;
    const nodeid = this.wrapperView.getBindedNodeId(element);
    if (nodeid) {
      if (findMcnode(element)) {
        const theNode = this.mindCheese.mind.getNodeById(nodeid);
        return this.mindCheese.selectNode(theNode);
      }
    } else {
      this.mindCheese.selectClear();
    }
  }

  private clickHandle(e: Event): boolean {
    const element = e.target as HTMLElement;
    switch (element.tagName.toLowerCase()) {
      case "mcadder": {
        const nodeid = this.wrapperView.getBindedNodeId(element);
        if (nodeid) {
          const theNode = this.mindCheese.mind.getNodeById(nodeid);
          if (!theNode) {
            throw new Error("the node[id=" + nodeid + "] can not be found.");
          } else {
            console.log(`element: ${element.tagName.toLowerCase()}`);
            const nodeid = generateNewId();
            const node = this.mindCheese.addNode(theNode, nodeid, "New Node");
            if (node) {
              this.mindCheese.selectNode(node);

              this.checkEditable();
              this.wrapperView.editNodeBegin(node);
            }
          }
        }
        return false;
      }
    }
    return true;
  }

  dblclickHandle(e: Event): boolean {
    this.checkEditable();
    e.preventDefault();
    e.stopPropagation();

    const element = e.target as HTMLElement;
    const nodeid = this.wrapperView.getBindedNodeId(element);
    if (nodeid) {
      const theNode = this.mindCheese.mind.getNodeById(nodeid);
      if (theNode.viewData.element!.contentEditable == "true") {
        // The node is already in the editing mode.
        return false;
      }

      if (!theNode) {
        throw new Error(`the node[id=${nodeid}] can not be found.`);
      }

      this.wrapperView.editNodeBegin(theNode);

      return false;
    }
    return true;
  }

  attach(parent: HTMLElement) {
    parent.appendChild(this.mcnodes);
  }

  private checkEditable() {
    return this.mindCheese.isEditable();
  }

  resetSize() {
    this.mcnodes.style.width = "1px";
    this.mcnodes.style.height = "1px";
  }

  createNodes() {
    const nodes = this.mindCheese.mind.nodes;

    const documentFragment = document.createDocumentFragment();
    for (const node of Object.values(nodes)) {
      this.createNodeElement(node, documentFragment);
    }
    this.mcnodes.appendChild(documentFragment);
  }

  addNode(node: MindNode): void {
    this.createNodeElement(node, this.mcnodes);
    NodesView.initNodeSize(node);
  }

  private static initNodeSize(node: MindNode): void {
    const viewData = node.viewData;
    viewData.elementSizeCache = new Size(
      viewData.element!.clientWidth,
      viewData.element!.clientHeight,
    );
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
      node.viewData.adder = adderElement;
    }
    if (node.topic) {
      nodeEl.innerHTML = this.textFormatter.render(node.topic);
    }
    nodeEl.setAttribute("nodeid", node.id);
    nodeEl.style.visibility = "hidden";

    parentNode.appendChild(nodeEl);
    node.viewData.element = nodeEl;
  }

  cacheNodeSize() {
    const nodes = this.mindCheese.mind.nodes;

    for (const node of Object.values(nodes)) {
      NodesView.initNodeSize(node);
    }
  }

  clearNodes(): void {
    const nodes = this.mindCheese.mind.nodes;
    for (const node of Object.values(nodes)) {
      node.viewData.element = null;
      node.viewData.adder = null;
    }
    this.mcnodes.innerHTML = "";
  }

  removeNode(node: MindNode) {
    const element = node.viewData.element!;
    const adder = node.viewData.adder!;
    this.mcnodes.removeChild(element);
    this.mcnodes.removeChild(adder);
    node.viewData.element = null;
    node.viewData.adder = null;
  }

  appendChild(shadow: HTMLElement) {
    this.mcnodes.appendChild(shadow);
  }

  // TODO move to NodesView
  renderNodes(layoutResult: LayoutResult): void {
    const nodes = this.mindCheese.mind.nodes;
    const offset = layoutResult.getOffsetOfTheRootNode(this.mindCheese.mind);

    for (const node of Object.values(nodes)) {
      const viewData = node.viewData;
      const nodeElement = viewData.element!;
      const p = layoutResult.getTopLeft(node, this.lineWidth);
      viewData.elementTopLeft = offset.convertCenterOfNodeOffsetFromRootNode(p);
      nodeElement.style.left = viewData.elementTopLeft.x + "px";
      nodeElement.style.top = viewData.elementTopLeft.y + "px";
      nodeElement.style.display = "";
      nodeElement.style.visibility = "visible";

      if (!node.isroot && node.children.length == 0) {
        const adder = viewData.adder!;
        const adderText = "+";
        const adderPoint = offset.convertCenterOfNodeOffsetFromRootNode(
          layoutResult.getAdderPosition(node, this.pSpace),
        );
        adder.style.left = adderPoint.x + "px";
        adder.style.top = adderPoint.y + "px";
        adder.style.display = "";
        adder.style.visibility = "visible";
        adder.innerText = adderText;
      }
    }
  }
}
