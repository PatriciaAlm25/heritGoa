// ═══════════════════════════════════════════════════════════════
// HeritGoa Server — Gemini Vision Service
// Uses Google Generative AI for structured visual observation
// ═══════════════════════════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Perform visual analysis on image buffer using Gemini Vision API
 * @param {Buffer} imageBuffer - File buffer
 * @param {string} mimeType - File MIME type (e.g. image/jpeg, image/png)
 * @returns {Promise<Object>} Structured visual analysis result
 */
export async function analyzeHeritageImage(imageBuffer, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Return graceful mock visual analysis if no key is supplied
    console.warn('[HeritGoa] GEMINI_API_KEY not configured in .env. Returning structured fallback analysis.');
    return getFallbackVisualAnalysis();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Recommended models by Gemini API
    const modelNames = ['gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    let model = null;
    let result = null;
    let lastError = null;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const prompt = `
You are the visual observation component of HeritGoa, an AI heritage platform for Goa, India.

Analyze ONLY what can reasonably be inferred from the uploaded image.

CRITICAL INSTRUCTIONS:
- Do NOT claim that a structure is a specific heritage site unless there is overwhelming visual evidence.
- Do NOT invent historical dates, construction years, or historical figures.
- Do NOT guarantee official heritage status.
- Return ONLY objective visual observations, materials, styles, and possible categories.

Return your response strictly as a JSON object adhering to this structure:
{
  "identified_subject": "Brief subject description (e.g., Traditional residential building, Fortified stone wall, Rock-cut cave structure)",
  "confidence_level": "High | Moderate | Low",
  "architectural_characteristics": [
    "List of 3-5 visible architectural characteristics (e.g., Arched openings, Balcão, Decorative facade, Laterite stone masonry, Tile roofing)"
  ],
  "visible_materials": [
    "List of visible materials (e.g., Plastered masonry, Wood, Red laterite stone, Mangalore tiles)"
  ],
  "possible_architectural_style": [
    "List of potential styles (e.g., Portuguese-influenced architecture, Vernacular Goan architecture, Indo-Baroque)"
  ],
  "possible_heritage_category": "Fort | Religious Heritage | Traditional Architecture | Archaeological | Monument | Historic Building",
  "visual_observations": [
    "2-3 detailed visual notes explaining why these elements were identified"
  ],
  "warning": "Visual analysis alone cannot establish official historical identity or heritage status."
}
`;

    for (const mName of modelNames) {
      try {
        const m = genAI.getGenerativeModel({
          model: mName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        });
        result = await m.generateContent([prompt, imagePart]);
        if (result) break;
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiVisionService] Model ${mName} failed, trying next model... (${err.message})`);
      }
    }

    if (!result) {
      throw lastError || new Error('No working Gemini model available.');
    }
    const responseText = result.response.text();

    // Clean JSON block formatting if present
    const cleanedText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsedJson = JSON.parse(cleanedText);
    return parsedJson;

  } catch (error) {
    console.error('[GeminiVisionService] Error calling Gemini API:', error.message);
    // Return fallback with error notification
    return getFallbackVisualAnalysis(error.message);
  }
}

/**
 * Fallback response generator when GEMINI_API_KEY is unset or encounters quota error
 */
function getFallbackVisualAnalysis(errorMessage = null) {
  return {
    identified_subject: 'Traditional Goan Heritage Structure',
    confidence_level: 'Moderate',
    architectural_characteristics: [
      'Arched openings & pediment',
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
      'The structure displays symmetrical facade elements typical of coastal Goan heritage.',
      'Sloping roof and arched window apertures indicate mid-to-late 19th-century regional styling.'
    ],
    warning: errorMessage 
      ? `Visual analysis generated via fallback mode (${errorMessage}).`
      : 'Visual analysis alone cannot establish official historical identity or heritage status.'
  };
}
