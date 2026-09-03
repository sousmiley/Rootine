/**
 * Client-safe config.
 *
 * The Perenual API key is now server-side only (PERENUAL_API_KEY in .env.local).
 * All plant data is fetched through /api/plant-search and /api/plant-details proxy routes.
 */
const config = {
  // Deterministic Plant of the Day ID — changes daily, stays in the free tier (IDs 1–3000)
  PLANT_OF_DAY_ID: (() => {
    const today = new Date();
    const seed  =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    // Cheap LCG shuffle to spread IDs across 1–3000
    const shuffled = ((seed * 1664525 + 1013904223) >>> 0) % 3000;
    return shuffled + 1;
  })(),
};

export default config;
