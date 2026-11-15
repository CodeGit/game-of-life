// Sizes shared by the page layout and by the zoom, which needs to know how much room the board
// has. Keeping them in one place means the two cannot drift apart.
export const HEADER_HEIGHT = 88;
export const FOOTER_HEIGHT = 130;
export const PAGE_PADDING = 16; // on every side of the page, in pixels

// The header, board and footer share one column. It follows the board's width, but is never
// narrower than the title and play bar need, and never wider than this.
export const MIN_COLUMN_WIDTH = 360;
export const MAX_COLUMN_WIDTH = 640;

// The room the board has in a window of this size: what is left after the header, the footer
// and the padding around the page.
export function boardSpace(windowWidth: number, windowHeight: number) {
  return {
    width: Math.max(0, windowWidth - 2 * PAGE_PADDING),
    height: Math.max(0, windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT - 2 * PAGE_PADDING),
  };
}

// How wide the header, board and footer column is. It follows the board, but is never narrower
// than the title and play bar need, and never wider than the maximum. Whatever that gives, it
// cannot be wider than the window: a bigger board scrolls inside the column instead.
export function columnWidth(boardWidth: number, availableWidth: number) {
  const wanted = Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, boardWidth));
  return Math.min(wanted, availableWidth);
}
