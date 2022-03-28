import { MarkdownRenderer } from "../../src/mindmap/renderer/MarkdownRenderer";

const renderer = new MarkdownRenderer();

test("basic", () => {
  expect(renderer.render("<^o^>")).toStrictEqual("&lt;^o^&gt;");
  expect(renderer.render("a\nb")).toStrictEqual("a<br>b");
  expect(renderer.render("**a**")).toStrictEqual("<b>a</b>");
  expect(renderer.render("*i&*")).toStrictEqual("<i>i&amp;</i>");
  expect(renderer.render("`i&`")).toStrictEqual("<code>i&amp;</code>");
  expect(renderer.render("hello`")).toStrictEqual("hello&#96;");
});
