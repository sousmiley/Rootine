/**
 * GET /api/plant-details?id=<id>
 * Proxies to Perenual species/details endpoint.
 */

const PERENUAL_API_KEY = 'sk-PeSx68e09d73a8b5412578';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing plant id' });
  }

  try {
    const url = `https://perenual.com/api/v2/species/details/${encodeURIComponent(id)}?key=${PERENUAL_API_KEY}`;
    const upstream = await fetch(url);
    const data = await upstream.json();

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
