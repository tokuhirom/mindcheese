import MindCheese from "../src/mindmap/MindCheese";

export default MindCheese;
console.log("Loaded browser.ts");

function initDemo() {
  const container = document.getElementById("container");
  const mindCheese = new MindCheese(1, container);
  mindCheese.showNodeTree({
    id: "root",
    topic: "mindCheese",
    children: [
      {
        id: "easy",
        topic: "Easy",
        direction: "left",
        children: [
          { id: "easy1", topic: "Easy to show" },
          { id: "easy2", topic: "Easy to edit" },
          { id: "easy3", topic: "Easy to store" },
          { id: "easy4", topic: "Easy to embed" },
        ],
      },
      {
        id: "open",
        topic: "Open Source",
        direction: "right",
        children: [
          { id: "open1", topic: "on GitHub" },
          { id: "open2", topic: "BSD License" },
        ],
      },
      {
        id: "powerful",
        topic: "Powerful",
        direction: "right",
        children: [
          { id: "powerful1", topic: "Base on **TypeScript**" },
          {
            id: "powerful2",
            topic: "Base on **jsMind**",
            children: [{ id: "jsMind1", topic: "Base on HTML5" }],
          },
          { id: "powerful4", topic: "Depends on you" },
        ],
      },
      {
        id: "other",
        topic: "test node",
        direction: "left",
        children: [
          { id: "other1", topic: "I'm from local variable" },
          { id: "other2", topic: "I can do everything: `3*2`" },
        ],
      },
    ],
  });

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
    mindCheese.showMarkdown(
      `
- マークダウンのテスト
  - a1
    - b1
        - dddddddddddddddddddd1
          - eeeeeeeeeeeeeeeeeeeeee2
            - ffffffffffffffffffffff3
              - gggggggggggggggggggggggggg3
                - hhhhhhhhhhhhhhhhhhhhhh2
                  - iiiiiiiiiiiiii52iiiiiiiiiii
                    - jjjjjjjjjjjjjj25jjjjjjjjjjjj
                      - kkkkkkkkk2342kkkkkkkkkkkkkkkkk2
                        - lllllllllll52llllllllllllllllllll
    - b2
    - b3
      - c1
      - c2
        - dddddddddddddddddddd
          - eeeeeeeeeeeeeeeeeeeeee
            - ffffffffffffffffffffff
              - gggggggggggggggggggggggggg
                - hhhhhhhhhhhhhhhhhhhhhh
                  - iiiiiiiiiiiiiiiiiiiiiiiii
                    - jjjjjjjjjjjjjjjjjjjjjjjjjj
                      - kkkkkkkkkkkkkkkkkkkkkkkkkk
                        - lllllllllllllllllllllllllllllll
  + a2 \\
    複数行だよ
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
  + aaa
          `
    );
    return false;
  });
  document.getElementById("dark").addEventListener("click", () => {
    mindCheese.setTheme("dark");
    return false;
  });
}

// @ts-ignore
window.initDemo = initDemo;
