/**
 * Core types for the Penpoint API
 */

export interface ReferenceMetadata {
  page?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  labels: string[];
}

export interface ReferencePart {
  id: number;
  name: string;
  segment: string;
  metadata: ReferenceMetadata;
  document_id: number;
  page_number: number;
  chunk_number: number;
  vector_distance: number;
  text_distance: number;
  hybrid_score: number;
}

/**
 * Canonical, versioned, cross-modal reference contract (`penpoint.ref/1`).
 *
 * The API returns these on `DiscreteReferenceResponse.references` alongside the
 * legacy `refs.parts`. Prefer `references` in new code — it's a stable, typed
 * contract with a single discriminated `locator` per modality, instead of the
 * loose per-modality `metadata` bag on `ReferencePart`. Mirror of the backend's
 * `lib/ai/discreteReferences/canonical.ts`; bump the version on breaking changes.
 */
export const PENPOINT_REF_SCHEMA_VERSION = 'penpoint.ref/1' as const;

export type ReferenceLocator =
  | { type: 'pdf' | 'image'; page: number | null; bbox: [number, number, number, number] | null }
  | { type: 'tabular'; row: number | null }
  | { type: 'audio'; startTime: number | null; endTime: number | null }
  | { type: 'text'; position: number | null };

export interface CanonicalReference {
  /** Stable id for the cited span. */
  id: string;
  /** The cited text content. */
  segment: string;
  /** Confidence in [0,1], or null if unavailable. */
  confidence: number | null;
  /** Where the span lives in the source, normalized per modality. */
  locator: ReferenceLocator;
}

export interface DiscreteReferenceResponse {
  /** Legacy reference shape — still emitted for back-compat. */
  refs: {
    parts: ReferencePart[];
  };
  /** `penpoint.ref/1` — present on current servers; prefer this. */
  schemaVersion?: typeof PENPOINT_REF_SCHEMA_VERSION;
  /** True when the document contains nothing relevant (honest "not found"). */
  abstained?: boolean;
  /** Canonical cross-modal references (F4). Prefer over `refs.parts`. */
  references?: CanonicalReference[];
}

export interface File {
  id: number;
  name: string;
  pages?: number;
  summary?: string;
  metadata?: string;
  expires_at?: string;
  created_at: string;
  storage_location?: string;
  company_id?: number;
}

export interface FileList {
  object: string;
  has_more: boolean;
  data: File[];
}

export interface FileUploadRequest {
  file: File | Buffer | string;
  filename: string;
  summary?: string;
  mimeType?: string;
}

export interface FileUpdateRequest {
  summary: string;
  expirationDate?: string;
}

export interface DiscreteReferenceRequest {
  fileId: number;
  prompt: string;
  markupFile: boolean;
  markupColor?: string | undefined;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface Chunk {
  id: number;
  document_id: number;
  metadata: Record<string, any>;
  segment: string;
  page_number: number;
  chunk_number: number;
  created_at: string;
}

export interface ChunksResponse {
  chunks: Chunk[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ClientConfig {
  apiKey: string;
  baseUrl?: string;
  apiPrefix?: string;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError extends Error {
  message: string;
  status?: number;
  response?: unknown;
}

export class PenpointError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PenpointError';
  }
}

export class PenpointApiError extends PenpointError {
  public readonly status: number | undefined;
  public readonly response: unknown;

  constructor(message: string, status?: number, response?: unknown) {
    super(message);
    this.name = 'PenpointApiError';
    this.status = status;
    this.response = response;
  }
}

export class PenpointValidationError extends PenpointError {
  constructor(message: string) {
    super(message);
    this.name = 'PenpointValidationError';
  }
}
