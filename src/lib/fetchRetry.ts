/**
 * Installs a global fetch wrapper that automatically retries transient
 * network failures (e.g. "Failed to fetch" while Lovable Cloud is waking up)
 * for requests targeting our Supabase project.
 *
 * - Retries up to MAX_RETRIES times with exponential backoff.
 * - Only retries on network errors (TypeError) or 5xx / 408 / 429 responses.
 * - Leaves non-Supabase requests untouched.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isSupabaseRequest = (input: RequestInfo | URL): boolean => {
  if (!SUPABASE_URL) return false;
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;
  return url.startsWith(SUPABASE_URL);
};

const shouldRetryResponse = (res: Response) =>
  res.status >= 500 || res.status === 408 || res.status === 429;

export const installFetchRetry = () => {
  if (typeof window === "undefined") return;
  if ((window as any).__fetchRetryInstalled) return;
  (window as any).__fetchRetryInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    if (!isSupabaseRequest(input)) {
      return originalFetch(input, init);
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await originalFetch(input, init);
        if (shouldRetryResponse(res) && attempt < MAX_RETRIES) {
          await sleep(BASE_DELAY_MS * 2 ** attempt);
          continue;
        }
        return res;
      } catch (err) {
        lastError = err;
        if (attempt >= MAX_RETRIES) break;
        await sleep(BASE_DELAY_MS * 2 ** attempt);
      }
    }
    throw lastError;
  };
};
