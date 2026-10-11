/** Data attribute used to identify the drag-handle menu for Lexical's drag/drop event handling. */
export const DRAGGABLE_BLOCK_MENU_ATTRIBUTE = "data-draggable-block-menu";

export function isOnDraggableBlockMenu(element: HTMLElement): boolean {
  return !!element.closest(`[${DRAGGABLE_BLOCK_MENU_ATTRIBUTE}]`);
}
