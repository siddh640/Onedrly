const express = require('express');
const router = express.Router();
const db = require('../ai/database');
const knowledgeBase = require('../ai/knowledge-base');

let openAiClientPromise = null;

const resolveOpenAIClient = async () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openAiClientPromise) {
    openAiClientPromise = import('openai')
      .then((module) => {
        const OpenAI = module.default || module.OpenAI;
        return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      })
      .catch((error) => {
        console.warn('OpenAI client disabled:', error.message);
        return null;
      });
  }

  return openAiClientPromise;
};

const SYSTEM_PROMPT = `You are Onedrly AI, an award-winning travel concierge. Help users with itineraries, local insights, food, safety, budgeting, transport, weather, visas, and packing. Respond with clear sections, practical tips, emojis, and always encourage follow-up questions.`;

router.post('/chat', async (req, res) => {
  try {
    const { message, context, conversationId, history } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Ask me something about travel and I will help instantly.' });
    }

    const category = categorizeQuery(message);
    const knowledgeResult = knowledgeBase.searchKnowledgeBase(message, context);
    const start = Date.now();

    const openai = await resolveOpenAIClient();

    if (!openai || knowledgeResult?.mode === 'direct' || knowledgeResult?.mode === 'summary') {
      const payload = knowledgeResult || knowledgeBase.buildFallbackMessage(message);
      const convId = db.saveConversation({
        userMessage: message,
        aiResponse: payload.response,
        context: context || {},
        category,
        responseTime: Date.now() - start
      });

      return res.json({
        message: payload.response,
        suggestions: payload.suggestions,
        metadata: {
          source: payload.mode === 'summary' ? 'knowledge-collection' : 'knowledge-base',
          destination: payload.destination,
          confidence: payload.score,
          category,
          conversationId: convId
        }
      });
    }

    const messages = buildOpenAiMessages(message, context, knowledgeResult, history);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1500
    });

    const aiResponse = completion.choices[0].message.content;
    const suggestions = knowledgeResult?.suggestions?.length
      ? knowledgeResult.suggestions
      : extractSuggestions(aiResponse);

    const convId = db.saveConversation({
      userMessage: message,
      aiResponse,
      context: context || {},
      category,
      responseTime: Date.now() - start
    });

    res.json({
      message: aiResponse,
      suggestions,
      metadata: {
        model: completion.model,
        tokens: completion.usage,
        category,
        conversationId: convId,
        source: knowledgeResult?.mode ? 'hybrid' : 'openai',
        knowledgeContextUsed: Boolean(knowledgeResult?.mode === 'context')
      }
    });
  } catch (error) {
    console.error('Onedrly AI chat error:', error);
    const fallback = knowledgeBase.buildFallbackMessage(req.body?.message || 'travel');
    res.json({
      message: fallback.response,
      suggestions: fallback.suggestions,
      metadata: {
        source: 'fallback',
        reason: error.message
      }
    });
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    const { destination, budget, duration, interests } = req.body || {};

    const openai = await resolveOpenAIClient();
    if (!openai) {
      const fallback = buildRecommendationFallback({ destination, budget, duration, interests });
      return res.json(fallback);
    }

    const prompt = `Provide detailed travel recommendations for ${destination || 'a trip'}:
${budget ? `Budget: ${budget}` : ''}
${duration ? `Duration: ${duration} days` : ''}
${interests?.length ? `Interests: ${interests.join(', ')}` : ''}

Include: attractions, hotels (budget/mid/luxury), restaurants, unique experiences, transport and money-saving tips.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    res.json({
      recommendations: response.choices[0].message.content,
      destination,
      metadata: { tokens: response.usage }
    });
  } catch (error) {
    console.error('recommendations error', error);
    return res.json(buildRecommendationFallback(req.body || {}));
  }
});

router.post('/itinerary', async (req, res) => {
  try {
    const { destination, days, interests, budget } = req.body || {};
    if (!destination || !days) {
      return res.status(400).json({ message: 'Destination and number of days are required.' });
    }

    if (!openai) {
      return res.json(buildItineraryFallback({ destination, days, interests }));
    }

    const prompt = `Create a detailed ${days}-day itinerary for ${destination}.
${interests?.length ? `Focus on: ${interests.join(', ')}` : ''}
${budget ? `Budget level: ${budget}` : ''}
List morning/afternoon/evening plans, dining ideas, transport notes, costs and pro tips each day.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    res.json({
      itinerary: response.choices[0].message.content,
      destination,
      days,
      metadata: { tokens: response.usage }
    });
  } catch (error) {
    console.error('itinerary error', error);
    res.json(buildItineraryFallback(req.body || {}));
  }
});

