/**
 * Penpoint JavaScript/TypeScript Client Library
 *
 * Official client library for the Penpoint API
 */

// Main client
export { PenpointClient } from './client';

// Resource classes
export { FilesResource } from './resources/files';
export { DiscreteReferencesResource } from './resources/discrete-references';

// HTTP client
export { HttpClient } from './http-client';

// Canonical reference contract (penpoint.ref/1)
export { PENPOINT_REF_SCHEMA_VERSION } from './types';
export {
  getReferences,
  normalizeReferences,
  locatorFromPart,
  inferModality,
} from './references';

// Types and interfaces
export type {
  ClientConfig,
  RequestOptions,
  ApiResponse,
  ApiError,
  File,
  FileList,
  FileUploadRequest,
  FileUpdateRequest,
  DiscreteReferenceRequest,
  DiscreteReferenceResponse,
  ReferencePart,
  ReferenceMetadata,
  ReferenceLocator,
  CanonicalReference,
  PaginationParams,
  Chunk,
  ChunksResponse,
} from './types';

// Error classes
export {
  PenpointError,
  PenpointApiError,
  PenpointValidationError,
} from './types';

// Re-export for default export
import { PenpointClient } from './client';
export default PenpointClient;
