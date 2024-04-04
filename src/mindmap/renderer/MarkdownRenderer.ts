import { TextFormatter } from "./TextFormatter";

const SPECIAL: Record<string, string> = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
  "{": "&#123;",
  "}": "&#125;",
};

function escapeHtml(src: string): string {
  return src.replace(/([&><"'`{}])/g, (_, sp) => {
    return SPECIAL[sp];
  });
}

export class MarkdownRenderer implements TextFormatter {
  render(src: string): string {
    return src.replace(
      /(\n)|\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|([&><"'`{}])|(.)/g,
      (_, nl, bold, italic, code, sp, dot) => {
        if (nl) {
          return "<br>";
        } else if (bold) {
          return `<b>${escapeHtml(bold)}</b>`;
        } else if (italic) {
          return `<i>${escapeHtml(italic)}</i>`;
        } else if (code) {
          return `<code>${escapeHtml(code)}</code>`;
        } else if (sp) {
          return SPECIAL[sp];
        } else if (dot) {
          return dot;
        }
      },
    );
  }
}
