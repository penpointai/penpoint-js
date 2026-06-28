/**
 * Fully-typed client over EVERY Penpoint route, generated from the OpenAPI spec
 * (F6/D9). This is a strict superset of the hand-written resource classes — it
 * covers all routes, with request/response types derived from the same Zod
 * schemas the server validates against. Regenerate types with `yarn generate`.
 *
 * Example:
 *   const api = createPenpointClient({ apiKey });
 *   const { data } = await api.POST('/v1/discrete-references/{effortMode}', {
 *     params: { path: { effortMode: 'standard' } },
 *     body: { fileId, prompt },
 *   });
 *   data?.references // CanonicalReference[]
 */
import createClient, { type Client } from 'openapi-fetch';

import type { paths } from './generated/schema';

export interface GeneratedClientConfig {
  apiKey: string;
  /** API host (paths already include the /v1 prefix). */
  baseUrl?: string;
}

export function createPenpointClient(
  config: GeneratedClientConfig,
): Client<paths> {
  return createClient<paths>({
    baseUrl: config.baseUrl ?? 'https://api.penpoint.ai',
    headers: { 'x-api-key': config.apiKey },
  });
}
