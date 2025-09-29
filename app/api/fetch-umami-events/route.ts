import { getClient } from '@umami/api-client';

export const dynamic = 'force-dynamic'; // defaults to auto

// Configure the Umami client for Umami Cloud
const client = getClient({
  apiEndpoint: 'https://api.umami.is/v1',
  apiKey: process.env.UMAMI_API_KEY || 'api_eY8sCTrhA5yV9VEBy5wtaKudw2MozCYJ',
});

export async function GET(request: Request) {
  try {
    // The website ID for "bento"
    const websiteId = '8edbf6a7-808f-4db7-8d92-5b9e7f7b2911';

    // Get the current time and one year ago in milliseconds
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000); // 1 year ago

    // Prepare the data object for getWebsitePageviews
    const pageviewsData = {
      startAt: oneYearAgo,
      endAt: now,
      unit: 'day', // Daily data over the year
      // The Umami client requires timezone and region for this call's type.
      timezone: 'UTC',
      region: 'global',
    };

    console.log('Fetching pageviews for website:', websiteId);
    console.log('Time range:', { startAt: new Date(oneYearAgo), endAt: new Date(now) });

    const response = await client.getWebsitePageviews(websiteId, pageviewsData);
    const { ok, data, status, error } = response;

    if (!ok) {
      console.error('Umami API error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch website pageviews', details: error }), { status: status });
    }

    console.log('Pageviews data fetched successfully');
    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    // Narrow unknown error to extract a message safely
    console.error('Error fetching website pageviews:', error);
    const details = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch website pageviews', details }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}