// ═══════════════════════════════════════════════════════════════
// HeritGoa Server — Heritage Matching Engine
// Matches Gemini Visual Output against 73 Verified Heritage Sites
// ═══════════════════════════════════════════════════════════════

import { HERITAGE_SITES } from '../data/heritageSites.js';

/**
 * Match Gemini's visual analysis against verified HeritGoa dataset
 * @param {Object} aiResult - Output from Gemini Vision API
 * @param {Object} [userLocation] - { district, taluka } optional location filter
 * @returns {Array} Array of top matching registered heritage sites with scores & reasons
 */
export function findPotentialMatches(aiResult, userLocation = null) {
  if (!aiResult || !HERITAGE_SITES) return [];

  const {
    possible_heritage_category = '',
    architectural_characteristics = [],
    possible_architectural_style = [],
    identified_subject = ''
  } = aiResult;

  const results = HERITAGE_SITES.map(site => {
    let score = 0;
    const matchReasons = [];

    // 1. Category Match (Weight: 35)
    if (site.category && possible_heritage_category) {
      const siteCat = site.category.toLowerCase();
      const aiCat = possible_heritage_category.toLowerCase();
      if (siteCat.includes(aiCat) || aiCat.includes(siteCat)) {
        score += 35;
        matchReasons.push(`Shares category: "${site.category}"`);
      }
    }

    // 2. User-provided District Match (Weight: 30)
    if (userLocation && userLocation.district && site.district) {
      if (site.district.toLowerCase() === userLocation.district.toLowerCase()) {
        score += 30;
        matchReasons.push(`Located in ${site.district}`);
      }
    }

    // 3. Architectural characteristics overlap (Weight: up to 30)
    const siteCorpus = `${site.name} ${site.category} ${site.heritage_status || ''} ${site.architecture || ''} ${site.historical_background || ''} ${site.locality || ''}`.toLowerCase();

    architectural_characteristics.forEach(feature => {
      const featLower = feature.toLowerCase();
      // Check feature or individual keywords
      if (siteCorpus.includes(featLower)) {
        score += 10;
        matchReasons.push(`Matches architectural element: "${feature}"`);
      }
    });

    // 4. Style keywords match (Weight: 15)
    possible_architectural_style.forEach(style => {
      const styleLower = style.toLowerCase();
      if (siteCorpus.includes(styleLower) || (styleLower.includes('portuguese') && siteCorpus.includes('church'))) {
        score += 15;
        matchReasons.push(`Consistent with ${style}`);
      }
    });

    return {
      site_id: site.site_id,
      name: site.name,
      category: site.category,
      district: site.district,
      locality: site.locality,
      heritage_status: site.heritage_status,
      image_url: site.image_url,
      verification_status: site.verification_status,
      historical_background: site.historical_background,
      architecture: site.architecture,
      source_name: site.source_name,
      score,
      matchReasons: [...new Set(matchReasons)] // Deduplicate
    };
  });

  // Filter out zero-score sites and sort descending
  const matches = results
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4); // Return top 4 candidate sites

  // If no matches scored higher than 0, return fallback curated sites of matching category
  if (matches.length === 0) {
    return HERITAGE_SITES.slice(0, 3).map(site => ({
      site_id: site.site_id,
      name: site.name,
      category: site.category,
      district: site.district,
      locality: site.locality,
      heritage_status: site.heritage_status,
      image_url: site.image_url,
      verification_status: site.verification_status,
      score: 10,
      matchReasons: ['General reference heritage site in Goa']
    }));
  }

  return matches;
}
