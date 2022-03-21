import MindCheese from "../src/mindmap/MindCheese";
import { DEMO_MARKDOWN, DEMO_NODE_TREE } from "./DemoData";

console.log("Loaded browser.ts");

function downloadText(filename: string, text: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function initDemo() {
  const container = document.getElementById("container");
  const mindCheese = new MindCheese(1, container);
  mindCheese.showNodeTree(DEMO_NODE_TREE);

  document.getElementById("dump_to_console").addEventListener("click", () => {
    const data = mindCheese.getNodeTree();
    downloadText(
      encodeURIComponent(mindCheese.mind.root.topic) + ".json",
      JSON.stringify(data, null, 2)
    );
    return false;
  });
  document
    .getElementById("dump_to_console_markdown")
    .addEventListener("click", () => {
      const data = mindCheese.getMarkdown();
      downloadText(
        encodeURIComponent(mindCheese.mind.root.topic) + ".md",
        data
      );
      return false;
    });
  document.getElementById("resize").addEventListener("click", () => {
    mindCheese.resize();
    return false;
  });
  document.getElementById("undo").addEventListener("click", () => {
    mindCheese.undo();
    return false;
  });
  document.getElementById("load_markdown").addEventListener("click", () => {
    mindCheese.showMarkdown(DEMO_MARKDOWN);
    return false;
  });
  document.getElementById("dark").addEventListener("click", () => {
    mindCheese.setTheme("dark");
    return false;
  });
}

// @ts-ignore
window.initDemo = initDemo;
export default initDemo;
