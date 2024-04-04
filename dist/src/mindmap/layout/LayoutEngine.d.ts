import { LayoutResult } from './LayoutResult';
import { Mind } from '../model/Mind';

export declare class LayoutEngine {
    private readonly hSpace;
    private readonly vSpace;
    private readonly pSpace;
    /**
     * The constructor
     *
     * @param hspace horizontal spacing between nodes
     * @param vspace vertical spacing between nodes
     * @param pspace Horizontal spacing between node and connection line (to place node adder)
     */
    constructor(hspace: number, vspace: number, pspace: number);
    layout(mind: Mind): LayoutResult;
    private static calcRelativeOffsetFromRoot;
    private layoutOffsetSubNodes;
}
