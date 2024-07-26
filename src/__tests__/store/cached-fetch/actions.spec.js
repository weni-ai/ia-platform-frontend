import { describe, it, expect, vi } from 'vitest';
import actions from '@/store/cached-fetch/actions';
import TYPES from '@/store/types';

describe('store/cached-fetch/actions', () => {
  let commit;

  beforeEach(() => {
    commit = vi.fn();
  });

  it('should commit CACHE_FETCH with the provided payload', () => {
    const payload = { data: 'testData' };

    actions.cacheFetch({ commit }, payload);

    expect(commit).toHaveBeenCalledWith(TYPES.CACHE_FETCH, payload);
  });

  it('should commit CACHE_FETCH with an empty payload if none is provided', () => {
    actions.cacheFetch({ commit });

    expect(commit).toHaveBeenCalledWith(TYPES.CACHE_FETCH, undefined);
  });
});
