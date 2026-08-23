/**
 * EchoSign — Sign Detection Controller
 * Handles communication with FastAPI inference service
 * and processes hand landmarks for sign recognition
 */

const axios = require('axios');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const INFERENCE_URL = process.env.INFERENCE_SERVICE_URL || 'http://localhost:8000';

// Cache ISL vocabulary (from server.js)
const ISL_VOCABULARY = [
  { gloss: "HELLO", emoji: "👋", category: "Greetings", speech: "Hello" },
  { gloss: "NAMASTE", emoji: "🙏", category: "Greetings", speech: "Namaste" },
  { gloss: "WELCOME", emoji: "🤝", category: "Greetings", speech: "Welcome" },
  { gloss: "THANK YOU", emoji: "🙏", category: "Courtesies", speech: "Thank you" },
  { gloss: "PLEASE", emoji: "🤲", category: "Courtesies", speech: "Please" },
  { gloss: "SORRY", emoji: "🙇", category: "Courtesies", speech: "I am sorry" },
  { gloss: "HELP", emoji: "🆘", category: "Emergency", speech: "I need help" },
  { gloss: "DOCTOR", emoji: "🏥", category: "Emergency", speech: "I need a doctor" },
  { gloss: "YES", emoji: "👍", category: "Responses", speech: "Yes" },
  { gloss: "NO", emoji: "👎", category: "Responses", speech: "No" },
  { gloss: "GOOD", emoji: "✨", category: "Responses", speech: "Good" },
  { gloss: "BAD", emoji: "⚠️", category: "Responses", speech: "Bad" },
  { gloss: "WATER", emoji: "💧", category: "Essentials", speech: "I need water" },
  { gloss: "FOOD", emoji: "🍲", category: "Essentials", speech: "Food" },
  { gloss: "HUNGRY", emoji: "🍽️", category: "Essentials", speech: "I am hungry" },
  { gloss: "THIRSTY", emoji: "🥤", category: "Essentials", speech: "I am thirsty" },
  { gloss: "HOME", emoji: "🏠", category: "Places", speech: "Home" },
  { gloss: "SCHOOL", emoji: "🏫", category: "Places", speech: "School" },
  { gloss: "FRIEND", emoji: "👥", category: "People", speech: "Friend" },
  { gloss: "FAMILY", emoji: "👨‍👩‍👧‍👦", category: "People", speech: "Family" },
  { gloss: "MOTHER", emoji: "👩", category: "People", speech: "Mother" },
  { gloss: "FATHER", emoji: "👨", category: "People", speech: "Father" },
  { gloss: "TIME", emoji: "⏰", category: "Daily", speech: "Time" },
  { gloss: "TODAY", emoji: "📅", category: "Daily", speech: "Today" },
  { gloss: "TOMORROW", emoji: "🌅", category: "Daily", speech: "Tomorrow" },
  { gloss: "STOP", emoji: "🛑", category: "Actions", speech: "Stop" },
  { gloss: "GO", emoji: "🚶", category: "Actions", speech: "Go" },
  { gloss: "NEED", emoji: "✋", category: "Actions", speech: "Need" },
  { gloss: "WANT", emoji: "🤲", category: "Actions", speech: "Want" },
  { gloss: "UNDERSTAND", emoji: "💡", category: "Conversation", speech: "I understand" },
  { gloss: "LEARN", emoji: "📖", category: "Conversation", speech: "Learn" },
  { gloss: "SIGN", emoji: "🤟", category: "Conversation", speech: "Sign" },
  { gloss: "LOVE", emoji: "❤️", category: "Feelings", speech: "Love" },
  { gloss: "HAPPY", emoji: "😊", category: "Feelings", speech: "Happy" },
  { gloss: "SAFE", emoji: "🛡️", category: "Feelings", speech: "Safe" },
  { gloss: "PEACE", emoji: "✌️", category: "Feelings", speech: "Peace" },
  { gloss: "QUESTION", emoji: "❓", category: "Questions", speech: "I have a question" },
  { gloss: "WHERE", emoji: "🗺️", category: "Questions", speech: "Where" },
  { gloss: "WHAT", emoji: "🔍", category: "Questions", speech: "What" },
  { gloss: "BYE", emoji: "👋", category: "Greetings", speech: "Goodbye" }
];

