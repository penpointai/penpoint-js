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
