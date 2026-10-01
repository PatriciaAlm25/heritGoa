// ═══════════════════════════════════════════════════════════════
// HeritGoa Server — Heritage Analysis Controller
// Handles POST /api/heritage/analyze
// ═══════════════════════════════════════════════════════════════

import { analyzeHeritageImage } from '../services/geminiVisionService.js';
import { findPotentialMatches } from '../services/heritageMatcher.js';

export async function handleHeritageAnalysis(req, res) {
  try {
    let imageBuffer = null;
    let mimeType = 'image/jpeg';

    // 1. Handle Multipart Upload (Multer) or Base64 Payload
    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body && req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      mimeType = req.body.mimeType || 'image/jpeg';
    } else {
      return res.status(400).json({
        success: false,
        error: 'No image provided. Please upload a valid JPG, PNG, or WEBP photograph.'
      });
    }

    // 2. Validate File Size (<10MB)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    if (imageBuffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        error: 'Image file size exceeds maximum limit of 10 MB.'
      });
    }

    // 3. Extract Optional User Location Filter
    const district = req.body.district || req.query.district || null;
    const taluka = req.body.taluka || req.query.taluka || null;
    const userLocation = (district || taluka) ? { district, taluka } : null;

    console.log(`[AnalyzeController] Processing image analysis... (${(imageBuffer.length / 1024).toFixed(1)} KB, MIME: ${mimeType}, Location: ${district || 'Unspecified'})`);

    // 4. Run Gemini Visual Analysis
    const aiAnalysis = await analyzeHeritageImage(imageBuffer, mimeType);

    // 5. Match Visual Output against Verified HeritGoa Dataset
    const potentialMatches = findPotentialMatches(aiAnalysis, userLocation);

    // 6. Return Composite Response
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis: aiAnalysis,
      potentialMatches,
      meta: {
        datasetSize: 73,
        userLocationProvided: !!userLocation,
        engineVersion: 'Gemini 1.5 Vision + HeritGoa Matcher v1.0'
      }
    });

  } catch (error) {
    console.error('[AnalyzeController] Exception during analysis:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while analyzing the image.',
      details: error.message
    });
  }
}
