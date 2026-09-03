/**
 * GET /api/plant-search?q=<query>&page=<n>
 * Proxies to Perenual species-list endpoint.
 */

const PERENUAL_API_KEY = 'sk-PeSx68e09d73a8b5412578';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q = '', page = '1' } = req.query;

  try {
    const url = new URL('https://perenual.com/api/v2/species-list');
    url.searchParams.set('key', PERENUAL_API_KEY);
    if (q) url.searchParams.set('q', q);
    url.searchParams.set('page', page);

    const upstream = await fetch(url.toString());
    const data = await upstream.json();

    if (data.message?.toLowerCase().includes('upgrade')) {
      return res.status(402).json({ error: 'Perenual free tier limit reached', data: [] });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[plant-search]', err);
    return res.status(502).json({ error: 'Failed to reach Perenual API' });
  }
}
