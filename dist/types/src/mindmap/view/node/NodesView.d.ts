import { MindCheese } from "../../MindCheese";
import { MindNode } from "../../model/MindNode";
import { TextFormatter } from "../../renderer/TextFormatter";
import { LayoutResult } from "../../layout/LayoutResult";
import { WrapperView } from "../wrapper/WrapperView";
export declare class NodesView {
  private readonly mcnodes;
  private readonly mindCheese;
  private readonly textFormatter;
  private readonly lineWidth;
  private readonly pSpace;
  private wrapperView;
  constructor(
    wrapperView: WrapperView,
    mindCheese: MindCheese,
    textFormatter: TextFormatter,
    lineWidth: number,
    pSpace: number,
  );
  private bindEvent;
  private mousedownHandle;
  private clickHandle;
  dblclickHandle(e: Event): boolean;
  attach(parent: HTMLElement): void;
  private checkEditable;
  resetSize(): void;
  createNodes(): void;
  addNode(node: MindNode): void;
  private static initNodeSize;
  private createNodeElement;
  cacheNodeSize(): void;
  clearNodes(): void;
  removeNode(node: MindNode): void;
  appendChild(shadow: HTMLElement): void;
  renderNodes(layoutResult: LayoutResult): void;
}
