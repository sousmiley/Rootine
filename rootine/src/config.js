/**
 * Client-side config.
 * This is a static export (Cloudflare Pages) — there is no server, so the
 * Perenual API key lives here in the browser bundle. This is intentional
 * and accepted by the project owner.
 */
const config = {
  PERENUAL_API_KEY: 'sk-krnF6ad044ee72b0312578',

  // Deterministic Plant of the Day ID — changes daily, stays in free tier (1–3000)
  PLANT_OF_DAY_ID: (() => {
    const today = new Date();
    const seed  =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    const shuffled = ((seed * 1664525 + 1013904223) >>> 0) % 3000;
    return shuffled + 1;
  })(),
};

export default config;
