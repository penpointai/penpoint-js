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
 * These types are now GENERATED from the backend's OpenAPI export (F6/D9) —
 * `src/generated/schema.d.ts`, regenerate with `yarn generate`. They are no
 * longer hand-maintained; the backend's Zod `canonical.ts` is the single source
 * of truth. The API returns them on `DiscreteReferenceResponse.references`
 * alongside the legacy `refs.parts`; prefer `references` in new code.
 */
import type { components } from './generated/schema';

export const PENPOINT_REF_SCHEMA_VERSION = 'penpoint.ref/1' as const;

export type ReferenceLocator = components['schemas']['ReferenceLocator'];
export type CanonicalReference = components['schemas']['CanonicalReference'];

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
