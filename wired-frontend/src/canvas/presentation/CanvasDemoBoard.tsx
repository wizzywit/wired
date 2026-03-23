import { Group, Line, Rect, Text } from 'react-konva'
import type { CanvasBoardColors } from './canvasBoardColors'

type CanvasDemoBoardProps = {
  colors: CanvasBoardColors
}

/** Sample board content (view layer only). */
export function CanvasDemoBoard({ colors }: CanvasDemoBoardProps) {
  return (
    <>
      <Line
        points={[-188, 0, -96, 0]}
        stroke={colors.outlineSoft}
        strokeWidth={2}
        dash={[8, 8]}
        listening={false}
      />
      <Line
        points={[96, 0, 188, 0]}
        stroke={colors.outlineSoft}
        strokeWidth={2}
        listening={false}
      />

      <Group x={-380} y={-48} listening={false}>
        <Rect
          width={192}
          height={96}
          cornerRadius={12}
          fill={colors.cardBg}
          stroke={colors.outlineSoft}
          strokeWidth={1}
          opacity={0.95}
          shadowBlur={8}
          shadowColor="rgba(0,0,0,0.08)"
        />
        <Text
          x={16}
          y={12}
          text="STEP 01"
          fontSize={10}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
          letterSpacing={1.6}
          fill={colors.outline}
        />
        <Text
          x={16}
          y={44}
          text="Market Analysis"
          fontSize={15}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
          fill={colors.onSurface}
        />
      </Group>

      <Group x={-96} y={-48} listening={false}>
        <Rect
          width={192}
          height={96}
          cornerRadius={12}
          fill={colors.primaryBg}
          shadowBlur={16}
          shadowColor="rgba(41,98,255,0.25)"
        />
        <Text
          x={16}
          y={12}
          text="IN PROGRESS"
          fontSize={10}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
          letterSpacing={1.6}
          fill="rgba(255,255,255,0.7)"
        />
        <Text
          x={16}
          y={44}
          text="Core Value Prop"
          fontSize={15}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
          fill={colors.onPrimary}
        />
      </Group>

      <Group x={188} y={-48} listening={false}>
        <Rect
          width={192}
          height={96}
          cornerRadius={12}
          fill={colors.cardBg}
          stroke={colors.outlineSoft}
          strokeWidth={1}
          opacity={0.95}
          shadowBlur={8}
          shadowColor="rgba(0,0,0,0.08)"
        />
        <Text
          x={16}
          y={12}
          text="NEXT UP"
          fontSize={10}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
          letterSpacing={1.6}
          fill={colors.outline}
        />
        <Text
          x={16}
          y={44}
          text="Execution Plan"
          fontSize={15}
          fontFamily="Inter, sans-serif"
          fontStyle="bold"
          fill={colors.onSurface}
        />
      </Group>

      <Group x={-320} y={-220} rotation={-3} listening={false}>
        <Rect
          width={160}
          height={140}
          cornerRadius={6}
          fill={colors.secondaryFixed}
          shadowBlur={6}
          shadowColor="rgba(0,0,0,0.08)"
        />
        <Text
          x={16}
          y={16}
          width={128}
          text="Look into competitor pricing for Q1 launch."
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fontStyle="normal"
          fill={colors.onSecondaryFixed}
        />
      </Group>

      <Group x={-80} y={200} rotation={-1} listening={false}>
        <Rect
          width={160}
          height={120}
          cornerRadius={6}
          fill={colors.primaryFixed}
          shadowBlur={6}
          shadowColor="rgba(0,0,0,0.08)"
        />
        <Text
          x={14}
          y={14}
          width={132}
          text="Update: Revenue targets confirmed with CFO."
          fontSize={13}
          fontFamily="Inter, sans-serif"
          fontStyle="normal"
          fill={colors.onPrimaryFixed}
        />
      </Group>

      {[
        { x: -260, y: -140, fill: '#2962ff', name: 'Alex' },
        { x: 200, y: 100, fill: '#705d00', name: 'Jordan' },
        { x: 420, y: -180, fill: '#b0004f', name: 'Maya' },
      ].map((c) => (
        <Group key={c.name} x={c.x} y={c.y} listening={false}>
          <Line
            points={[0, 0, 14, 18, 4, 18, 0, 24]}
            closed
            fill={c.fill}
            stroke="#ffffff"
            strokeWidth={2}
          />
          <Rect
            x={10}
            y={18}
            width={Math.max(36, c.name.length * 7 + 12)}
            height={18}
            cornerRadius={9}
            fill={c.fill}
          />
          <Text
            x={16}
            y={22}
            text={c.name}
            fontSize={10}
            fontFamily="Inter, sans-serif"
            fontStyle="bold"
            fill="#ffffff"
          />
        </Group>
      ))}
    </>
  )
}
