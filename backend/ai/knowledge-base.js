const fs = require('fs');
const path = require('path');

const KNOWLEDGE_PATH = path.join(__dirname, 'data', 'knowledge-base.json');

const stopWords = new Set([
  'a', 'an', 'and', 'the', 'is', 'of', 'to', 'for', 'on', 'in', 'with', 'that', 'this',
  'at', 'by', 'from', 'as', 'it', 'be', 'are', 'was', 'or', 'if', 'into', 'about', 'your',
  'you', 'me', 'my', 'we', 'our', 'their', 'they', 'them', 'what', 'how', 'where', 'when'
]);

const DIRECT_THRESHOLD = 0.32;
const CONTEXT_THRESHOLD = 0.18;

let knowledgeBase = {};
let documents = [];

const loadKnowledgeBase = () => {
  try {
    const data = fs.readFileSync(KNOWLEDGE_PATH, 'utf-8');
    knowledgeBase = JSON.parse(data);
    documents = Object.entries(knowledgeBase).map(([destination, record]) => {
      const docText = buildDocumentText(destination, record);
      const tokens = tokenize(docText);
      return {
        destination,
        record,
        tokens,
        vector: buildVector(tokens)
      };
    });
    return true;
  } catch (error) {
    console.error('Failed to load knowledge base:', error);
    knowledgeBase = {};
    documents = [];
    return false;
  }
};

const buildDocumentText = (destination, record) => {
  const parts = [
    destination,
    record.summary,
    record.weather,
    record.idealVisit,
    ...(record.keywords || []),
    ...(record.bestFor || []),
    ...(record.attractions || []),
    ...(record.restaurants || []),
    ...(record.activities || []),
    ...(record.travelTips || [])
  ];
  return parts.filter(Boolean).join(' ');
};

const tokenize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopWords.has(token));

const buildVector = (tokens) => {
  const vector = {};
  tokens.forEach(token => {
    vector[token] = (vector[token] || 0) + 1;
  });
  return vector;
};

