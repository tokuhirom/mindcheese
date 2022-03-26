"use strict";

import {markdown2mindmap} from "../src/mindmap/format/markdown/markdown2mindmap";

test("complex", () => {
  const md = [
    "- top",
    "\t- jsMind",
    "\t\t- Easy",
    "\t\t\t- Easy to show",
    "\t\t\t- Easy to edit",
    "\t\t\t- Easy to store",
    "\t\t\t- Easy to embed",
    "\t\t- Open Source",
    "\t\t\t- on GitHub",
    "\t\t\t- BSD License",
    "\t\t- Powerful",
    "\t\t\t- Base on Javascript",
    "\t\t\t- Base on HTML5",
    "\t\t\t- Depends on you",
    "\t\t- test node",
    "\t\t\t- I'm from local variable",
    "\t\t\t- I can do everything",
    "",
  ].join("\n");
  const mm = markdown2mindmap(md).root!.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {
        id: 2,
        topic: "jsMind",
        direction: "right",
        children: [
          {
            id: 3,
            topic: "Easy",
            children: [
              {
                id: 4,
                topic: "Easy to show",
                children: [],
              },
              {
                id: 5,
                topic: "Easy to edit",
                children: [],
              },
              {
                id: 6,
                topic: "Easy to store",
                children: [],
              },
              {
                id: 7,
                topic: "Easy to embed",
                children: [],
              },
            ],
          },
          {
            id: 8,
            topic: "Open Source",
            children: [
              {
                id: 9,
                topic: "on GitHub",
                children: [],
              },
              {
                id: 10,
                topic: "BSD License",
                children: [],
              },
            ],
          },
          {
            id: 11,
            topic: "Powerful",
            children: [
              {
                id: 12,
                topic: "Base on Javascript",
                children: [],
              },
              {
                id: 13,
                topic: "Base on HTML5",
                children: [],
              },
              {
                id: 14,
                topic: "Depends on you",
                children: [],
              },
            ],
          },
          {
            id: 15,
            topic: "test node",
            children: [
              {
                id: 16,
                topic: "I'm from local variable",
                children: [],
              },
              {
                id: 17,
                topic: "I can do everything",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  });
});

test("basic", () => {
  const md = ["- top", "\t- A", "\t\t- B", "\t- C"].join("\n");
  const mm = markdown2mindmap(md).root!.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {
        id: 2,
        topic: "A",
        direction: "right",
        children: [{id: 3, topic: "B", children: []}],
      },
      {id: 4, topic: "C", direction: "right", children: []},
    ],
  });
});

test("left", () => {
  const md = ["- top", "\t- A", "\t\t- B", "\t+ C"].join("\n");
  const mm = markdown2mindmap(md).root!.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {
        id: 2,
        topic: "A",
        direction: "right",
        children: [{id: 3, topic: "B", children: []}],
      },
      {id: 4, topic: "C", direction: "left", children: []},
    ],
  });
});

test("ignore yfm", () => {
  const md = ["---", "aliases: []", "---", "", "- top", "\t- A"].join("\n");
  const mm = markdown2mindmap(md).root!.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",

    children: [
      {id: 2, topic: "A", direction: "right", children: []},
    ],
  });
});

test("dedent 2 step", () => {
  const md = [
    "- top",
    "\t- A1",
    "\t- A2",
    "\t\t- B1",
    "\t\t- B2",
    "\t\t\t- C1",
    "\t\t\t- C2",
    "\t- A3",
  ].join("\n");
  const mm = markdown2mindmap(md).root!.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {id: 2, topic: "A1", direction: "right", children: []},
      {
        id: 3,
        topic: "A2",
        direction: "right",
        children: [
          {id: 4, topic: "B1", children: []},
          {
            id: 5,
            topic: "B2",
            children: [
              {id: 6, topic: "C1", children: []},
              {id: 7, topic: "C2", children: []},
            ],
          },
        ],
      },
      {id: 8, topic: "A3", direction: "right", children: []},
    ],
  });
});

test("dedent 3 step", () => {
  const md = [
    "- top",
    "\t- A1",
    "\t- A2",
    "\t\t- B1",
    "\t\t- B2",
    "\t\t\t- C1",
    "\t\t\t- C2",
    "\t\t\t\t- D1",
    "\t\t\t\t- D2",
    "\t- A3",
  ].join("\n");
  const mm = markdown2mindmap(md).root!.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {id: 2, topic: "A1", direction: "right", children: []},
      {
        id: 3,
        topic: "A2",
        direction: "right",
        children: [
          {id: 4, topic: "B1", children: []},
          {
            id: 5,
            topic: "B2",
            children: [
              {id: 6, topic: "C1", children: []},
              {
                id: 7,
                topic: "C2",
                children: [
                  {id: 8, topic: "D1", children: []},
                  {id: 9, topic: "D2", children: []},
                ],
              },
            ],
          },
        ],
      },
      {id: 10, topic: "A3", direction: "right", children: []},
    ],
  });
});

test("Multiline", () => {
  const md = [
    "- top",
    "\t- A1 \\",
    "\t  A2",
    "\t\t- B1 \\",
    "\t\t  B2 \\",
    "\t\t  B3",
  ].join("\n");
  const mm = markdown2mindmap(md).root!.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {
        id: 2,
        topic: "A1\nA2",
        direction: "right",
        children: [
          {id: 3, topic: "B1\nB2\nB3", children: []},
        ],
      },
    ],
  });
});
