/**
 * GET /api/plant-search?q=<query>&page=<n>
 *
 * Proxies to Perenual species-list. The API key never reaches the browser.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q = '', page = '1' } = req.query;
  const apiKey = process.env.PERENUAL_API_KEY;

  if (!apiKey || apiKey === 'your_perenual_api_key_here') {
    return res.status(503).json({
      error: 'API key not configured',
      hint: 'Add PERENUAL_API_KEY to your .env.local file. Get a free key at https://perenual.com/api/auth/register',
    });
  }

  try {
    const url = new URL('https://perenual.com/api/v2/species-list');
    url.searchParams.set('key', apiKey);
    if (q) url.searchParams.set('q', q);
    url.searchParams.set('page', page);

    const upstream = await fetch(url.toString());
    const data     = await upstream.json();

    // Perenual returns a 200 with a message when hitting free-tier limits
    if (data.message?.toLowerCase().includes('upgrade')) {
      return res.status(402).json({ error: 'Perenual free tier limit reached', data: [] });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[plant-search]', err);
    return res.status(502).json({ error: 'Failed to reach Perenual API' });
  }
}
