import { createStore } from 'vuex';

import Auth from './auth';
import User from './user';
import Repository from './repository';
import Category from './category';
import EvaluateExample from './evaluate-example';
import Translate from './translate';
import CachedFetch from './cached-fetch';
import News from './news';
import Tutorial from './tutorial';
import Integration from './integration';
import Suggestions from './suggestions';
import Brain from './brain';

export const store = createStore({
  state() {
    return {
      obstructiveError: null,

      alert: null,

      modalWarn: null,

      router: {
        intelligenceUuid: null,
        contentBaseUuid: null,
      },
    };
  },

  modules: {
    Auth,
    User,
    Repository,
    Category,
    Translate,
    CachedFetch,
    EvaluateExample,
    News,
    Tutorial,
    Integration,
    Suggestions,
    Brain,
  },
});

store.dispatch('retriveAuthToken');

export default store;
