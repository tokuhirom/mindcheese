import { RootNodeOffsetFromTopLeftOfMcnodes } from './RootNodeOffsetFromTopLeftOfMcnodes';
import { Mind } from '../model/Mind';
import { Bounds } from './Bounds';
import { MindNode } from '../model/MindNode';
import { CenterOfNodeOffsetFromRootNode } from './CenterOfNodeOffsetFromRootNode';

export declare class LayoutResult {
    private readonly _relativeFromRootMap;
    constructor(relativeFromRootMap: Record<string, CenterOfNodeOffsetFromRootNode>);
    getCenterOffsetOfTheNodeFromRootNode(node: MindNode): CenterOfNodeOffsetFromRootNode;
    /**
     *                  Child
     *             xxxxx───────
     * ┌──────┐  xxx   ▲
     * │ Root │xxx     │
     * └──────┘        │
     *                 │
     *                 │
     */
    getNodePointIn(node: MindNode): CenterOfNodeOffsetFromRootNode;
    /**
     *                                    ┌───────┐
     *                                    │ Child │
     *                                 xxx└───────┘
     *                    ┌───────┐  xxx
     *                    │ Child │xxx
     *                xxxx└───────┘▲
     * ┌───────┐   xxxx            │
     * │  Root │xxxx               │
     * └───────┘▲                  │
     *          │                  │
     *          │                  │
     *          │                  │
     *          │                  │
     */
    getNodePointOut(node: MindNode, destination: MindNode): CenterOfNodeOffsetFromRootNode;
    getAdderPosition(node: MindNode, marginForAdder: number): CenterOfNodeOffsetFromRootNode;
    getTopLeft(node: MindNode, lineWidth: number): CenterOfNodeOffsetFromRootNode;
    getBounds(mind: Mind): Bounds;
    getOffsetOfTheRootNode(mind: Mind): RootNodeOffsetFromTopLeftOfMcnodes;
}
