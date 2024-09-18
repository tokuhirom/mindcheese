import { MindCheese } from "../src/mindmap/MindCheese";
import { DEMO_MARKDOWN, DEMO_NODE_TREE } from "./DemoData";
import { EventType } from "../src/mindmap/MindmapConstants";

console.log("Loaded browser.ts!111");

function downloadText(filename: string, text: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function initDemo() {
  const container = document.getElementById("container");
  const mindCheese = new MindCheese(container!);
  // @ts-expect-error it's required
  this.mindCheese = mindCheese;
  mindCheese.showNodeTree(DEMO_NODE_TREE);
  mindCheese.addEventListener(EventType.AfterEdit, (mind) => {
    console.log(`AfterEdit`);
    console.log(mind);
  });

  document.getElementById("download_json")!.addEventListener("click", () => {
    const data = mindCheese.getNodeTree();
    downloadText(
      encodeURIComponent(mindCheese.mind.root!.topic) + ".json",
      JSON.stringify(data, null, 2),
    );
    return false;
  });
  document
    .getElementById("download_markdown")!
    .addEventListener("click", () => {
      const data = mindCheese.getMarkdown();
      downloadText(
        encodeURIComponent(mindCheese.mind.root!.topic) + ".md",
        data,
      );
      return false;
    });
  document.getElementById("undo")!.addEventListener("click", () => {
    mindCheese.undo();
    return false;
  });

  if (process.env.BUILD == "development") {
    document.getElementById("load_markdown")!.addEventListener("click", () => {
      mindCheese.showMarkdown(DEMO_MARKDOWN);
      return false;
    });
  } else {
    document.getElementById("navItemDebug")!.style.display = "none";
  }

  let themeMode = true;
  document.getElementById("toggle_theme")!.addEventListener("click", () => {
    mindCheese.setTheme(themeMode ? "dark" : "primary");
    themeMode = !themeMode;
    return false;
  });
}

// @ts-expect-error it's required
window.initDemo = initDemo;
