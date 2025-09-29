export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
      msg: 'hello world',
      app: 'cook',
      version: '0.5.0',
      totalStars: 123,
      pageviews: 456,
      visitors: 789,
      visits: 1011,
      bounces: 1213,
      totaltime: 1415,
    }),
    {
      status: 200,
    }
  )
}