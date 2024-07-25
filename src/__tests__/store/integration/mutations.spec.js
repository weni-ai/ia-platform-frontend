import { describe, it, expect } from 'vitest';
import mutations from '@/store/integration/mutations';
import TYPES from '@/store/integration/types';

describe('store/integration/mutations.js', () => {
  it('SET_UPDATE_PROJECTS toggles the updateProjects state', () => {
    const state = { updateProjects: false };

    mutations[TYPES.SET_UPDATE_PROJECTS](state);
    expect(state.updateProjects).toBe(true);

    mutations[TYPES.SET_UPDATE_PROJECTS](state);
    expect(state.updateProjects).toBe(false);
  });
});
