/** Viewport and drawing tuning — single source for domain + UI. */
export const CANVAS_MIN_SCALE = 0.05;
export const CANVAS_MAX_SCALE = 8;
export const GRID_CELL = 24;
export const MIN_SHAPE_PX = 3;
export const PEN_MIN_DIST = 1.5;
export const DEFAULT_STROKE = '#2962ff';
export const STROKE_WIDTH = 2;
export const PEN_STROKE_WIDTH = 2.5;
/** UI range for editing stroke width on shapes */
export const STROKE_WIDTH_MIN = 0;
export const STROKE_WIDTH_MAX = 24;

/**
 * Extra space above the shape top when anchoring floating toolbars so they sit
 * clearly above the Transformer (rotation handle + selection chrome).
 */
export const TRANSFORMER_TOOLBAR_CLEARANCE_PX = 52;

/** Default corner radius for `roundRect` tool commits and card-style rects */
export const DEFAULT_ROUND_RECT_CORNER_RADIUS = 12;