router.get('/destination/:destination', async (req, res) => {
  try {
    const destination = decodeURIComponent(req.params.destination);
    if (!openai) {
      return res.json(buildDestinationInfoFallback(destination));
    }

    const prompt = `Provide comprehensive information about ${destination} covering overview, weather, transport, attractions, food, tips and hidden gems.`;
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    res.json({
      destination,
      information: response.choices[0].message.content,
      metadata: { tokens: response.usage }
    });
  } catch (error) {
    console.error('destination info error', error);
    res.json(buildDestinationInfoFallback(req.params.destination));
  }
});

router.get('/tips/:destination', async (req, res) => {
  try {
    const destination = decodeURIComponent(req.params.destination);
    const category = req.query.category;

    const openai = await resolveOpenAIClient();
    if (!openai) {
      return res.json(buildTipsFallback(destination, category));
    }

    let prompt = `Share insider travel tips for ${destination}`;
    if (category) {
      prompt += ` focused on ${category}`;
    }
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    res.json({
      destination,
      category,
      tips: response.choices[0].message.content,
      metadata: { tokens: response.usage }
    });
  } catch (error) {
    console.error('tips error', error);
    res.json(buildTipsFallback(req.params.destination, req.query.category));
  }
});

router.post('/packing-list', async (req, res) => {
  try {
    const { destination, duration, season, activities } = req.body || {};
    if (!destination || !duration) {
      return res.status(400).json({ message: 'Destination and duration are required.' });
    }

    const openai = await resolveOpenAIClient();
    if (!openai) {
      return res.json(buildPackingListFallback({ destination, duration, season, activities }));
    }

    const prompt = `Create a packing list for ${duration}-day trip to ${destination}.
${season ? `Season: ${season}` : ''}
${activities?.length ? `Activities: ${activities.join(', ')}` : ''}
Include categories (clothing, gear, docs, tech, health) with quantities.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    res.json({
      packingList: response.choices[0].message.content,
      destination,
      duration,
      metadata: { tokens: response.usage }
    });
  } catch (error) {
    console.error('packing list error', error);
    res.json(buildPackingListFallback(req.body || {}));
  }
});

router.post('/budget-estimate', async (req, res) => {
  try {
    const { destination, duration, travelers, accommodation, activities } = req.body || {};
    if (!destination || !duration || !travelers) {
      return res.status(400).json({ message: 'Destination, duration and travelers are required.' });
    }

    const openai = await resolveOpenAIClient();
    if (!openai) {
      return res.json(buildBudgetEstimateFallback({ destination, duration, travelers, accommodation, activities }));
    }

    const prompt = `Estimate budget for ${travelers} traveler(s) visiting ${destination} for ${duration} days.
${accommodation ? `Accommodation preference: ${accommodation}` : ''}
${activities?.length ? `Activities planned: ${activities.join(', ')}` : ''}
Provide budget/mid-range/luxury breakdown plus money-saving tips.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    res.json({
      budgetEstimate: response.choices[0].message.content,
      destination,
      duration,
      travelers,
      metadata: { tokens: response.usage }
    });
  } catch (error) {
    console.error('budget error', error);
    res.json(buildBudgetEstimateFallback(req.body || {}));
  }
});

router.post('/feedback', (req, res) => {
  try {
    const { conversationId, rating, feedback } = req.body || {};
    if (!conversationId || !rating) {
      return res.status(400).json({ message: 'conversationId and rating are required.' });
    }
    db.saveFeedback(conversationId, rating === 'positive' ? 5 : 1, feedback);
    res.json({ success: true });
  } catch (error) {
    console.error('feedback error', error);
    res.status(500).json({ message: 'Unable to record feedback right now.' });
  }
});

router.get('/knowledge/destinations', (req, res) => {
  res.json({
    destinations: knowledgeBase.getDestinations()
  });
});

router.get('/knowledge/:destination', (req, res) => {
  const destination = decodeURIComponent(req.params.destination);
  const record = knowledgeBase.getDestinationRecord(destination);
  if (!record) {
    return res.status(404).json({ message: 'Destination not found in knowledge base.' });
  }
  res.json({
    destination,
    data: record
  });
});

router.post('/knowledge/reload', (req, res) => {
  const ok = knowledgeBase.loadKnowledgeBase();
  res.json({
    success: ok,
    message: ok ? 'Knowledge base refreshed.' : 'Failed to reload knowledge base.'
  });
});

/**
 * Helper utilities
 */

