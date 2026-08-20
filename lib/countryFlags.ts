// lib/countryFlags.ts -- country name -> ISO 3166-1 alpha-2 code, for the
// admin Series & Movies table's Country column (S1-03). Reuses the same
// flagcdn.com convention CategoryNav.tsx already established for the
// homepage's country pills, rather than introducing a second flag
// rendering approach (emoji, a different CDN, etc). BLumi's `country`
// column is free text (see SeriesEditModal's COUNTRY_OPTIONS), not an ISO
// code itself, so this maps the handful of values that field actually
// takes. Countries outside that list render without a flag rather than a
// broken image.
const COUNTRY_CODES: Record<string, string> = {
  Thailand: 'th',
  Korea: 'kr',
  'South Korea': 'kr',
  Japan: 'jp',
  Taiwan: 'tw',
  China: 'cn',
  'Hong Kong': 'hk',
  Philippines: 'ph',
  Vietnam: 'vn',
  Indonesia: 'id',
  Singapore: 'sg',
  'United States': 'us',
  UK: 'gb',
  'United Kingdom': 'gb',
};

export function countryFlagCode(country: string | null | undefined): string | null {
  if (!country) return null;
  return COUNTRY_CODES[country] || null;
}

export function countryFlagUrl(country: string | null | undefined): string | null {
  const code = countryFlagCode(country);
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
}
