import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createBlurUp } from './blurup.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// Minimal PNG header (signature + IHDR) so image-dimensions can read the size.
function pngHeader(width, height) {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52], 8);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function mockFetch(tinyImageBytes) {
  globalThis.fetch = async (url) => {
    const isTinyImage = new URL(url).searchParams.has('width');
    const body = isTinyImage ? tinyImageBytes : pngHeader(1920, 1080);
    return new Response(body, { headers: { 'content-type': 'image/png' } });
  };
}

test('encodes large thumbnails without overflowing the call stack', async () => {
  // Well past the engine's argument limit, which broke
  // String.fromCharCode(...bytes) with "Maximum call stack size exceeded".
  const bytes = new Uint8Array(1024 * 1024);
  for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256;
  mockFetch(bytes);

  const result = await createBlurUp('abc123', { type: 'png' });

  const expected = `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`;
  assert.equal(result.imageDataURL, expected);
  assert.equal(result.width, 1920);
  assert.equal(result.height, 1080);
});

test('encodes thumbnails that are not a multiple of the chunk size', async () => {
  const bytes = new Uint8Array(0x8000 + 1);
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 7) % 256;
  mockFetch(bytes);

  const result = await createBlurUp('abc123', { type: 'png' });

  assert.equal(
    result.imageDataURL,
    `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`
  );
});
