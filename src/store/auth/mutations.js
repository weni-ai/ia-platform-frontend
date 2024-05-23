import TYPES from '../types';

export default {
  [TYPES.SET_TOKEN](state, token) {
    state.token = token;
    /* istanbul ignore next */
    if (localStorage) {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  },
  [TYPES.SET_ORG](state, org) {
    state.org = org;
  },
  [TYPES.SET_PROJECT](state, project) {
    state.project = project;
  },
};
