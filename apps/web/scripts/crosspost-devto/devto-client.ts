import type { DevtoArticle, DevtoPayload } from './types';

const BASE = 'https://dev.to/api';

function headers(apiKey: string): Record<string, string> {
  return {
    'api-key': apiKey,
    'content-type': 'application/json',
    accept: 'application/vnd.forem.api-v1+json',
  };
}

export async function listMyArticles(apiKey: string): Promise<DevtoArticle[]> {
  const res = await fetch(`${BASE}/articles/me/all?per_page=1000`, {
    headers: headers(apiKey),
  });
  if (!res.ok) {
    throw new Error(`dev.to GET /articles/me/all failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as DevtoArticle[];
}

export async function createArticle(apiKey: string, payload: DevtoPayload): Promise<DevtoArticle> {
  const res = await fetch(`${BASE}/articles`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({ article: payload }),
  });
  if (!res.ok) {
    throw new Error(`dev.to POST /articles failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as DevtoArticle;
}

export async function updateArticle(
  apiKey: string,
  id: number,
  payload: DevtoPayload,
): Promise<DevtoArticle> {
  const res = await fetch(`${BASE}/articles/${id}`, {
    method: 'PUT',
    headers: headers(apiKey),
    body: JSON.stringify({ article: payload }),
  });
  if (!res.ok) {
    throw new Error(`dev.to PUT /articles/${id} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as DevtoArticle;
}
