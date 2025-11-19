/**
 * Files resource for file-related operations
 */

import type {
  File,
  FileList,
  FileUploadRequest,
  FileUpdateRequest,
  PaginationParams,
  ChunksResponse,
} from '../types';
import { HttpClient } from '../http-client';
import { PenpointValidationError } from '../types';

export class FilesResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();

    const mimeTypes: Record<string, string> = {
      // Text files
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      css: 'text/css',
      js: 'text/javascript',
      json: 'application/json',
      xml: 'text/xml',
      csv: 'text/csv',

      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      bmp: 'image/bmp',
      ico: 'image/x-icon',

      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',

      // Video
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      webm: 'video/webm',

      // Archives
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      tar: 'application/x-tar',
      gz: 'application/gzip',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * List files with pagination
   */
  async list(params?: PaginationParams): Promise<FileList> {
    const query: Record<string, string | number> = {};

    if (params?.limit !== undefined) {
      query.limit = params.limit;
    }

    if (params?.offset !== undefined) {
      query.offset = params.offset;
    }

    const response = await this.client.get<FileList>('/files', { query });
    return response.data;
  }

  /**
   * Upload a file to the API
   */
  /**
   * Upload a file to the API
   */
  async upload(request: FileUploadRequest): Promise<File> {
    if (!request.filename) {
      throw new PenpointValidationError('Filename is required');
    }

    const formData = new FormData();

    if (request.file instanceof File) {
      formData.append('file', request.file);
    } else if (request.file instanceof Buffer) {
      // Create a Blob with the correct MIME type based on file extension or user override
      const mimeType = request.mimeType || this.getMimeType(request.filename);
      const blob = new Blob([new Uint8Array(request.file)], { type: mimeType });
      formData.append('file', blob, request.filename);
    } else if (typeof request.file === 'string') {
      // Assume it's a file path or URL
      throw new PenpointValidationError(
        'File upload from string path is not supported in browser environment'
      );
    } else {
      throw new PenpointValidationError('Invalid file type');
    }

    if (request.summary) {
      formData.append('summary', request.summary);
    }

    const response = await this.client.post<File>('/files', formData);
    return response.data;
  }

  /**
   * Update file metadata
   */
  async update(fileId: number, request: FileUpdateRequest): Promise<File> {
    if (!request.summary) {
      throw new PenpointValidationError('Summary is required');
    }

    const body: Record<string, string> = {
      summary: request.summary,
    };

    if (request.expirationDate) {
      body.expirationDate = request.expirationDate;
    }

    const response = await this.client.put<File>(
      `/files/${fileId}`,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.data;
  }

  /**
   * Delete a file
   */
  async delete(fileId: number): Promise<boolean> {
    await this.client.delete(`/files/${fileId}`);
    return true;
  }

  /**
   * Get a specific file by ID
   */
  async get(fileId: number): Promise<File> {
    const response = await this.client.get<File>(`/files/${fileId}`);
    return response.data;
  }

  /**
   * Get chunks for a specific file with pagination
   */
  async chunks(
    fileId: number,
    params?: PaginationParams
  ): Promise<ChunksResponse> {
    const query: Record<string, string | number> = {};

    if (params?.limit !== undefined) {
      query.limit = params.limit;
    }

    if (params?.offset !== undefined) {
      query.offset = params.offset;
    }

    const response = await this.client.get<ChunksResponse>(
      `/files/${fileId}/chunks`,
      { query }
    );
    return response.data;
  }
}
