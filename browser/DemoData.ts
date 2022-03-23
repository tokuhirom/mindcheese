export const DEMO_NODE_TREE = {
  id: "root",
  topic: "mindCheese 🧀",
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
          children: [
            { id: "jsMind1", topic: "Base on HTML5" },
            { id: "jsMind2", topic: "Supported CJK chars" },
          ],
        },
        { id: "powerful4", topic: "Depends on you" },
      ],
    },
    {
      id: "other",
      topic: "test node",
      direction: "left",
      // expanded: false,
      children: [
        { id: "other1", topic: "I'm from local variable" },
        { id: "other2", topic: "I can do everything: `3*2`" },
        {
          id: "other3",
          topic:
            "Multi line\nMulti line\nMulti line\nMulti line\nMulti line\nMulti line\nMulti line\nMulti line\nMulti line",
        },
        {
          id: "other4",
          topic:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget mauris pharetra et ultrices neque ornare aenean euismod elementum. Tempus egestas sed sed risus. Lacus vel facilisis volutpat est velit egestas. Odio aenean sed adipiscing diam donec adipiscing tristique risus. Eu ultrices vitae auctor eu augue ut lectus. Nulla pharetra diam sit amet. Integer quis auctor elit sed vulputate mi sit amet. Interdum varius sit amet mattis vulputate enim nulla aliquet. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Sed euismod nisi porta lorem. Suspendisse potenti nullam ac tortor. Curabitur gravida arcu ac tortor.",
        },
      ],
    },
  ],
};

export const DEMO_MARKDOWN = `- マークダウンのテスト
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
`;
