/**
 * Onedrly AI - Lightweight JSON data layer for analytics & learning
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data');
const CONVERSATIONS_FILE = path.join(DB_PATH, 'conversations.json');
const ANALYTICS_FILE = path.join(DB_PATH, 'analytics.json');
const PATTERNS_FILE = path.join(DB_PATH, 'patterns.json');
const FEEDBACK_FILE = path.join(DB_PATH, 'feedback.json');

const ensureFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

ensureFile(CONVERSATIONS_FILE, { conversations: [] });
ensureFile(ANALYTICS_FILE, { totalQuestions: 0, categories: {}, keywords: {}, topics: {} });
ensureFile(PATTERNS_FILE, { commonPatterns: [], relatedTopics: {} });
ensureFile(FEEDBACK_FILE, { ratings: [], improvements: [] });

const readData = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}`, error);
    return null;
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}`, error);
    return false;
  }
};

const extractKeywords = (text = '') => {
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'to', 'for', 'of', 'with', 'i', 'you', 'we', 'they'];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 10);
};

const analyzeSentiment = (text = '') => {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'best'];
  const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'hate', 'awful'];
  const lower = text.toLowerCase();
  const pos = positiveWords.filter(word => lower.includes(word)).length;
  const neg = negativeWords.filter(word => lower.includes(word)).length;
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
};

const extractQuestionPattern = (text = '') => {
  const lower = text.toLowerCase();
  if (lower.startsWith('what')) return 'what';
  if (lower.startsWith('how')) return 'how';
  if (lower.startsWith('where')) return 'where';
  if (lower.startsWith('when')) return 'when';
  if (lower.includes('recommend')) return 'recommendation';
  if (lower.includes('plan')) return 'planning';
  if (lower.includes('budget')) return 'budget';
  if (lower.includes('best')) return 'best';
  return 'other';
};

const generateImprovementSuggestions = (categoryIssues = {}) => {
  return Object.entries(categoryIssues).map(([category, info]) => ({
    category,
    issueCount: info.count,
    nextSteps: `Review knowledge base entries and curated answers for ${category}.`
  }));
};

const predictNextQuestions = (conversations = []) => {
  if (conversations.length < 2) return [];
  const transitions = {};
  for (let i = 1; i < conversations.length; i++) {
    const prev = conversations[i - 1].category;
    const current = conversations[i].category;
    if (!transitions[prev]) transitions[prev] = {};
    transitions[prev][current] = (transitions[prev][current] || 0) + 1;
  }
  return Object.entries(transitions).map(([from, to]) => ({
    from,
    next: Object.entries(to).sort(([, a], [, b]) => b - a)[0]?.[0] || null
  }));
};

const saveConversation = (conversationData) => {
  const store = readData(CONVERSATIONS_FILE);
  const conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userMessage: conversationData.userMessage,
    aiResponse: conversationData.aiResponse,
    context: conversationData.context || {},
    category: conversationData.category || 'general',
    keywords: extractKeywords(conversationData.userMessage || ''),
    sentiment: analyzeSentiment(conversationData.userMessage || ''),
    responseTime: conversationData.responseTime || 0,
    rating: null,
    feedback: null
  };
  store.conversations.push(conversation);
  if (store.conversations.length > 1000) {
    store.conversations = store.conversations.slice(-1000);
  }
  writeData(CONVERSATIONS_FILE, store);
  updateAnalytics(conversation);
  return conversation.id;
};

const getConversations = (filters = {}) => {
  const data = readData(CONVERSATIONS_FILE);
  let conversations = data.conversations;
  if (filters.category) {
    conversations = conversations.filter(c => c.category === filters.category);
  }
  if (filters.startDate) {
    conversations = conversations.filter(c => new Date(c.timestamp) >= new Date(filters.startDate));
  }
  if (filters.limit) {
    conversations = conversations.slice(-filters.limit);
  }
  return conversations;
};

const updateAnalytics = (conversation) => {
  const analytics = readData(ANALYTICS_FILE);
  analytics.totalQuestions = (analytics.totalQuestions || 0) + 1;
  analytics.categories[conversation.category] = (analytics.categories[conversation.category] || 0) + 1;
  conversation.keywords.forEach(keyword => {
    analytics.keywords[keyword] = (analytics.keywords[keyword] || 0) + 1;
  });
  const date = new Date(conversation.timestamp).toISOString().split('T')[0];
  analytics.topics[date] = analytics.topics[date] || {};
  analytics.topics[date][conversation.category] = (analytics.topics[date][conversation.category] || 0) + 1;
  writeData(ANALYTICS_FILE, analytics);
};

const getAnalytics = () => {
  const analytics = readData(ANALYTICS_FILE);
  const conversations = readData(CONVERSATIONS_FILE).conversations;
  const rated = conversations.filter(c => c.rating !== null);
  const avgRating = rated.length ? rated.reduce((sum, c) => sum + c.rating, 0) / rated.length : 0;
  const topKeywords = Object.entries(analytics.keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([keyword, count]) => ({ keyword, count }));
  const categoryDistribution = Object.entries(analytics.categories)
    .map(([category, count]) => ({
      category,
      count,
      percentage: analytics.totalQuestions ? ((count / analytics.totalQuestions) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count);
  return {
    totalQuestions: analytics.totalQuestions,
    averageRating: avgRating.toFixed(2),
    topKeywords,
    categoryDistribution,
    topicsOverTime: analytics.topics
  };
};

const detectPatterns = () => {
  const conversations = readData(CONVERSATIONS_FILE).conversations;
  const patterns = readData(PATTERNS_FILE);
  const questionPatterns = {};
  conversations.forEach(conv => {
    const pattern = extractQuestionPattern(conv.userMessage || '');
    questionPatterns[pattern] = (questionPatterns[pattern] || 0) + 1;
  });
  const relatedTopics = {};
  conversations.forEach((conv, idx) => {
    if (idx === 0) return;
    const prev = conversations[idx - 1].category;
    const current = conv.category;
    relatedTopics[prev] = relatedTopics[prev] || {};
    relatedTopics[prev][current] = (relatedTopics[prev][current] || 0) + 1;
  });
  patterns.commonPatterns = Object.entries(questionPatterns)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([pattern, count]) => ({ pattern, count }));
  patterns.relatedTopics = relatedTopics;
  writeData(PATTERNS_FILE, patterns);
  return patterns;
};

const getLearningInsights = () => {
  const patterns = readData(PATTERNS_FILE);
  const analytics = readData(ANALYTICS_FILE);
  const conversations = readData(CONVERSATIONS_FILE).conversations;
  const topTopics = Object.entries(analytics.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentConversations = conversations.filter(c => new Date(c.timestamp) >= thirtyDaysAgo);
  const recentCategories = {};
  recentConversations.forEach(c => {
    recentCategories[c.category] = (recentCategories[c.category] || 0) + 1;
  });
  const predictions = predictNextQuestions(conversations);
  return {
    topTopics,
    commonPatterns: patterns.commonPatterns.slice(0, 10),
    relatedTopics: patterns.relatedTopics,
    recentTrends: recentCategories,
    predictions
  };
};

const saveFeedback = (conversationId, rating, feedbackText) => {
  const conversations = readData(CONVERSATIONS_FILE);
  const conversation = conversations.conversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.rating = rating;
    conversation.feedback = feedbackText;
    writeData(CONVERSATIONS_FILE, conversations);
  }
  const feedback = readData(FEEDBACK_FILE);
  feedback.ratings.push({
    conversationId,
    rating,
    feedback: feedbackText,
    timestamp: new Date().toISOString()
  });
  writeData(FEEDBACK_FILE, feedback);
  return true;
};

const getImprovementSuggestions = () => {
  const conversations = readData(CONVERSATIONS_FILE).conversations;
  const lowRated = conversations.filter(c => c.rating !== null && c.rating < 3);
  const categoryIssues = {};
  lowRated.forEach(item => {
    categoryIssues[item.category] = categoryIssues[item.category] || { count: 0, feedbacks: [] };
    categoryIssues[item.category].count += 1;
    if (item.feedback) categoryIssues[item.category].feedbacks.push(item.feedback);
  });
  return {
    totalLowRated: lowRated.length,
    categoryIssues,
    suggestions: generateImprovementSuggestions(categoryIssues)
  };
};

module.exports = {
  saveConversation,
  getConversations,
  getAnalytics,
  detectPatterns,
  getLearningInsights,
  saveFeedback,
  getImprovementSuggestions
};

