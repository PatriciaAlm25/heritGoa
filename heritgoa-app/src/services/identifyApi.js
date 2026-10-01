// ═══════════════════════════════════════════════════════════════
// HeritGoa Client API — Identify & Visual Analysis Service
// Calls Express backend (/api/heritage/analyze) with local fallback
// ═══════════════════════════════════════════════════════════════

import { HERITAGE_SITES } from '../data/heritageSites';

const API_BASE_URL = 'http://localhost:5000/api/heritage';

/**
 * Submit image file or base64 to backend analyze endpoint
 * @param {File|string} imageFile - File object or base64 string
 * @param {Object} locationFilter - { district, taluka }
 * @returns {Promise<Object>} Analysis result + matching heritage sites
 */
export async function analyzeHeritagePhoto(imageFile, locationFilter = null) {
  const formData = new FormData();

  if (imageFile instanceof File) {
    formData.append('image', imageFile);
  } else if (typeof imageFile === 'string') {
    formData.append('imageBase64', imageFile);
  }

  if (locationFilter && locationFilter.district) {
    formData.append('district', locationFilter.district);
  }
  if (locationFilter && locationFilter.taluka) {
    formData.append('taluka', locationFilter.taluka);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (err) {
    console.warn('[IdentifyAPI] Express server unavailable, running local client fallback:', err.message);
    // Client-side fallback matching engine
    return runClientFallbackAnalysis(locationFilter);
  }
}

/**
 * Client-side fallback when server is offline
 */
function runClientFallbackAnalysis(locationFilter) {
  const simulatedAnalysis = {
    identified_subject: 'Traditional Goan Heritage Architecture',
    confidence_level: 'Moderate',
    architectural_characteristics: [
      'Arched openings & pediments',
      'Decorative facade ornamentation',
      'Plastered masonry construction',
      'Traditional sloping tiled roof'
    ],
    visible_materials: [
      'Plastered laterite masonry',
      'Timber rafters & framework',
      'Clay roofing tiles'
    ],
    possible_architectural_style: [
      'Portuguese-influenced Goan architecture',
      'Colonial Vernacular Style'
    ],
    possible_heritage_category: 'Traditional Architecture',
    visual_observations: [
      'Visual characteristics show classic symmetry and decorative mouldings.',
      'Materials and window forms align with 19th-century regional Goan heritage structures.'
    ],
    warning: 'Visual analysis alone cannot establish official historical identity or heritage status.'
  };

  // Filter matching dataset
  const matches = HERITAGE_SITES
    .filter(site => {
      if (locationFilter && locationFilter.district) {
        return site.district && site.district.toLowerCase() === locationFilter.district.toLowerCase();
      }
      return true;
    })
    .slice(0, 4)
    .map(site => ({
      site_id: site.site_id,
      name: site.name,
      category: site.category,
      district: site.district,
      locality: site.locality,
      heritage_status: site.heritage_status,
      image_url: site.image_url,
      verification_status: site.verification_status,
      score: 35,
      matchReasons: [
        `Shares category: "${site.category}"`,
        locationFilter?.district ? `Located in ${locationFilter.district}` : 'Goan Heritage Site record'
      ]
    }));

  return {
    success: true,
    timestamp: new Date().toISOString(),
    analysis: simulatedAnalysis,
    potentialMatches: matches,
    meta: {
      isFallback: true,
      message: 'Client-side fallback mode active.'
    }
  };
}
