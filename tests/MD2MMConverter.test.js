"use strict";

const MD2MMConverter = require("../src/MD2MMConverter");

test("complex", () => {
  const md = [
    "- jsMind",
    "\t- Easy",
    "\t\t- Easy to show",
    "\t\t- Easy to edit",
    "\t\t- Easy to store",
    "\t\t- Easy to embed",
    "\t- Open Source",
    "\t\t- on GitHub",
    "\t\t- BSD License",
    "\t- Powerful",
    "\t\t- Base on Javascript",
    "\t\t- Base on HTML5",
    "\t\t- Depends on you",
    "\t- test node",
    "\t\t- I'm from local variable",
    "\t\t- I can do everything",
    "",
  ].join("\n");
  const mm = MD2MMConverter.convertMD2MM("top", md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: {
      name: "jsMind remote",
      author: "hizzgdev@163.com",
      version: "0.2",
    },
    format: "node_tree",
    data: {
      id: "root",
      topic: "top",
      children: [
        {
          id: 1,
          topic: "jsMind",
          direction: 'right',
          children: [
            {
              id: 2,
              topic: "Easy",
              direction: 'right',
              children: [
                {
                  id: 3,
                  topic: "Easy to show",
                  direction: 'right',
                  children: [],
                },
                {
                  id: 4,
                  topic: "Easy to edit",
                  direction: 'right',
                  children: [],
                },
                {
                  id: 5,
                  topic: "Easy to store",
                  direction: 'right',
                  children: [],
                },
                {
                  id: 6,
                  topic: "Easy to embed",
                  direction: 'right',
                  children: [],
                },
              ],
            },
            {
              id: 7,
              topic: "Open Source",
              direction: 'right',
              children: [
                {
                  id: 8,
                  topic: "on GitHub",
                  direction: 'right',
                  children: [],
                },
                {
                  id: 9,
                  topic: "BSD License",
                  direction: 'right',
                  children: [],
                },
              ],
            },
            {
              id: 10,
              topic: "Powerful",
              direction: 'right',
              children: [
                {
                  id: 11,
                  topic: "Base on Javascript",
                  direction: 'right',
                  children: [],
                },
                {
                  id: 12,
                  topic: "Base on HTML5",
                  direction: 'right',
                  children: [],
                },
                {
                  id: 13,
                  topic: "Depends on you",
                  direction: 'right',
                  children: [],
                },
              ],
            },
            {
              id: 14,
              topic: "test node",
              direction: 'right',
              children: [
                {
                  id: 15,
                  topic: "I'm from local variable",
                  direction: 'right',
                  children: [],
                },
                {
                  id: 16,
                  topic: "I can do everything",
                  direction: 'right',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  });
});

test("basic", () => {
  const md = ["- A", "\t- B", "- C"].join("\n");
  const mm = MD2MMConverter.convertMD2MM("top", md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: "jsMind remote", author: "hizzgdev@163.com", version: "0.2" },
    format: "node_tree",
    data: {
      id: "root",
      topic: "top",
      children: [
        { id: 1, topic: "A", direction: 'right', children: [{ id: 2, topic: "B", direction: 'right', children: [] }] },
        { id: 3, topic: "C", direction: 'right', children: [] },
      ],
    },
  });
});

test("left", () => {
  const md = ["- A", "\t- B", "+ C"].join("\n");
  const mm = MD2MMConverter.convertMD2MM("top", md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: "jsMind remote", author: "hizzgdev@163.com", version: "0.2" },
    format: "node_tree",
    data: {
      id: "root",
      topic: "top",
      children: [
        { id: 1, topic: "A", direction: 'right', children: [{ id: 2, topic: "B", direction: 'right', children: [] }] },
        { id: 3, topic: "C", direction: 'left', children: [] },
      ],
    },
  });
});

test("ignore yfm", () => {
  const md = ["---", "aliases: []", "---", "", "- A"].join("\n");
  const mm = MD2MMConverter.convertMD2MM("top", md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: "jsMind remote", author: "hizzgdev@163.com", version: "0.2" },
    format: "node_tree",
    data: {
      id: "root",
      topic: "top",
      children: [{ id: 1, topic: "A", direction: 'right', children: [] }],
    },
  });
});

test("dedent 2 step", () => {
  const md = [
    "- A1",
    "- A2",
    "\t- B1",
    "\t- B2",
    "\t\t- C1",
    "\t\t- C2",
    "- A3",
  ].join("\n");
  const mm = MD2MMConverter.convertMD2MM("top", md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: "jsMind remote", author: "hizzgdev@163.com", version: "0.2" },
    format: "node_tree",
    data: {
      id: "root",
      topic: "top",
      children: [
        { id: 1, topic: "A1", direction: 'right',children: [] },
        {
          id: 2,
          topic: "A2",
          direction: 'right',
          children: [
            { id: 3, topic: "B1",direction: 'right', children: [] },
            {
              id: 4,
              topic: "B2",
              direction: 'right',
              children: [
                { id: 5, topic: "C1", direction: 'right', children: [] },
                { id: 6, topic: "C2", direction: 'right', children: [] },
              ],
            },
          ],
        },
        { id: 7, topic: "A3", direction: 'right', children: [] },
      ],
    },
  });
});

test("dedent 3 step", () => {
  const md = [
    "- A1",
    "- A2",
    "\t- B1",
    "\t- B2",
    "\t\t- C1",
    "\t\t- C2",
    "\t\t\t- D1",
    "\t\t\t- D2",
    "- A3",
  ].join("\n");
  const mm = MD2MMConverter.convertMD2MM("top", md);
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: "jsMind remote", author: "hizzgdev@163.com", version: "0.2" },
    format: "node_tree",
    data: {
      id: "root",
      topic: "top",
      children: [
        { id: 1, topic: "A1", direction: 'right', children: [] },
        {
          id: 2,
          topic: "A2",
          direction: 'right',
          children: [
            { id: 3, topic: "B1", direction: 'right',children: [] },
            {
              id: 4,
              topic: "B2",
              direction: 'right',
              children: [
                { id: 5, topic: "C1", direction: 'right', children: [] },
                {
                  id: 6,
                  topic: "C2",
                  direction: 'right',
                  children: [
                    { id: 7, topic: "D1", direction: 'right',children: [] },
                    { id: 8, topic: "D2", direction: 'right',children: [] },
                  ],
                },
              ],
            },
          ],
        },
        { id: 9, topic: "A3", direction: 'right', children: [] },
      ],
    },
  });
});
