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
      children: [
        { id: "other1", topic: "I'm from local variable" },
        { id: "other2", topic: "I can do everything: `3*2`" },
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
