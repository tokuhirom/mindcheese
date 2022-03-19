"use strict";

import { markdown2mindmap } from "../src/MD2MMConverter";

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
  const mm = markdown2mindmap(md).root.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    expanded: true,
    children: [
      {
        id: 2,
        topic: "jsMind",
        direction: "right",
        expanded: true,
        children: [
          {
            id: 3,
            topic: "Easy",
            expanded: true,
            children: [
              {
                id: 4,
                topic: "Easy to show",
                expanded: true,
                children: [],
              },
              {
                id: 5,
                topic: "Easy to edit",
                expanded: true,
                children: [],
              },
              {
                id: 6,
                topic: "Easy to store",
                expanded: true,
                children: [],
              },
              {
                id: 7,
                topic: "Easy to embed",
                expanded: true,
                children: [],
              },
            ],
          },
          {
            id: 8,
            topic: "Open Source",
            expanded: true,
            children: [
              {
                id: 9,
                topic: "on GitHub",
                expanded: true,
                children: [],
              },
              {
                id: 10,
                topic: "BSD License",
                expanded: true,
                children: [],
              },
            ],
          },
          {
            id: 11,
            topic: "Powerful",
            expanded: true,
            children: [
              {
                id: 12,
                topic: "Base on Javascript",
                expanded: true,
                children: [],
              },
              {
                id: 13,
                topic: "Base on HTML5",
                expanded: true,
                children: [],
              },
              {
                id: 14,
                topic: "Depends on you",
                expanded: true,
                children: [],
              },
            ],
          },
          {
            id: 15,
            topic: "test node",
            expanded: true,
            children: [
              {
                id: 16,
                topic: "I'm from local variable",
                expanded: true,
                children: [],
              },
              {
                id: 17,
                topic: "I can do everything",
                expanded: true,
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
  const mm = markdown2mindmap(md).root.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    expanded: true,
    children: [
      {
        id: 2,
        topic: "A",
        direction: "right",
        expanded: true,
        children: [{ id: 3, topic: "B", expanded: true, children: [] }],
      },
      { id: 4, topic: "C", direction: "right", expanded: true, children: [] },
    ],
  });
});

test("left", () => {
  const md = ["- top", "\t- A", "\t\t- B", "\t+ C"].join("\n");
  const mm = markdown2mindmap(md).root.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    expanded: true,
    children: [
      {
        id: 2,
        topic: "A",
        direction: "right",
        expanded: true,
        children: [{ id: 3, topic: "B", expanded: true, children: [] }],
      },
      { id: 4, topic: "C", direction: "left", expanded: true, children: [] },
    ],
  });
});

test("ignore yfm", () => {
  const md = ["---", "aliases: []", "---", "", "- top", "\t- A"].join("\n");
  const mm = markdown2mindmap(md).root.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    expanded: true,
    children: [
      { id: 2, topic: "A", direction: "right", expanded: true, children: [] },
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
  const mm = markdown2mindmap(md).root.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    expanded: true,
    children: [
      { id: 2, topic: "A1", direction: "right", expanded: true, children: [] },
      {
        id: 3,
        topic: "A2",
        direction: "right",
        expanded: true,
        children: [
          { id: 4, topic: "B1", expanded: true, children: [] },
          {
            id: 5,
            topic: "B2",
            expanded: true,
            children: [
              { id: 6, topic: "C1", expanded: true, children: [] },
              { id: 7, topic: "C2", expanded: true, children: [] },
            ],
          },
        ],
      },
      { id: 8, topic: "A3", direction: "right", expanded: true, children: [] },
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
  const mm = markdown2mindmap(md).root.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    expanded: true,
    children: [
      { id: 2, topic: "A1", direction: "right", expanded: true, children: [] },
      {
        id: 3,
        topic: "A2",
        direction: "right",
        expanded: true,
        children: [
          { id: 4, topic: "B1", expanded: true, children: [] },
          {
            id: 5,
            topic: "B2",
            expanded: true,
            children: [
              { id: 6, topic: "C1", expanded: true, children: [] },
              {
                id: 7,
                topic: "C2",
                expanded: true,
                children: [
                  { id: 8, topic: "D1", expanded: true, children: [] },
                  { id: 9, topic: "D2", expanded: true, children: [] },
                ],
              },
            ],
          },
        ],
      },
      { id: 10, topic: "A3", direction: "right", expanded: true, children: [] },
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
  const mm = markdown2mindmap(md).root.toObject();
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    expanded: true,
    children: [
      {
        id: 2,
        topic: "A1\nA2",
        direction: "right",
        expanded: true,
        children: [
          { id: 3, topic: "B1\nB2\nB3", expanded: true, children: [] },
        ],
      },
    ],
  });
});
