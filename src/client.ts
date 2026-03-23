/**
 * Main Penpoint client class
 */

import type { ClientConfig } from './types';
import { HttpClient } from './http-client';
import { FilesResource } from './resources/files';
import { DiscreteReferencesResource } from './resources/discrete-references';
import { PenpointValidationError } from './types';

export class PenpointClient {
  public readonly files: FilesResource;
  public readonly discreteReferences: DiscreteReferencesResource;
  private readonly httpClient: HttpClient;

  constructor(config: ClientConfig) {
    if (!config.apiKey) {
      throw new PenpointValidationError('API key is required');
    }

    const baseUrl = config.baseUrl || 'https://api.penpoint.ai';
    const apiPrefix = config.apiPrefix || '/v1';
    const timeout = config.timeout || 30000;
    const maxRetries = config.maxRetries || 3;
    const userAgent = config.userAgent || `penpoint-js/${this.getVersion()}`;

    const defaultHeaders = {
      'x-api-key': config.apiKey,
      'User-Agent': userAgent,
    };

    this.httpClient = new HttpClient(
      baseUrl,
      apiPrefix,
      defaultHeaders,
      timeout,
      maxRetries
    );

    this.files = new FilesResource(this.httpClient);
    this.discreteReferences = new DiscreteReferencesResource(this.httpClient);
  }

  /**
   * Get the library version
   */
  private getVersion(): string {
    try {
      // This will be replaced during build
      return '0.1.5';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get the underlying HTTP client for advanced usage
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }
}