function buildOpenAiMessages(message, context, knowledgeResult, history) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (context) {
    const contextParts = [];
    if (context.destination) contextParts.push(`Destination: ${context.destination}`);
    if (context.dates?.start && context.dates?.end) contextParts.push(`Travel dates: ${context.dates.start} to ${context.dates.end}`);
    if (context.budget) contextParts.push(`Budget: ${context.budget}`);
    if (context.travelers) contextParts.push(`Travelers: ${context.travelers}`);
    if (context.interests?.length) contextParts.push(`Interests: ${context.interests.join(', ')}`);
    if (contextParts.length) {
      messages.push({ role: 'system', content: `User context: ${contextParts.join('. ')}.` });
    }
  }

  if (knowledgeResult?.mode === 'context') {
    messages.push({
      role: 'system',
      content: `Use this curated Onedrly data as factual context:\n${knowledgeResult.contextBlock}`
    });
  }

  if (history && Array.isArray(history)) {
    const trimmed = history.slice(-10).filter(msg => msg.role !== 'system');
    trimmed.forEach(msg => messages.push({ role: msg.role, content: msg.content }));
  }

  messages.push({ role: 'user', content: message });
  return messages;
}

function extractSuggestions(response = '') {
  const text = response.toLowerCase();
  const suggestions = [];
  if (text.includes('hotel') || text.includes('stay')) suggestions.push('Show me stay options with prices.');
  if (text.includes('food') || text.includes('restaurant')) suggestions.push('What are the must-try dishes there?');
  if (text.includes('activity') || text.includes('attraction')) suggestions.push('Plan a day-by-day itinerary.');
  if (text.includes('budget') || text.includes('cost')) suggestions.push('Help me optimize my budget.');
  return suggestions.length ? suggestions.slice(0, 3) : [
    'Plan a detailed itinerary for me.',
    'Recommend a packing list.',
    'Share safety or visa tips.'
  ];
}

function categorizeQuery(query = '') {
  const lower = query.toLowerCase();
  if (lower.includes('hotel') || lower.includes('stay')) return 'accommodation';
  if (lower.includes('food') || lower.includes('restaurant')) return 'dining';
  if (lower.includes('activity') || lower.includes('attraction')) return 'activities';
  if (lower.includes('budget') || lower.includes('cost')) return 'budget';
  if (lower.includes('itinerary') || lower.includes('plan')) return 'planning';
  if (lower.includes('transport') || lower.includes('flight') || lower.includes('train')) return 'transportation';
  if (lower.includes('weather') || lower.includes('climate')) return 'weather';
  if (lower.includes('visa') || lower.includes('passport')) return 'documentation';
  if (lower.includes('safe') || lower.includes('safety')) return 'safety';
  if (lower.includes('culture') || lower.includes('custom')) return 'culture';
  return 'general';
}

const resolveDestinationRecord = knowledgeBase.resolveDestinationRecord;

function buildRecommendationFallback(payload) {
  const fallback = knowledgeBase.formatMultiDestinationAnswer(
    knowledgeBase.getTopDestinations(3),
    payload.destination
  );
  return {
    recommendations: fallback,
    destination: payload.destination,
    metadata: { source: 'knowledge-base' }
  };
}

function buildItineraryFallback(payload) {
  const resolved = resolveDestinationRecord(payload.destination);
  if (!resolved) {
    return {
      itinerary: `I can help craft a ${payload.days || 3}-day outline once you confirm the destination.`,
      destination: payload.destination,
      days: payload.days || 3,
      metadata: { source: 'knowledge-base' }
    };
  }

  const totalDays = Math.max(1, payload.days || 3);
  const record = resolved.record;
  const attractions = record.attractions || [];
  const restaurants = record.restaurants || [];
  const tips = record.travelTips || [];
  const plan = [];

  for (let day = 1; day <= totalDays; day++) {
    plan.push(
      `### Day ${day}\n` +
      `• Morning: ${attractions[(day - 1) % attractions.length] || 'Scenic walk & coffee with a view'}\n` +
      `• Afternoon: ${record.activities?.[(day - 1) % (record.activities.length || 1)] || 'Cultural immersion & local market'}\n` +
      `• Evening: Dinner at ${restaurants[(day - 1) % restaurants.length] || 'a popular local eatery'}\n` +
      `• Tip: ${tips[(day - 1) % tips.length] || 'Leave buffer time for spontaneous discoveries.'}`
    );
  }

  return {
    itinerary: [
      `🗺️ **${totalDays}-Day ${resolved.destination} Highlights**`,
      payload.interests?.length ? `Tailored for: ${payload.interests.join(', ')}` : null,
      ...plan
    ].filter(Boolean).join('\n\n'),
    destination: resolved.destination,
    days: totalDays,
    metadata: { source: 'knowledge-base' }
  };
}

