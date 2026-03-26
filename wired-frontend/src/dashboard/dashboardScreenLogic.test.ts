import { describe, expect, it } from 'vitest';
import {
  buildCanvasPathForDocumentId,
  DASHBOARD_LOGIN_NEXT_ENCODED,
  formatDocumentEditedLabel,
  normalizeDocumentsViewMode,
  resolveDashboardViewState,
} from './dashboardScreenLogic';

describe('resolveDashboardViewState', () => {
  it('returns loading when pending, error, or no user', () => {
    expect(
      resolveDashboardViewState({
        mePending: true,
        meError: false,
        hasUser: false,
      })
    ).toBe('loading');
    expect(
      resolveDashboardViewState({
        mePending: false,
        meError: true,
        hasUser: true,
      })
    ).toBe('loading');
    expect(
      resolveDashboardViewState({
        mePending: false,
        meError: false,
        hasUser: false,
      })
    ).toBe('loading');
  });

  it('returns ready when user is present and query settled', () => {
    expect(
      resolveDashboardViewState({
        mePending: false,
        meError: false,
        hasUser: true,
      })
    ).toBe('ready');
  });
});

describe('buildCanvasPathForDocumentId', () => {
  it('encodes the document id in the query string', () => {
    expect(buildCanvasPathForDocumentId('abc')).toBe('/canvas?document=abc');
    expect(buildCanvasPathForDocumentId('a b')).toBe('/canvas?document=a%20b');
  });
});

describe('DASHBOARD_LOGIN_NEXT_ENCODED', () => {
  it('matches encoded /dashboard', () => {
    expect(DASHBOARD_LOGIN_NEXT_ENCODED).toBe('%2Fdashboard');
  });
});

describe('normalizeDocumentsViewMode', () => {
  it('defaults to grid when undefined', () => {
    expect(normalizeDocumentsViewMode(undefined)).toBe('grid');
  });

  it('keeps list and grid values', () => {
    expect(normalizeDocumentsViewMode('list')).toBe('list');
    expect(normalizeDocumentsViewMode('grid')).toBe('grid');
  });
});

describe('formatDocumentEditedLabel', () => {
  it('returns just now for under one minute', () => {
    const now = Date.parse('2025-01-15T12:00:00.000Z');
    const iso = '2025-01-15T11:59:30.000Z';
    expect(formatDocumentEditedLabel(iso, now)).toBe('Edited just now');
  });

  it('returns minutes under one hour', () => {
    const now = Date.parse('2025-01-15T12:00:00.000Z');
    const iso = '2025-01-15T11:30:00.000Z';
    expect(formatDocumentEditedLabel(iso, now)).toBe('Edited 30m ago');
  });

  it('returns hours under 48 hours', () => {
    const now = Date.parse('2025-01-15T12:00:00.000Z');
    const iso = '2025-01-14T12:00:00.000Z';
    expect(formatDocumentEditedLabel(iso, now)).toBe('Edited 24h ago');
  });

  it('returns formatted date for 48h or more', () => {
    const now = Date.parse('2025-01-15T12:00:00.000Z');
    const iso = '2025-01-10T12:00:00.000Z';
    const label = formatDocumentEditedLabel(iso, now);
    expect(label.startsWith('Edited ')).toBe(true);
    expect(label).not.toMatch(/ago$/);
  });
});
