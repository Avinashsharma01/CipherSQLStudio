const Assignment = require('../models/Assignment');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// generates a hint for the student using LLM
async function getHint(req, res) {
  const { assignmentId, userQuery } = req.body;

  if (!assignmentId) {
    return res.status(400).json({
      success: false,
      error: 'Assignment ID is required',
    });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const prompt = buildHintPrompt(assignment, userQuery);

    const provider = (process.env.LLM_PROVIDER || 'ollama').toLowerCase().trim();
    const hintText = await generateHint(prompt, provider);

    res.json({
      success: true,
      hint: hintText,
    });
  } catch (err) {
    console.error('Hint error:', err.message);
    if (err.code === 'GEMINI_API_KEY_MISSING') {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key missing. Set LLM_API_KEY (or GOOGLE_API_KEY) in .env.',
      });
    }
    if (err.code === 'GEMINI_QUOTA_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: 'Gemini quota exceeded. Try later or switch to ollama.',
      });
    }
    if (err.code === 'OLLAMA_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        error: 'Cant reach Ollama. Make sure its running on http://localhost:11434',
      });
    }
    if (err.code === 'OLLAMA_MODEL_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'Model not found in Ollama. Run: ollama pull mistral',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Could not generate hint right now',
    });
  }
}

async function generateHint(prompt, provider) {
  if (provider === 'gemini') {
    return generateHintWithGemini(prompt);
  }

  if (provider === 'ollama') {
    return generateHintWithOllama(prompt);
  }

  throw new Error('Unsupported LLM_PROVIDER. Use "gemini" or "ollama".');
}

async function generateHintWithGemini(prompt) {
  const apiKey = process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    const err = new Error('Gemini key not set');
    err.code = 'GEMINI_API_KEY_MISSING';
    throw err;
  }

  try {
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: geminiModel });
    const result = await model.generateContent(prompt);
    const hintText = result?.response?.text()?.trim();

    if (!hintText) {
      throw new Error('Empty response from Gemini');
    }
    return hintText;
  } catch (err) {
    if (err.status === 429 || /quota|too many requests|429/i.test(err.message)) {
      const quotaErr = new Error('Gemini quota exceeded');
      quotaErr.code = 'GEMINI_QUOTA_EXCEEDED';
      throw quotaErr;
    }
    throw err;
  }
}


// using ollama because my free gemini api key ran out of quota
async function generateHintWithOllama(prompt) {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'mistral';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error || `Ollama failed with status ${response.status}`;
      const error = new Error(errMsg);
      if (response.status === 404 && /model|not found/i.test(errMsg)) {
        error.code = 'OLLAMA_MODEL_NOT_FOUND';
      }
      throw error;
    }

    const hintText = data?.response?.trim();
    if (!hintText) {
      throw new Error('Ollama gave empty response');
    }

    return hintText;
  } catch (err) {
    if (err.name === 'AbortError' || /fetch failed|ECONNREFUSED/i.test(err.message)) {
      const connErr = new Error('Cant connect to Ollama');
      connErr.code = 'OLLAMA_UNAVAILABLE';
      throw connErr;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// build prompt - we want hints, NOT the actual answer
function buildHintPrompt(assignment, userQuery) {
  let prompt = `You are a SQL tutor helping a student.

Assignment: "${assignment.title}"
Question: "${assignment.description}"
Tables available: ${assignment.tables_used.join(', ')}

`;

  if (userQuery && userQuery.trim().length > 0) {
    prompt += `Student's current query:
${userQuery}

Tell them whats wrong or what concept to look into next.
`;
  } else {
    prompt += `Student hasnt written anything yet. Give a starting hint about what SQL concepts they need.
`;
  }

  prompt += `
RULES:
- Do NOT give the complete query
- Do NOT give the answer
- Keep it short, 2-3 sentences
- Point toward the right concept/clause
- Be encouraging`;

  return prompt;
}

module.exports = { getHint };
