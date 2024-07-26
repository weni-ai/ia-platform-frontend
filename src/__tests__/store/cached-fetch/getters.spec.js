import { describe, it, expect } from 'vitest';
import getters from '@/store/cached-fetch/getters';

describe('store/cached-fetch/getters', () => {
  const state = {
    cachedFetch: {
      someData: 'example',
    },
  };

  it('cachedFetch should return the cachedFetch state', () => {
    const result = getters.cachedFetch(state);
    expect(result).toBe(state.cachedFetch);
  });

  it('cachedFetch should return undefined if cachedFetch state is undefined', () => {
    const result = getters.cachedFetch({});
    expect(result).toBeUndefined();
  });

  it('cachedFetch should handle empty cachedFetch object', () => {
    const result = getters.cachedFetch({ cachedFetch: {} });
    expect(result).toEqual({});
  });

  it('cachedFetch should return correct data when state contains data', () => {
    const stateWithData = {
      cachedFetch: {
        someData: 'example',
        otherData: 'anotherExample',
      },
    };
    const result = getters.cachedFetch(stateWithData);
    expect(result).toEqual(stateWithData.cachedFetch);
  });
});
