import { Group, Layer, Rect, Stage, Transformer } from 'react-konva';
import type { RemotePeerAwareness } from '../awarenessTypes';
import { useKonvaCanvasController } from './useKonvaCanvasController';
import {
  CanvasSelectionStyleBar,
  CanvasTextEditOverlay,
  CanvasZoomHud,
  CommittedShapeNode,
  DraftShapeNode,
  RemotePeerAwarenessLayer,
} from './presentation';

export type KonvaCanvasCollaborationProps = {
  remotePeers: RemotePeerAwareness[];
  localUserId: string;
  onPointerWorldMove: (pt: { x: number; y: number }) => void;
  onStageMouseLeaveExtra: () => void;
};

export function KonvaCanvas({
  collaboration,
  readOnly = false,
}: {
  collaboration?: KonvaCanvasCollaborationProps | null;
  readOnly?: boolean;
} = {}) {
  const {
    containerRef,
    stageRef,
    transformerRef,
    shapeRefs,
    tool,
    shapes,
    selectedId,
    editingId,
    stickyColor,
    draft,
    colors,
    viewport,
    size,
    spaceDown,
    zoomPercent,
    originX,
    originY,
    patternImage,
    layoutKey,
    cursorClass,
    setEditingId,
    setSelectedId,
    updateShape,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    endPanOnLeave,
    zoomFromCenter,
    resetView,
  } = useKonvaCanvasController(
    collaboration
      ? {
          onPointerWorldMove: collaboration.onPointerWorldMove,
          onStageMouseLeaveExtra: collaboration.onStageMouseLeaveExtra,
          readOnly,
        }
      : { readOnly }
  );

  return (
    <div ref={containerRef} className={`absolute inset-0 touch-none ${cursorClass}`} style={{ touchAction: 'none' }}>
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={endPanOnLeave}
      >
        <Layer>
          <Group x={originX} y={originY} scaleX={viewport.scale} scaleY={viewport.scale}>
            <Rect
              name="canvas-background"
              x={-5000}
              y={-5000}
              width={10000}
              height={10000}
              fillPatternImage={patternImage as unknown as HTMLImageElement}
              fillPatternRepeat="repeat"
              listening
              onTap={(e) => {
                e.cancelBubble = true;
                if (tool === 'select') {
                  setSelectedId(null);
                  setEditingId(null);
                }
              }}
            />
            {shapes.map((s) => (
              <CommittedShapeNode
                key={s.id}
                shape={s}
                interaction={{
                  interactive: tool === 'select' && !readOnly,
                  onSelect: () => setSelectedId(s.id),
                  onChange: (next) => {
                    if (readOnly) return;
                    updateShape(s.id, next);
                  },
                  innerRef: (node) => {
                    if (node) shapeRefs.current.set(s.id, node);
                    else shapeRefs.current.delete(s.id);
                  },
                  isEditing: !readOnly && editingId === s.id,
                  onBeginEdit: () => {
                    if (readOnly) return;
                    setEditingId(s.id);
                  },
                }}
              />
            ))}
            {draft ? <DraftShapeNode draft={draft} stroke={colors.primaryBg} stickyFill={stickyColor} /> : null}

            {collaboration ? (
              <RemotePeerAwarenessLayer
                peers={collaboration.remotePeers}
                localUserId={collaboration.localUserId}
                shapes={shapes}
              />
            ) : null}

            <Transformer
              ref={transformerRef}
              visible={!readOnly}
              rotateEnabled
              borderStroke="#2962ff"
              borderStrokeWidth={1}
              anchorFill="#ffffff"
              anchorStroke="#2962ff"
              boundBoxFunc={(_oldBox, newBox) => ({
                ...newBox,
                width: Math.max(8, newBox.width),
                height: Math.max(8, newBox.height),
              })}
            />
          </Group>
        </Layer>
      </Stage>

      <CanvasTextEditOverlay
        editingId={readOnly ? null : editingId}
        shapes={shapes}
        updateShape={updateShape}
        onClose={() => setEditingId(null)}
        stageRef={stageRef}
        shapeRefs={shapeRefs}
        layoutKey={layoutKey}
        viewportScale={viewport.scale}
      />

      <CanvasSelectionStyleBar
        selectedId={selectedId}
        shapes={shapes}
        updateShape={updateShape}
        hidden={readOnly || editingId !== null || tool !== 'select'}
        stageRef={stageRef}
        shapeRefs={shapeRefs}
      />

      <CanvasZoomHud
        zoomPercent={zoomPercent}
        onZoomOut={() => zoomFromCenter(1 / 1.1)}
        onZoomIn={() => zoomFromCenter(1.1)}
        onResetView={resetView}
      />

      {spaceDown ? (
        <div className="pointer-events-none absolute left-3 top-3 z-40 rounded-md bg-surface-container-high/90 px-2 py-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          Pan mode — drag
        </div>
      ) : null}
    </div>
  );
}