const cosineSimilarity = (vectorA, vectorB) => {
  const intersection = Object.keys(vectorA).filter(token => token in vectorB);
  if (intersection.length === 0) return 0;
  const dotProduct = intersection.reduce((sum, token) => sum + (vectorA[token] * vectorB[token]), 0);
  const magnitudeA = Math.sqrt(Object.values(vectorA).reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(Object.values(vectorB).reduce((sum, value) => sum + value * value, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

const formatAnswer = (destination, record) => {
  const sections = [];
  sections.push(`🌐 **${destination} Travel Snapshot**\n${record.summary}`);
  if (record.weather || record.idealVisit) {
    sections.push([
      record.weather ? `☁️ Weather: ${record.weather}` : null,
      record.idealVisit ? `🗓️ Best time: ${record.idealVisit}` : null
    ].filter(Boolean).join('\n'));
  }
  if (record.attractions?.length) {
    sections.push('🏞️ **Top attractions:**\n' + record.attractions.slice(0, 5).map(item => `• ${item}`).join('\n'));
  }
  if (record.restaurants?.length) {
    sections.push('🍽️ **Food picks:**\n' + record.restaurants.slice(0, 4).map(item => `• ${item}`).join('\n'));
  }
  if (record.activities?.length) {
    sections.push('🎯 **Things to do:**\n' + record.activities.slice(0, 4).map(item => `• ${item}`).join('\n'));
  }
  if (record.hotels) {
    sections.push([
      record.hotels.budget?.length ? `💸 Budget: ${record.hotels.budget.slice(0, 2).join(', ')}` : null,
      record.hotels.midRange?.length ? `💼 Mid-range: ${record.hotels.midRange.slice(0, 2).join(', ')}` : null,
      record.hotels.luxury?.length ? `👑 Luxury: ${record.hotels.luxury.slice(0, 2).join(', ')}` : null
    ].filter(Boolean).join('\n'));
  }
  if (record.travelTips?.length) {
    sections.push('💡 **Pro tips:**\n' + record.travelTips.slice(0, 3).map(item => `• ${item}`).join('\n'));
  }
  if (record.bestFor?.length) {
    sections.push(`✨ Best for: ${record.bestFor.join(', ')}`);
  }
  sections.push('Let me know if you want itineraries, budget plans, or more hidden gems!');
  return sections.filter(Boolean).join('\n\n');
};

const formatMultiDestinationAnswer = (entries, query) => {
  if (!entries || entries.length === 0) {
    return 'I could not load curated destinations at the moment, but I can still help with travel planning tips if you rephrase your question.';
  }
  const intro = query
    ? `I couldn’t reach live APIs for "${query}", but here are curated Onedrly picks you can explore right now:`
    : 'Here are some curated Onedrly destinations you can explore right now:';
  const body = entries.map(entry => {
    const record = entry.record;
    const attractions = record.attractions?.slice(0, 2).join(', ') || 'Signature landmarks and local favorites';
    const food = record.restaurants?.[0] || 'Local cuisine highlights';
    const bestFor = record.bestFor?.slice(0, 3).join(', ') || 'Multiple travel styles';
    return [
      `### ${entry.destination}`,
      record.summary,
      `• Must-see: ${attractions}`,
      `• Food highlight: ${food}`,
      `• Best for: ${bestFor}`
    ].join('\n');
  }).join('\n\n');
  return `${intro}\n\n${body}\n\nTell me which one feels exciting and I’ll plan the details for you.`;
};

const getTopDestinations = (limit = 3) => documents.slice(0, limit).map(doc => ({
  destination: doc.destination,
  record: doc.record,
  score: 0
}));

const getDefaultSuggestions = (destination) => [
  'Weather in Shimla right now?',
  'Top hotels in Goa this weekend',
  destination ? `Plan a 3-day itinerary for ${destination}` : 'Plan a 4-day mountain itinerary'
];

const searchKnowledgeBase = (query, context = {}) => {
  if (!documents.length) return null;
  const contextText = [
    query,
    context.destination,
    context.interests?.join(' '),
    context.budget,
    context.travelers ? `${context.travelers} travelers` : null
  ].filter(Boolean).join(' ');
  const queryVector = buildVector(tokenize(contextText));
  const scored = documents
    .map(doc => ({
      destination: doc.destination,
      record: doc.record,
      score: Object.keys(queryVector).length ? cosineSimilarity(queryVector, doc.vector) : 0
    }))
    .sort((a, b) => b.score - a.score);
  if (scored.length === 0) {
    return {
      mode: 'none',
      suggestions: getDefaultSuggestions()
    };
  }
  const best = scored[0];
  const mode = best.score >= DIRECT_THRESHOLD
    ? 'direct'
    : best.score >= CONTEXT_THRESHOLD
      ? 'context'
      : 'summary';
  if (mode === 'summary') {
    const summaryEntries = scored.slice(0, 3);
    return {
      mode,
      destination: best.destination,
      score: Number(best.score.toFixed(3)),
      response: formatMultiDestinationAnswer(summaryEntries, query),
      suggestions: getDefaultSuggestions(best.destination)
    };
  }
  return {
    mode,
    destination: best.destination,
    score: Number(best.score.toFixed(3)),
    response: formatAnswer(best.destination, best.record),
    record: best.record,
    suggestions: best.record.followUpQuestions?.length
      ? best.record.followUpQuestions
      : getDefaultSuggestions(best.destination),
    contextBlock: JSON.stringify({
      destination: best.destination,
      summary: best.record.summary,
      attractions: best.record.attractions,
      restaurants: best.record.restaurants,
      activities: best.record.activities,
      hotels: best.record.hotels,
      travelTips: best.record.travelTips,
      weather: best.record.weather,
      idealVisit: best.record.idealVisit
    }, null, 2)
  };
};

const getDestinations = () => Object.keys(knowledgeBase);

const getDestinationRecord = (destination) => knowledgeBase[destination] || null;

const resolveDestinationRecord = (destination) => {
  if (!destination) return null;
  const normalized = destination.trim().toLowerCase();
  const destinations = getDestinations();
  const exact = destinations.find(name => name.toLowerCase() === normalized);
  if (exact) {
    const record = getDestinationRecord(exact);
    if (record) {
      return { destination: exact, record };
    }
  }
  const searchResult = searchKnowledgeBase(destination);
  if (searchResult?.record) {
    return { destination: searchResult.destination, record: searchResult.record };
  }
  return null;
};

const buildFallbackMessage = (query) => {
  const curated = getTopDestinations(3);
  if (curated.length > 0) {
    return {
      message: formatMultiDestinationAnswer(curated, query),
      response: formatMultiDestinationAnswer(curated, query),
      suggestions: getDefaultSuggestions(curated[0].destination),
      destination: curated[0].destination
    };
  }
  return {
    message: `I'm sorry, I couldn't fetch live data for "${query}". Would you like me to suggest nearby destinations or help with travel planning tips instead?`,
    response: `I'm sorry, I couldn't fetch live data for "${query}". Would you like me to suggest nearby destinations or help with travel planning tips instead?`,
    suggestions: getDefaultSuggestions()
  };
};

loadKnowledgeBase();

module.exports = {
  loadKnowledgeBase,
  searchKnowledgeBase,
  getDestinations,
  getDestinationRecord,
  buildFallbackMessage,
  resolveDestinationRecord,
  formatMultiDestinationAnswer,
  formatAnswer,
  getTopDestinations
};