/**
 * Create a lookup map for quick gloss→metadata retrieval
 */
const glossMap = {};
ISL_VOCABULARY.forEach(item => {
  glossMap[item.gloss.toUpperCase()] = item;
});

/**
 * POST /api/sign-detect/landmarks
 * Accept hand landmarks and run inference
 */
exports.detectFromLandmarks = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      hand_landmarks,
      pose_landmarks,
      face_landmarks,
      raw_vector,
      confidence_threshold = 0.7
    } = req.body;

    // Call FastAPI inference service
    const inferenceResponse = await axios.post(
      `${INFERENCE_URL}/predict/landmarks`,
      {
        hand_landmarks: hand_landmarks || [],
        pose_landmarks: pose_landmarks || [],
        face_landmarks: face_landmarks || [],
        raw_vector: raw_vector || []
      },
      { timeout: 5000 }
    );

    if (!inferenceResponse.data) {
      return res.status(500).json({
        success: false,
        message: 'No response from inference service'
      });
    }

    const {
      gloss,
      confidence_score,
      timestamp,
      all_gloss_candidates
    } = inferenceResponse.data;

    // Filter by confidence threshold
    if (confidence_score < confidence_threshold) {
      return res.status(200).json({
        success: true,
        gloss: 'NO_SIGN_DETECTED',
        confidence: confidence_score,
        message: `Confidence ${confidence_score.toFixed(2)} below threshold ${confidence_threshold}`,
        candidates: all_gloss_candidates.filter(c => c.confidence >= confidence_threshold)
      });
    }

    // Enrich with vocabulary metadata
    const glossMetadata = glossMap[gloss.toUpperCase()] || {
      gloss,
      emoji: '✋',
      category: 'Unknown',
      speech: gloss
    };

    res.json({
      success: true,
      gloss,
      confidence: confidence_score,
      emoji: glossMetadata.emoji,
      speech: glossMetadata.speech,
      category: glossMetadata.category,
      timestamp,
      all_candidates: all_gloss_candidates.slice(0, 5) // Top 5 candidates
    });
  } catch (err) {
    logger.error(`Sign detection error: ${err.message}`, 'SignDetectionController');

    if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
      return res.status(503).json({
        success: false,
        message: 'Inference service unavailable. Is FastAPI running on port 8000?',
        error: 'INFERENCE_SERVICE_OFFLINE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Sign detection failed',
      error: err.message
    });
  }
};

/**
 * POST /api/sign-detect/batch
 * Process multiple frames for better temporal stability
 */
exports.detectFromBatch = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { frames, window_size = 5 } = req.body;

    // Process each frame through inference
    const results = [];
    for (const frame of frames) {
      try {
        const inferenceResponse = await axios.post(
          `${INFERENCE_URL}/predict/landmarks`,
          frame,
          { timeout: 5000 }
        );
        results.push(inferenceResponse.data);
      } catch (err) {
        logger.warn(`Frame inference failed: ${err.message}`, 'SignDetectionController');
        results.push({ gloss: 'NO_SIGN_DETECTED', confidence_score: 0 });
      }
    }

    // Compute temporal consensus (most common gloss in last N frames)
    const glossCounts = {};
    let highestConfidence = 0;
    let consensusGloss = 'NO_SIGN_DETECTED';

    for (let i = Math.max(0, results.length - window_size); i < results.length; i++) {
      const gloss = results[i].gloss;
      const confidence = results[i].confidence_score;

      if (!glossCounts[gloss]) glossCounts[gloss] = 0;
      glossCounts[gloss]++;

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        consensusGloss = gloss;
      }
    }

    // Find the most common gloss
    let mostCommonGloss = consensusGloss;
    let maxCount = 0;
    for (const [gloss, count] of Object.entries(glossCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonGloss = gloss;
      }
    }

    const glossMetadata = glossMap[mostCommonGloss.toUpperCase()] || {
      gloss: mostCommonGloss,
      emoji: '✋',
      category: 'Unknown',
      speech: mostCommonGloss
    };

    res.json({
      success: true,
      gloss: mostCommonGloss,
      confidence: highestConfidence,
      emoji: glossMetadata.emoji,
      speech: glossMetadata.speech,
      category: glossMetadata.category,
      frames_processed: results.length,
      consensus_score: (maxCount / window_size).toFixed(2)
    });
  } catch (err) {
    logger.error(`Batch detection error: ${err.message}`, 'SignDetectionController');
    res.status(500).json({
      success: false,
      message: 'Batch detection failed',
      error: err.message
    });
  }
};

