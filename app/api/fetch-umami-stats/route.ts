import { getClient } from '@umami/api-client';

export const dynamic = 'force-dynamic'; // defaults to auto

// Configure the Umami client for Umami Cloud
const client = getClient({
  apiEndpoint: 'https://api.umami.is/v1',
  apiKey: process.env.UMAMI_API_KEY || 'api_eY8sCTrhA5yV9VEBy5wtaKudw2MozCYJ',
});

export async function GET(request: Request) {
  try {
    // If the client requested randomized demo data, return it without calling Umami.
    try {
      const url = new URL(request.url);
      const random = url.searchParams.get('random');
      if (random === 'true') {
        const randInt = (min = 0, max = 1000) => Math.floor(Math.random() * (max - min + 1)) + min;
        const randFloat = (min = 0, max = 10) => Math.random() * (max - min) + min;

        const demo = {
          pageviews: { value: randInt(100, 200), prev: randInt(100, 200) },
          visitors: { value: randInt(50, 150), prev: randInt(50, 150) },
          visits: { value: randInt(50, 150), prev: randInt(50, 150) },
          bounces: { value: randInt(1, 80), prev: randInt(1, 80) },
          totaltime: { value: Number(randFloat(0.5, 8).toFixed(2)), prev: Number(randFloat(0.5, 8).toFixed(2)) },
        };

        return new Response(JSON.stringify(demo), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // ignore URL parsing issues and continue to real fetch
    }
    // The website ID for "bento"
    const websiteId = '8edbf6a7-808f-4db7-8d92-5b9e7f7b2911';

    // Get the current time and 7 days ago in milliseconds
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Prepare the data object for getWebsiteStats
    const statsData = {
      startAt: sevenDaysAgo,
      endAt: now,
    };

    console.log('Fetching stats for website:', websiteId);
    console.log('Time range:', { startAt: new Date(sevenDaysAgo), endAt: new Date(now) });

    const { ok, data, status, error } = await client.getWebsiteStats(websiteId, statsData);

    if (!ok) {
      console.error('Umami API error:', error);
      const details = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ error: 'Failed to fetch website metrics', details }), { status: status });
    }

    console.log('Stats data fetched successfully');
    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error fetching website metrics:', error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch website metrics', details: errorMessage }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}