function buildDestinationInfoFallback(destination) {
  const resolved = resolveDestinationRecord(destination);
  if (!resolved) {
    const fallback = knowledgeBase.buildFallbackMessage(destination || 'this destination');
    return {
      destination,
      information: fallback.response,
      metadata: { source: 'knowledge-base' }
    };
  }

  return {
    destination: resolved.destination,
    information: knowledgeBase.formatAnswer(resolved.destination, resolved.record),
    metadata: { source: 'knowledge-base' }
  };
}

function buildTipsFallback(destination, category) {
  const resolved = resolveDestinationRecord(destination);
  if (!resolved) {
    const fallback = knowledgeBase.buildFallbackMessage(destination || 'travel tips');
    return {
      destination,
      category,
      tips: fallback.response,
      metadata: { source: 'knowledge-base' }
    };
  }

  const tips = resolved.record.travelTips || [];
  const filtered = category
    ? tips.filter(tip => tip.toLowerCase().includes(category.toLowerCase()))
    : tips;

  return {
    destination: resolved.destination,
    category,
    tips: (filtered.length ? filtered : tips).map(tip => `• ${tip}`).join('\n'),
    metadata: { source: 'knowledge-base' }
  };
}

function buildPackingListFallback(payload) {
  const resolved = resolveDestinationRecord(payload.destination);
  if (!resolved) {
    const fallback = knowledgeBase.buildFallbackMessage(payload.destination || 'your trip');
    return {
      packingList: fallback.response,
      destination: payload.destination,
      duration: payload.duration || 4,
      metadata: { source: 'knowledge-base' }
    };
  }

  const record = resolved.record;
  return {
    packingList: [
      `🎒 **Packing list for ${payload.duration || 4}-day ${resolved.destination} escape**`,
      `☁️ Weather: ${record.weather || 'varied conditions'}${payload.season ? ` | Season: ${payload.season}` : ''}`,
      '👗 Clothing:\n• Layer-able outfits\n• Comfortable walking shoes\n• Evening smart-casual wear\n• Lightweight rain jacket',
      '🧼 Toiletries & health:\n• Travel-size basics\n• Personal meds + compact first aid\n• SPF 30+ sunscreen & lip balm',
      '🔌 Tech & docs:\n• Universal adapter + power bank\n• Offline maps & confirmations\n• Passport/ID + travel insurance'
    ].join('\n\n'),
    destination: resolved.destination,
    duration: payload.duration || 4,
    metadata: { source: 'knowledge-base' }
  };
}

function buildBudgetEstimateFallback(payload) {
  const resolved = resolveDestinationRecord(payload.destination);
  const days = Math.max(2, payload.duration || 4);
  const people = Math.max(1, payload.travelers || 2);

  if (!resolved) {
    return {
      budgetEstimate: `For ${people} traveler(s) spending ${days} days, plan roughly:\n\n` +
        `• Budget: ₹${people * days * 3500}\n` +
        `• Mid-range: ₹${people * days * 8000}\n` +
        `• Premium: ₹${people * days * 15000}\n\nRefine this once we pick the destination.`,
      destination: payload.destination,
      duration: days,
      travelers: people,
      metadata: { source: 'knowledge-base' }
    };
  }

  const multipliers = { budget: 3800, mid: 8500, luxury: 16000 };
  const boost = payload.activities?.length ? payload.activities.length * 400 : 0;
  const calc = (type) => Math.round((multipliers[type] + boost) * days * people);

  return {
    budgetEstimate: [
      `💰 **Estimated budget for ${people} traveler(s) spending ${days} days in ${resolved.destination}**`,
      payload.accommodation ? `Preferred stay: ${payload.accommodation}` : null,
      payload.activities?.length ? `Planned highlights: ${payload.activities.join(', ')}` : null,
      `• Smart spenders: ₹${calc('budget').toLocaleString('en-IN')}\n` +
      `• Balanced comfort: ₹${calc('mid').toLocaleString('en-IN')}\n` +
      `• Luxe indulgence: ₹${calc('luxury').toLocaleString('en-IN')}`,
      'Includes hotels, meals, local transport, activities and a contingency buffer.'
    ].filter(Boolean).join('\n\n'),
    destination: resolved.destination,
    duration: days,
    travelers: people,
    metadata: { source: 'knowledge-base' }
  };
}

module.exports = router;


