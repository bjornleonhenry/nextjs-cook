export const dynamic = 'force-dynamic'; // defaults to autoc
export async function GET(request: Request) {
  const url = `${process.env.NEXT_PUBLIC_PORTFOLIO_URL}/api/v1/fetchProjectsFeed.json`;
  const headers = { "Accept": "application/json" };
  const reqUrl = new URL(request.url);
    // debug mode removed in follow-up patch — always return normalized postsData
  try {
    let postsData: any[] = [];
    // Try multiple loopback addresses in case localhost resolves differently
  const candidates = [url, url.replace('localhost', '127.0.0.1'), url.replace('localhost', '[::1]')];
    let nextUrl = url;
    let resolvedHostUsed: string | null = null;
    for (const candidate of candidates) {
      try {
        const r = await fetch(candidate, { headers });
        const txt = await r.text();
        let p = null;
        try { p = txt ? JSON.parse(txt) : null; } catch (e) { p = null; }
        const length = Array.isArray(p) ? p.length : (Array.isArray(p?.postsData) ? p.postsData.length : 0);
        if (length > 0) {
          nextUrl = candidate;
          resolvedHostUsed = candidate;
          // seed postsData with this first page and continue with pagination below
          if (Array.isArray(p)) postsData = postsData.concat(p);
          else if (p && typeof p === 'object') postsData = postsData.concat(p.postsData ?? p.data ?? p.items ?? []);
          break;
        }
      } catch (e) {
      }
    }

    let pageCount = 0;

  while (nextUrl) {
      const response = await fetch(nextUrl, { headers });
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch projects feed' }), { status: response.status });
      }

      const contentType = response.headers.get('content-type') || '';
      let rawBody = '';
      try {
        rawBody = await response.text();
      } catch (e) {
        console.error('Failed to read response text from', nextUrl, e);
      }


      // Try to parse JSON defensively
      let parsed: any = null;
      if (rawBody) {
        try {
          parsed = JSON.parse(rawBody);
        } catch (e) {
          console.error('Failed to parse JSON from', nextUrl, e);
        }
      }

      // Normalize to an array: accept direct array, { postsData: [] }, { data: [] }, or { items: [] }
      let pagePosts: any[] = [];
      if (Array.isArray(parsed)) {
        pagePosts = parsed;
      } else if (parsed && typeof parsed === 'object') {
        pagePosts = parsed.postsData ?? parsed.data ?? parsed.items ?? [];
      }

      if (!Array.isArray(pagePosts)) {
        console.warn('Normalized pagePosts is not an array, skipping. parsed:', parsed);
      } else {
        postsData = postsData.concat(pagePosts);
      }

      // Check for pagination
      const linkHeader = response.headers.get('link');
      if (linkHeader) {
        const nextLink = linkHeader.split(',').find((s) => s.includes('rel="next"'));
        nextUrl = nextLink ? nextLink.split(';')[0].replace('<', '').replace('>', '').trim() : "";
      } else {
        nextUrl = "";
      }

      pageCount++;
    }

    return new Response(JSON.stringify({ postsData }), { status: 200 });
  } catch (error) {
    console.error('Error fetching projects feed:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch projects feed' }), { status: 500 });
  }
}
