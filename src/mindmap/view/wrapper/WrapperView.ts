import { Size } from "../../model/Size";
import { LayoutResult } from "../../layout/LayoutResult";
import { Mind } from "../../model/Mind";
import { NodesView } from "../node/NodesView";
import { GraphCanvas } from "../graph/GraphCanvas";
import { MindNode } from "../../model/MindNode";
import { ScrollSnapshot } from "./ScrollSnapshot";

export class WrapperView {
  private readonly wrapperElement: HTMLElement;
  private readonly hMargin: number;
  private readonly vMargin: number;
  private nodesView: NodesView;
  private zoomScale = 1.0;

  constructor(
    hMargin: number,
    vMargin: number,
    nodesView: NodesView,
    graphCanvas: GraphCanvas
  ) {
    this.hMargin = hMargin;
    this.vMargin = vMargin;
    this.nodesView = nodesView;

    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = "mindcheese-inner";
    this.wrapperElement.appendChild(graphCanvas.element());

    this.nodesView.attach(this.wrapperElement);

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
  centerRoot(layoutResult: LayoutResult, size: Size, mind: Mind): void {
    const outerW = this.wrapperElement.clientWidth;
    const outerH = this.wrapperElement.clientHeight;
    if (size.width > outerW) {
      const offset = layoutResult.getOffsetOfTheRootNode(mind);
      this.wrapperElement.scrollLeft = offset.x - outerW / 2;
    }
    if (size.height > outerH) {
      this.wrapperElement.scrollTop = (size.height - outerH) / 2;
    }
  }

  setSize(width: number, height: number) {
    this.wrapperElement!.style.width = width + "px";
    this.wrapperElement!.style.height = height + "px";
  }

  restoreScroll(node: MindNode, scrollSnapshot: ScrollSnapshot) {
    const viewData = node.data.view;
    this.wrapperElement.scrollLeft =
      parseInt(viewData.element!.style.left) - scrollSnapshot.x;
    this.wrapperElement.scrollTop =
      parseInt(viewData.element!.style.top) - scrollSnapshot.y;
  }

  saveScroll(node: MindNode) {
    const viewData = node.data.view;
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
}
