import { Direction } from '../MindmapConstants';
import { MindNode } from './MindNode';

export declare class Mind {
    root: MindNode | null;
    selected: MindNode | null;
    readonly nodes: Record<string, MindNode>;
    constructor();
    getNodeById(nodeid: string): MindNode;
    setRoot(nodeid: string, topic: string): void;
    addNode(parentNode: MindNode, nodeid: string, topic: string, idx: number | null, direction: Direction | null): MindNode;
    getNodeBefore(node: MindNode): MindNode | null;
    insertNodeAfter(nodeAfter: MindNode, nodeid: string, topic: string): MindNode;
    getNodeAfter(node: MindNode): MindNode | null;
    moveNode(node: MindNode, beforeid: string, parent: MindNode, direction: Direction): void;
    private flowNodeDirection;
    private moveNodeInternal;
    private doMoveNode;
    removeNode(node: MindNode): boolean;
    private putNode;
    private reindex;
}
