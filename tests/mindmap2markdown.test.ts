import { object2mindmap } from "../src/mindmap/format/node_tree/object2mindmap";
import { mindmap2markdown } from "../src/mindmap/format/markdown/mindmap2markdown";

const mind = {
  id: "root",
  topic: "jsMind",
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
        { id: "powerful1", topic: "Base on Javascript" },
        { id: "powerful2", topic: "Base on HTML5" },
        { id: "powerful3", topic: "Depends on you" },
      ],
    },
    {
      id: "other",
      topic: "test node",
      direction: "left",
      children: [
        { id: "other1", topic: "I'm from local variable" },
        { id: "other2", topic: "I can do everything" },
      ],
    },
  ],
};

test("basic", () => {
  const mindobj = object2mindmap(mind);
  console.log(JSON.stringify(mindobj.root!.toObject(), null, 2));
  const md = mindmap2markdown(mindobj);
  expect(md).toBe(
    [
      "- jsMind",
      "\t+ Easy",
      "\t\t+ Easy to show",
      "\t\t+ Easy to edit",
      "\t\t+ Easy to store",
      "\t\t+ Easy to embed",
      "\t- Open Source",
      "\t\t- on GitHub",
      "\t\t- BSD License",
      "\t- Powerful",
      "\t\t- Base on Javascript",
      "\t\t- Base on HTML5",
      "\t\t- Depends on you",
      "\t+ test node",
      "\t\t+ I'm from local variable",
      "\t\t+ I can do everything",
      "",
    ].join("\n")
  );
});

test("multiline", () => {
  const mind = {
    id: "root",
    topic: "jsMind",
    children: [
      {
        id: "easy",
        topic: "Easy 1\nEasy 2\nEasy 3",
        direction: "left",
        children: [
          {
            id: "abc",
            topic: "Abc 1\nAbc 2\nAbc 3",
            direction: "left",
          },
        ],
      },
    ],
  };
  const mindobj = object2mindmap(mind);
  const md = mindmap2markdown(mindobj);
  expect(md).toBe(
    [
      "- jsMind",
      "\t+ Easy 1 \\",
      "\t  Easy 2 \\",
      "\t  Easy 3",
      "\t\t+ Abc 1 \\",
      "\t\t  Abc 2 \\",
      "\t\t  Abc 3",
      "",
    ].join("\n")
  );
});
