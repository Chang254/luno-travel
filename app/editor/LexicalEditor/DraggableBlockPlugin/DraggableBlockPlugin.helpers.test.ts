import {
  DRAGGABLE_BLOCK_MENU_ATTRIBUTE,
  isOnDraggableBlockMenu,
} from "./DraggableBlockPlugin.helpers";

describe("isOnDraggableBlockMenu", () => {
  it("returns true for the menu element itself", () => {
    const menu = document.createElement("div");
    menu.setAttribute(DRAGGABLE_BLOCK_MENU_ATTRIBUTE, "true");

    expect(isOnDraggableBlockMenu(menu)).toBe(true);
  });

  it("returns true for a descendant of the menu element", () => {
    const menu = document.createElement("div");
    menu.setAttribute(DRAGGABLE_BLOCK_MENU_ATTRIBUTE, "true");
    const icon = document.createElement("svg");
    menu.appendChild(icon);

    expect(isOnDraggableBlockMenu(icon)).toBe(true);
  });

  it("returns false for an element outside the menu", () => {
    const outside = document.createElement("div");

    expect(isOnDraggableBlockMenu(outside)).toBe(false);
  });
});
