// ═══════════════════════════════════════════════════════════════
// HeritGoa — Heritage Service
// Single source of truth for all heritage data queries.
// Currently uses local dataset; Supabase integration ready.
// ═══════════════════════════════════════════════════════════════
import { supabase } from '../lib/supabase';
import { HERITAGE_SITES, getSourceCategory } from '../data/heritageSites';

// ── Config ────────────────────────────────────────────────────
// When USE_SUPABASE=true and credentials are set, fetches from DB.
// Falls back to local dataset automatically on failure.
const USE_SUPABASE = false; // flip to true once table is seeded

// ── Supabase table name ───────────────────────────────────────
const TABLE = 'heritage_sites';

// ─────────────────────────────────────────────────────────────
// getHeritageSites — fetch all sites
// ─────────────────────────────────────────────────────────────
export async function getHeritageSites() {
  if (USE_SUPABASE) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('name');
    if (error) {
      console.error('[heritageService] Supabase error, falling back to local:', error.message);
      return HERITAGE_SITES;
    }
    return data ?? HERITAGE_SITES;
  }
  return HERITAGE_SITES;
}

// ─────────────────────────────────────────────────────────────
// getHeritageSiteById — fetch one site by site_id
// ─────────────────────────────────────────────────────────────
export async function getHeritageSiteById(siteId) {
  if (USE_SUPABASE) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('site_id', siteId)
      .single();
    if (error) {
      console.error('[heritageService] Supabase error:', error.message);
      return HERITAGE_SITES.find(s => s.site_id === siteId) ?? null;
    }
    return data;
  }
  return HERITAGE_SITES.find(s => s.site_id === siteId) ?? null;
}

// ─────────────────────────────────────────────────────────────
// getHeritageSitesByCategory
// ─────────────────────────────────────────────────────────────
export async function getHeritageSitesByCategory(category) {
  const all = await getHeritageSites();
  if (!category || category === 'All') return all;
  return all.filter(s => s.category === category);
}

// ─────────────────────────────────────────────────────────────
// getHeritageSitesByDistrict
// ─────────────────────────────────────────────────────────────
export async function getHeritageSitesByDistrict(district) {
  const all = await getHeritageSites();
  if (!district || district === 'All Goa') return all;
  return all.filter(s => s.district === district);
}

// ─────────────────────────────────────────────────────────────
// searchHeritageSites — client-side text search
// Fields: name, locality, taluka, district, category
// ─────────────────────────────────────────────────────────────
export function searchHeritageSites(sites, query) {
  if (!query || query.trim() === '') return sites;
  const q = query.toLowerCase().trim();
  return sites.filter(s =>
    (s.name      ?? '').toLowerCase().includes(q) ||
    (s.locality  ?? '').toLowerCase().includes(q) ||
    (s.taluka    ?? '').toLowerCase().includes(q) ||
    (s.district  ?? '').toLowerCase().includes(q) ||
    (s.category  ?? '').toLowerCase().includes(q)
  );
}

// ─────────────────────────────────────────────────────────────
// filterHeritageSites — combine category + source + search
// ─────────────────────────────────────────────────────────────
export function filterHeritageSites(sites, { category, source, district, query }) {
  let result = [...sites];

  if (category && category !== 'All')
    result = result.filter(s => s.category === category);

  if (source && source !== 'All Sources')
    result = result.filter(s => getSourceCategory(s) === source);

  if (district && district !== 'All Goa')
    result = result.filter(s => s.district === district);

  if (query && query.trim() !== '')
    result = searchHeritageSites(result, query);

  return result;
}

// ─────────────────────────────────────────────────────────────
// "Discover Hidden Goa" — lesser-known sites
// Rule: State-listed sites NOT in major tourist localities
// This is a defensible, documented rule — not arbitrary labelling
// ─────────────────────────────────────────────────────────────
const MAJOR_TOURIST_LOCALITIES = ['Old Goa', 'Candolim', 'Calangute', 'Panaji', 'Vagator'];

export function getHiddenGoa(sites) {
  return sites
    .filter(s =>
      s.site_id.startsWith('STATE-') &&
      !MAJOR_TOURIST_LOCALITIES.includes(s.locality)
    )
    .slice(0, 6);
}

// ─────────────────────────────────────────────────────────────
// Re-export source category helper for UI use
// ─────────────────────────────────────────────────────────────
export { getSourceCategory };

// ─────────────────────────────────────────────────────────────
// Future extension stubs
// These are clean hooks for later AI/community features.
// Do NOT implement fake AI — just the interface.
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
export async function submitDamageReport(_report) {
  // TODO: POST to /api/reports (Node/Express backend) → Supabase damage_reports table
  throw new Error('Damage report backend not yet implemented');
}

// eslint-disable-next-line no-unused-vars
export async function getAIAnalysis(_siteId) {
  // TODO: Call Gemini Vision via secure backend Edge Function
  throw new Error('AI analysis not yet implemented');
}

// eslint-disable-next-line no-unused-vars
export async function getCommunityStories(_siteId) {
  // TODO: Query Supabase community_stories table
  return [];
}
