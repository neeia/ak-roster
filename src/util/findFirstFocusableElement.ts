export default function findFirstFocusableElement(container: HTMLElement) {
  return Array.from(container.getElementsByTagName("*")).find(isFocusable);
}

const isFocusable = (item: any) => {
  if (item.tabIndex < 0) {
    return false;
  }
  switch (item.tagName) {
    case "A":
      return !!item.href;
    case "INPUT":
      return item.type !== "hidden" && !item.disabled;
    case "SELECT":
    case "TEXTAREA":
    case "BUTTON":
      return !item.disabled;
    default:
      return false;
  }
};
