export function findMcnode(htmlElement: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = htmlElement;
  while (el) {
    if (el.tagName.toLowerCase() == "mcnode") {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
