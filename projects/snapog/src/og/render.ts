// SnapOG — OG image renderer
// Uses workers-og (Satori + resvg-wasm, CF Workers compatible)

import { ImageResponse } from 'workers-og';
import { buildElement } from './templates';
import type { OGParams } from '../types';

const OG_WIDTH ***REMOVED*** 1200;
const OG_HEIGHT ***REMOVED*** 630;

export async function generateOGImage(
  params: OGParams,
  watermark: boolean
): Promise<Response> {
  const element ***REMOVED*** buildElement(params, watermark);

  const response ***REMOVED*** new ImageResponse(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
  });

  return response;
}

// Build a deterministic cache key from OG params
export async function buildCacheKey(params: OGParams, watermark: boolean): Promise<string> {
  const sorted ***REMOVED*** JSON.stringify(
    Object.fromEntries(
      Object.entries({ ...params, watermark }).sort(([a], [b]) ***REMOVED***> a.localeCompare(b))
    )
  );
  const encoder ***REMOVED*** new TextEncoder();
  const data ***REMOVED*** encoder.encode(sorted);
  const hashBuffer ***REMOVED*** await crypto.subtle.digest('SHA-256', data);
  const hashArray ***REMOVED*** Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b ***REMOVED***> b.toString(16).padStart(2, '0')).join('');
}
