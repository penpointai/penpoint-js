/**
 * Helpers for the canonical `penpoint.ref/1` reference contract.
 *
 * `getReferences(response)` is the one call new consumers should use: it returns
 * the server's canonical `references` when present, and otherwise derives them
 * from the legacy `refs.parts` bag (best-effort) so code keeps working against
 * older Penpoint servers.
 */
import type {
  CanonicalReference,
  DiscreteReferenceResponse,
  ReferenceLocator,
  ReferencePart,
} from './types';

const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);

type LocatorType = ReferenceLocator['type'];

/**
 * Best-effort modality from a legacy part's metadata. Note: PDF vs image can't be
 * distinguished from metadata alone, so both surface as "pdf" in the fallback —
 * current servers send the real type on `references`, so this only matters for
 * old servers.
 */
export function inferModality(part: ReferencePart): LocatorType {
  const m = (part.metadata ?? {}) as unknown as Record<string, unknown>;
  if (typeof m.sourceRow === 'number') return 'tabular';
  if (typeof m.start_time === 'number' || typeof m.startTime === 'number') return 'audio';
  if (typeof m.x === 'number') return 'pdf';
  return 'text';
}

export function locatorFromPart(
  part: ReferencePart,
  type: LocatorType = inferModality(part),
): ReferenceLocator {
  const m = (part.metadata ?? {}) as unknown as Record<string, unknown>;
  switch (type) {
    case 'pdf':
    case 'image': {
      const page =
        typeof m.page === 'number'
          ? m.page + 1
          : typeof part.page_number === 'number'
            ? part.page_number
            : null;
      const hasBox = typeof m.x === 'number';
      return {
        type,
        page,
        bbox: hasBox
          ? [num(m.x) ?? 0, num(m.y) ?? 0, num(m.w) ?? 0, num(m.h) ?? 0]
          : null,
      };
    }
    case 'tabular':
      return { type: 'tabular', row: num(m.sourceRow) };
    case 'audio':
      return {
        type: 'audio',
        startTime: num(m.start_time) ?? num(m.startTime),
        endTime: num(m.end_time) ?? num(m.endTime),
      };
    default:
      return { type: 'text', position: num(m.y) };
  }
}

/** Derive canonical references from the legacy `refs.parts` shape. */
export function normalizeReferences(parts: ReferencePart[]): CanonicalReference[] {
  return (parts ?? []).map((p, i) => {
    const partId = (p as { partId?: string | number }).partId;
    const confidence = (p as { confidence?: number }).confidence;
    return {
      id: String(partId ?? p.id ?? `ref-${i}`),
      segment: p.segment ?? '',
      confidence: typeof confidence === 'number' ? confidence : null,
      locator: locatorFromPart(p),
    };
  });
}

/**
 * Canonical references for a discrete-reference response. Prefers the server's
 * `references` (penpoint.ref/1); falls back to deriving from `refs.parts`.
 */
export function getReferences(
  response: DiscreteReferenceResponse,
): CanonicalReference[] {
  if (response.references) return response.references;
  return normalizeReferences(response.refs?.parts ?? []);
}
