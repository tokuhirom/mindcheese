"use strict";

import { convertMD2MM } from "../src/MD2MMConverter";

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
  const mm = convertMD2MM(md);
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
            direction: "right",
            children: [
              {
                id: 4,
                topic: "Easy to show",
                direction: "right",
                children: [],
              },
              {
                id: 5,
                topic: "Easy to edit",
                direction: "right",
                children: [],
              },
              {
                id: 6,
                topic: "Easy to store",
                direction: "right",
                children: [],
              },
              {
                id: 7,
                topic: "Easy to embed",
                direction: "right",
                children: [],
              },
            ],
          },
          {
            id: 8,
            topic: "Open Source",
            direction: "right",
            children: [
              {
                id: 9,
                topic: "on GitHub",
                direction: "right",
                children: [],
              },
              {
                id: 10,
                topic: "BSD License",
                direction: "right",
                children: [],
              },
            ],
          },
          {
            id: 11,
            topic: "Powerful",
            direction: "right",
            children: [
              {
                id: 12,
                topic: "Base on Javascript",
                direction: "right",
                children: [],
              },
              {
                id: 13,
                topic: "Base on HTML5",
                direction: "right",
                children: [],
              },
              {
                id: 14,
                topic: "Depends on you",
                direction: "right",
                children: [],
              },
            ],
          },
          {
            id: 15,
            topic: "test node",
            direction: "right",
            children: [
              {
                id: 16,
                topic: "I'm from local variable",
                direction: "right",
                children: [],
              },
              {
                id: 17,
                topic: "I can do everything",
                direction: "right",
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
  const mm = convertMD2MM(md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {
        id: 2,
        topic: "A",
        direction: "right",
        children: [{ id: 3, topic: "B", direction: "right", children: [] }],
      },
      { id: 4, topic: "C", direction: "right", children: [] },
    ],
  });
});

test("left", () => {
  const md = ["- top", "\t- A", "\t\t- B", "\t+ C"].join("\n");
  const mm = convertMD2MM(md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      {
        id: 2,
        topic: "A",
        direction: "right",
        children: [{ id: 3, topic: "B", direction: "right", children: [] }],
      },
      { id: 4, topic: "C", direction: "left", children: [] },
    ],
  });
});

test("ignore yfm", () => {
  const md = ["---", "aliases: []", "---", "", "- top", "\t- A"].join("\n");
  const mm = convertMD2MM(md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [{ id: 2, topic: "A", direction: "right", children: [] }],
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
  const mm = convertMD2MM(md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      { id: 2, topic: "A1", direction: "right", children: [] },
      {
        id: 3,
        topic: "A2",
        direction: "right",
        children: [
          { id: 4, topic: "B1", direction: "right", children: [] },
          {
            id: 5,
            topic: "B2",
            direction: "right",
            children: [
              { id: 6, topic: "C1", direction: "right", children: [] },
              { id: 7, topic: "C2", direction: "right", children: [] },
            ],
          },
        ],
      },
      { id: 8, topic: "A3", direction: "right", children: [] },
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
  const mm = convertMD2MM(md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    id: 1,
    topic: "top",
    children: [
      { id: 2, topic: "A1", direction: "right", children: [] },
      {
        id: 3,
        topic: "A2",
        direction: "right",
        children: [
          { id: 4, topic: "B1", direction: "right", children: [] },
          {
            id: 5,
            topic: "B2",
            direction: "right",
            children: [
              { id: 6, topic: "C1", direction: "right", children: [] },
              {
                id: 7,
                topic: "C2",
                direction: "right",
                children: [
                  { id: 8, topic: "D1", direction: "right", children: [] },
                  { id: 9, topic: "D2", direction: "right", children: [] },
                ],
              },
            ],
          },
        ],
      },
      { id: 10, topic: "A3", direction: "right", children: [] },
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
  const mm = convertMD2MM(md);
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
          { id: 3, topic: "B1\nB2\nB3", direction: "right", children: [] },
        ],
      },
    ],
  });
});
