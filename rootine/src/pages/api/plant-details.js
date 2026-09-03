/**
 * GET /api/plant-details?id=<id>
 *
 * Proxies to Perenual species/details. The API key never reaches the browser.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing plant id' });
  }

  const apiKey = process.env.PERENUAL_API_KEY;

  if (!apiKey || apiKey === 'your_perenual_api_key_here') {
    return res.status(503).json({
      error: 'API key not configured',
      hint: 'Add PERENUAL_API_KEY to your .env.local file. Get a free key at https://perenual.com/api/auth/register',
    });
  }

  try {
    const url = `https://perenual.com/api/v2/species/details/${encodeURIComponent(id)}?key=${apiKey}`;

    const upstream = await fetch(url);
    const data     = await upstream.json();

    if (data.message?.toLowerCase().includes('upgrade')) {
      return res.status(402).json({ error: 'Perenual free tier limit reached for this plant' });
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.message || 'Upstream error' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[plant-details]', err);
    return res.status(502).json({ error: 'Failed to reach Perenual API' });
  }
}
