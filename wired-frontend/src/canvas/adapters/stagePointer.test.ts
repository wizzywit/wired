import { describe, expect, it } from 'vitest'
import { clientToWorldFromStage } from './stagePointer'
import type { Viewport } from '../domain/viewport'
import { screenPointToWorld } from '../domain/viewport'

describe('clientToWorldFromStage', () => {
  it('returns null when container is missing', () => {
    const v: Viewport = { scale: 1, offsetX: 0, offsetY: 0 }
    expect(clientToWorldFromStage(0, 0, null, 200, 200, v)).toBeNull()
  })

  it('matches screenPointToWorld when container is at origin with same size', () => {
    const v: Viewport = { scale: 1, offsetX: 0, offsetY: 0 }
    const el = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        right: 200,
        bottom: 200,
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as unknown as HTMLElement

    const a = clientToWorldFromStage(100, 100, el, 200, 200, v)
    const b = screenPointToWorld(100, 100, 200, 200, v)
    expect(a).toEqual(b)
  })
})
