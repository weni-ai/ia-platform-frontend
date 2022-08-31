import suggestions from '@/api/suggestions';

export default {
  async suggestWords(store, { isQuestion, intent, texts }) {
    return suggestions.suggestWords(isQuestion, intent, texts);
  },
  async suggestSentences(store, { isQuestion, intent, texts }) {
    return suggestions.suggestSentences(isQuestion, intent, texts);
  },
};