/**
 * POST /api/sign-detect/to-text
 * Convert gloss to English text
 */
exports.glossToText = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { gloss } = req.body;
    const glossWords = gloss.split(/\s+/).map(w => w.toUpperCase());

    // Simple mapping (can be extended with Gemini API for complex sentences)
    const englishWords = glossWords.map(word => {
      const metadata = glossMap[word];
      return metadata ? metadata.speech : word.toLowerCase();
    });

    res.json({
      success: true,
      gloss: gloss.toUpperCase(),
      text: englishWords.join(' '),
      words_translated: glossWords.length
    });
  } catch (err) {
    logger.error(`Gloss to text error: ${err.message}`, 'SignDetectionController');
    res.status(500).json({
      success: false,
      message: 'Gloss translation failed',
      error: err.message
    });
  }
};

/**
 * POST /api/sign-detect/to-speech
 * Convert gloss to audio
 * (For now, returns a placeholder; integrate with TTS service later)
 */
exports.glossToSpeech = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { gloss, audio_format = 'mp3' } = req.body;
    const glossWords = gloss.split(/\s+/).map(w => w.toUpperCase());

    // Convert to English text first
    const englishWords = glossWords.map(word => {
      const metadata = glossMap[word];
      return metadata ? metadata.speech : word.toLowerCase();
    });
    const englishText = englishWords.join(' ');

    // TODO: Integrate with Google Cloud TTS or similar service
    // For now, return a placeholder response
    res.json({
      success: true,
      gloss: gloss.toUpperCase(),
      text: englishText,
      audio_url: `/api/sign-detect/audio/${Buffer.from(englishText).toString('base64')}.${audio_format}`,
      message: 'Audio generation not yet implemented. Use browser Web Speech API for now.',
      mime_type: `audio/${audio_format}`
    });
  } catch (err) {
    logger.error(`Gloss to speech error: ${err.message}`, 'SignDetectionController');
    res.status(500).json({
      success: false,
      message: 'Audio generation failed',
      error: err.message
    });
  }
};

/**
 * GET /api/sign-detect/vocabulary
 * Return all supported glosses
 */
exports.getVocabulary = async (req, res) => {
  try {
    res.json({
      success: true,
      glosses: ISL_VOCABULARY,
      total: ISL_VOCABULARY.length,
      categories: [...new Set(ISL_VOCABULARY.map(v => v.category))]
    });
  } catch (err) {
    logger.error(`Vocabulary fetch error: ${err.message}`, 'SignDetectionController');
    res.status(500).json({
      success: false,
      message: 'Vocabulary fetch failed',
      error: err.message
    });
  }
};

/**
 * GET /api/sign-detect/health
 * Check inference service health
 */
exports.checkInferenceHealth = async (req, res) => {
  try {
    const healthResponse = await axios.get(
      `${INFERENCE_URL}/health`,
      { timeout: 3000 }
    );

    res.json({
      success: true,
      status: 'healthy',
      inference_url: INFERENCE_URL,
      inference_service: healthResponse.data.service,
      supported_glosses: healthResponse.data.supported_glosses_count
    });
  } catch (err) {
    logger.warn(`Inference health check failed: ${err.message}`, 'SignDetectionController');
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      inference_url: INFERENCE_URL,
      message: 'Inference service unavailable',
      error: err.message
    });
  }
};
