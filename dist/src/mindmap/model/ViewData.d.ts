import { OffsetFromTopLeftOfMcnodes } from '../layout/OffsetFromTopLeftOfMcnodes';
import { Size } from './Size';

export declare class ViewData {
    element: HTMLElement | null;
    adder: HTMLElement | null;
    elementSizeCache: Size | null;
    elementTopLeft: OffsetFromTopLeftOfMcnodes | null;
}
