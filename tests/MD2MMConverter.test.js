"use strict";

const MD2MMConverter = require('../src/MD2MMConverter');

test('complex', () => {
  const md = [
    '- jsMind',
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
    '',
  ].join("\n");
  const mm = MD2MMConverter.convertMD2MM('top', md)
  console.log(JSON.stringify(mm, null, 2))
  expect(mm).toStrictEqual({
    "meta": {
      "name": "jsMind remote",
      "author": "hizzgdev@163.com",
      "version": "0.2"
    },
    "format": "node_tree",
    "data": {
      "id": "root",
      "topic": "top",
      "children": [
        {
          "id": 1,
          "topic": "jsMind",
          "children": [
            {
              "id": 2,
              "topic": "Easy",
              "children": [
                {
                  "id": 3,
                  "topic": "Easy to show",
                  "children": []
                },
                {
                  "id": 4,
                  "topic": "Easy to edit",
                  "children": []
                },
                {
                  "id": 5,
                  "topic": "Easy to store",
                  "children": []
                },
                {
                  "id": 6,
                  "topic": "Easy to embed",
                  "children": []
                }
              ]
            },
            {
              "id": 7,
              "topic": "Open Source",
              "children": [
                {
                  "id": 8,
                  "topic": "on GitHub",
                  "children": []
                },
                {
                  "id": 9,
                  "topic": "BSD License",
                  "children": []
                }
              ]
            },
            {
              "id": 10,
              "topic": "Powerful",
              "children": [
                {
                  "id": 11,
                  "topic": "Base on Javascript",
                  "children": []
                },
                {
                  "id": 12,
                  "topic": "Base on HTML5",
                  "children": []
                },
                {
                  "id": 13,
                  "topic": "Depends on you",
                  "children": []
                }
              ]
            },
            {
              "id": 14,
              "topic": "test node",
              "children": [
                {
                  "id": 15,
                  "topic": "I'm from local variable",
                  "children": []
                },
                {
                  "id": 16,
                  "topic": "I can do everything",
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    }
  });
});

test('basic', () => {
  const md = [
    '- A',
    "\t- B",
    "- C",
  ].join("\n");
  const mm = MD2MMConverter.convertMD2MM('top', md)
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: 'jsMind remote', author: 'hizzgdev@163.com', version: '0.2' },
    format: 'node_tree',
    data: {
      id: 'root', topic: 'top', children: [
        {id: 1, topic: 'A', children: [
          {id: 2, topic: 'B', children: []}
        ]},
        {id: 3, topic: 'C', children: []}
      ] }
  });
});

test('dedent 2 step', () => {
  const md = [
    '- A1',
    '- A2',
    "\t- B1",
    "\t- B2",
    "\t\t- C1",
    "\t\t- C2",
    "- A3",
  ].join("\n");
  const mm = MD2MMConverter.convertMD2MM('top', md)
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: 'jsMind remote', author: 'hizzgdev@163.com', version: '0.2' },
    format: 'node_tree',
    data: {
      id: 'root', topic: 'top', children: [
        {id: 1, topic: 'A1', children: []},
        {id: 2, topic: 'A2', children: [
            {id: 3, topic: 'B1', children: []},
            {id: 4, topic: 'B2', children: [
                {id: 5, topic: 'C1', children: []},
                {id: 6, topic: 'C2', children: []},
              ]},
          ]},
        {id: 7, topic: 'A3', children: []}
      ] }
  });
});

test('dedent 3 step', () => {
  const md = [
    '- A1',
    '- A2',
    "\t- B1",
    "\t- B2",
    "\t\t- C1",
    "\t\t- C2",
    "\t\t\t- D1",
    "\t\t\t- D2",
    "- A3",
  ].join("\n");
  const mm = MD2MMConverter.convertMD2MM('top', md)
  console.log(JSON.stringify(mm, null, 2));
  expect(mm).toStrictEqual({
    meta: { name: 'jsMind remote', author: 'hizzgdev@163.com', version: '0.2' },
    format: 'node_tree',
    data: {
      id: 'root', topic: 'top', children: [
        {id: 1, topic: 'A1', children: []},
        {id: 2, topic: 'A2', children: [
            {id: 3, topic: 'B1', children: []},
            {id: 4, topic: 'B2', children: [
                {id: 5, topic: 'C1', children: []},
                {id: 6, topic: 'C2', children: [
                    {id: 7, topic: 'D1', children: []},
                    {id: 8, topic: 'D2', children: []},
                  ]},
              ]},
          ]},
        {id: 9, topic: 'A3', children: []}
      ] }
  });
});
