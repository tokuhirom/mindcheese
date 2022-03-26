import {KeyModifier} from "./MindmapConstants";
import ShortcutHandlers from "./ShortcutHandlers";
import MindCheese from "./MindCheese";
import {TextFormatter} from "./renderer/TextFormatter";
import MarkdownRenderer from "./renderer/MarkdownRenderer";

export class MindOption {
  theme = "primary";
  view = new ViewOption();
  layout = new LayoutOption();
  shortcut = new ShortcutOption();
}

class ViewOption {
  hmargin = 100; // Minimum horizontal distance of the mindmap from the outer frame of the container
  vmargin = 50; // Minimum vertical distance of the mindmap from the outer frame of the container
  lineWidth = 2;
  lineColor = "#555";
  renderer: TextFormatter = new MarkdownRenderer();
}

class LayoutOption {
  hspace = 30; // horizontal spacing between nodes
  vspace = 20; // vspace vertical spacing between nodes
  pspace = 13; // Horizontal spacing between node and connection line (to place node expander)
}

class ShortcutOption {
  enable = true;
  mappings: [number, string, (jm: MindCheese, e: Event) => boolean][] = [
    [KeyModifier.NONE, "Delete", ShortcutHandlers.delete], // windows
    [KeyModifier.NONE, "Backspace", ShortcutHandlers.delete], // for Mac
    [KeyModifier.NONE, "Tab", ShortcutHandlers.addChild],
    [KeyModifier.NONE, "Enter", ShortcutHandlers.addBrother],
    [KeyModifier.CTRL, "Enter", ShortcutHandlers.editNode], // windows
    [KeyModifier.META, "Enter", ShortcutHandlers.editNode], // mac
    [KeyModifier.NONE, "Space", ShortcutHandlers.toggle],
    [KeyModifier.SHIFT, "ArrowUp", ShortcutHandlers.moveUp],
    [KeyModifier.SHIFT, "ArrowDown", ShortcutHandlers.moveDown],
    [KeyModifier.NONE, "ArrowUp", ShortcutHandlers.up],
    [KeyModifier.NONE, "ArrowDown", ShortcutHandlers.down],
    [KeyModifier.NONE, "ArrowLeft", ShortcutHandlers.left],
    [KeyModifier.NONE, "ArrowRight", ShortcutHandlers.right],
    [KeyModifier.CTRL, "KeyZ", ShortcutHandlers.undo],
    [KeyModifier.META, "KeyZ", ShortcutHandlers.undo], // for mac
  ];
}
