import { KEYCODE_ENTER, KEYCODE_ESC } from "../../MindmapConstants";
import { ViewProvider } from "../../ViewProvider";
import { findMcnode } from "../../utils/DomUtils";
import { generateNewId } from "../../utils/RandomID";
import { MindCheese } from "../../MindCheese";
import { MindNode } from "../../model/MindNode";
import { Size } from "../../model/Size";
import { TextFormatter } from "../../renderer/TextFormatter";

export class NodesView {
  private readonly mcnodes: HTMLElement; // <mcnodes>
  private readonly viewProvider: ViewProvider; // TODO
  private readonly mindCheese: MindCheese;
  private readonly textFormatter: TextFormatter;

  constructor(
    viewProvider: ViewProvider,
    mindCheese: MindCheese,
    textFormatter: TextFormatter
  ) {
    this.viewProvider = viewProvider;
    this.mindCheese = mindCheese;
    this.textFormatter = textFormatter;

    this.mcnodes = document.createElement("mcnodes");
    this.bindEvent();
  }

  private bindEvent(): void {
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
        this.viewProvider.editNodeEnd();
      }
    });
    // adjust size dynamically.
    this.mcnodes.addEventListener("keyup", () => {
      this.viewProvider.renderAgain();
    });
    this.mcnodes.addEventListener("input", () => {
      // TODO is this required?
      this.viewProvider.renderAgain();
    });
    // when the element lost focus.
    this.mcnodes.addEventListener(
      "blur",
      (e: FocusEvent) => {
        const el = e.target as HTMLElement;
        if (el.tagName.toLowerCase() != "mcnode") {
          return;
        }

        this.viewProvider.editNodeEnd();
      },
      true
    );
    this.mcnodes.addEventListener("mousedown", this.mousedownHandle.bind(this));
    this.mcnodes.addEventListener("click", this.clickHandle.bind(this));
    this.mcnodes.addEventListener("dblclick", this.dblclickHandle.bind(this));
  }

  private mousedownHandle(e: Event): void {
    const element = e.target as HTMLElement;
    const nodeid = this.viewProvider.getBindedNodeId(element);
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
        const nodeid = this.viewProvider.getBindedNodeId(element);
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
              this.viewProvider.editNodeBegin(node);
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
    const nodeid = this.viewProvider.getBindedNodeId(element);
    if (nodeid) {
      const theNode = this.mindCheese.mind.getNodeById(nodeid);
      if (theNode.data.view.element!.contentEditable == "true") {
        // The node is already in the editing mode.
        return false;
      }

      if (!theNode) {
        throw new Error(`the node[id=${nodeid}] can not be found.`);
      }

      this.viewProvider.editNodeBegin(theNode);

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
    const viewData = node.data.view;
    viewData.elementSizeCache = new Size(
      viewData.element!.clientWidth,
      viewData.element!.clientHeight
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

  cacheNodeSize() {
    const nodes = this.mindCheese.mind.nodes;

    for (const node of Object.values(nodes)) {
      NodesView.initNodeSize(node);
    }
  }

  clearNodes(): void {
    const nodes = this.mindCheese.mind.nodes;
    for (const node of Object.values(nodes)) {
      node.data.view.element = null;
      node.data.view.adder = null;
    }
    this.mcnodes.innerHTML = "";
  }

  removeNode(node: MindNode) {
    const element = node.data.view.element!;
    const adder = node.data.view.adder!;
    this.mcnodes.removeChild(element);
    this.mcnodes.removeChild(adder);
    node.data.view.element = null;
    node.data.view.adder = null;
  }

  appendChild(shadow: HTMLElement) {
    this.mcnodes.appendChild(shadow);
  }
}
