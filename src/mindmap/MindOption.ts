import {KeyModifier} from "./MindmapConstants";
import ShortcutHandlers from "./ShortcutHandlers";
import MindCheese from "./MindCheese";

export class MindOption {
    theme = "primary"
    view = new ViewOption()
    layout = new LayoutOption()
    shortcut = new ShortcutOption()
}

class ViewOption {
    hmargin = 100
    vmargin = 50
    lineWidth = 2
    lineColor = "#555"
}

class LayoutOption {
    hspace = 30
    vspace = 20
    pspace = 13
}

class ShortcutOption {
    enable = true
    mappings: [number, string, (jm: MindCheese, e: Event) => boolean][] = [
        [KeyModifier.NONE, "Delete", ShortcutHandlers.delete],
        [KeyModifier.NONE, "Backspace", ShortcutHandlers.delete], // for Mac
        [KeyModifier.NONE, "Tab", ShortcutHandlers.addChild],
        [KeyModifier.NONE, "Enter", ShortcutHandlers.addBrother],
        [KeyModifier.CTRL, "Enter", ShortcutHandlers.editNode],
        [KeyModifier.NONE, "Space", ShortcutHandlers.toggle],
        [KeyModifier.SHIFT, "ArrowUp", ShortcutHandlers.moveUp],
        [KeyModifier.SHIFT, "ArrowDown", ShortcutHandlers.moveDown],
        [KeyModifier.NONE, "ArrowUp", ShortcutHandlers.up],
        [KeyModifier.NONE, "ArrowDown", ShortcutHandlers.down],
        [KeyModifier.NONE, "ArrowLeft", ShortcutHandlers.left],
        [KeyModifier.NONE, "ArrowRight", ShortcutHandlers.right],
        [KeyModifier.CTRL, "KeyZ", ShortcutHandlers.undo],
    ]
}
