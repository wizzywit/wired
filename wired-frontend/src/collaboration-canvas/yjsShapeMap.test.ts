import * as Y from 'yjs';
import { describe, expect, it } from 'vitest';
import { getTemplateShapes } from '../templates/getTemplateShapes';
import {
  base64ToUint8,
  buildInitialYjsBase64FromShapes,
  getShapesRoot,
  yMapToShapes,
} from './yjsShapeMap';

describe('buildInitialYjsBase64FromShapes', () => {
  it('roundtrips a full template through Yjs encode/decode', () => {
    const shapes = getTemplateShapes('user-flowchart');
    expect(shapes?.length).toBeGreaterThan(0);
    const b64 = buildInitialYjsBase64FromShapes(shapes!);
    const doc = new Y.Doc();
    Y.applyUpdate(doc, base64ToUint8(b64));
    const out = yMapToShapes(getShapesRoot(doc));
    expect(out.map((s) => s.id)).toEqual(shapes!.map((s) => s.id));
    expect(out.length).toBe(shapes!.length);
  });
});
