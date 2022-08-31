import request from './requestSuggestions';

export default {
  suggestWords(isquestion, intent, texts) {
    return request.$http().post(
      'suggest_words/',
      {
        isquestion,
        intent,
        texts
      },
    );
  },
  suggestSentences(isquestion, intent, texts) {
    return request.$http().post(
      'suggest_sentences/',
      {
        isquestion,
        intent,
        texts
      },
    );
  },
};
