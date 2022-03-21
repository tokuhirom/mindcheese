import MindCheese from "../src/mindmap/MindCheese";
import { DEMO_MARKDOWN, DEMO_NODE_TREE } from "./DemoData";

export default MindCheese;
console.log("Loaded browser.ts");

function initDemo() {
  const container = document.getElementById("container");
  const mindCheese = new MindCheese(1, container);
  mindCheese.showNodeTree(DEMO_NODE_TREE);

  // window.addEventListener("resize", () => resize());
  // resize();
  // function resize() {
  //   const container = document.getElementById("container");
  //   const menu = document.getElementById("menu");
  //   const browserHeight = document.documentElement.clientHeight;
  //   const bodyMarginTop = parseInt(
  //     getComputedStyle(document.body).marginTop
  //   );
  //   const bodyMarginBottom = parseInt(
  //     getComputedStyle(document.body).marginTop
  //   );
  //   container.style.height =
  //     browserHeight -
  //     menu.clientHeight -
  //     bodyMarginTop -
  //     bodyMarginBottom +
  //     "px";
  // }

  document.getElementById("layout").addEventListener("click", () => {
    console.log("layout.layout");
    mindCheese.layout.layout();
    return false;
  });
  document.getElementById("viewShow").addEventListener("click", () => {
    console.log("viewShow");
    mindCheese.view.show();
    return false;
  });
  document.getElementById("expandSize").addEventListener("click", () => {
    console.log("viewShow");
    mindCheese.view.expandSize();
    return false;
  });
  document.getElementById("dump_to_console").addEventListener("click", () => {
    const data = mindCheese.getNodeTree();
    console.log(data);
    return false;
  });
  document
    .getElementById("dump_to_console_markdown")
    .addEventListener("click", () => {
      const data = mindCheese.getMarkdown();
      console.log(data);
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
