import { describe, it, expect, beforeEach } from 'vitest';
import mutations from '@/store/cached-fetch/mutations';
import TYPES from '@/store/types';

describe('store/cached-fetch/mutations', () => {
  let state;

  beforeEach(() => {
    state = {
      cachedFetch: {},
    };
  });

  it('should cache fetched data correctly', () => {
    const className = 'User';
    const identifier = '123';
    const attributes = { name: 'John Doe', age: 30 };

    mutations[TYPES.CACHE_FETCH](state, { className, identifier, attributes });

    expect(state.cachedFetch).toEqual({
      'User/123': { name: 'John Doe', age: 30 },
    });
  });

  it('should update cached data if the same key is used', () => {
    const className = 'User';
    const identifier = '123';
    const attributes = { name: 'Jane Doe', age: 25 };

    state.cachedFetch = {
      'User/123': { name: 'John Doe', age: 30 },
    };

    mutations[TYPES.CACHE_FETCH](state, { className, identifier, attributes });

    expect(state.cachedFetch).toEqual({
      'User/123': { name: 'Jane Doe', age: 25 },
    });
  });

  it('should not affect other cached data', () => {
    const className1 = 'User';
    const identifier1 = '123';
    const attributes1 = { name: 'John Doe', age: 30 };

    state.cachedFetch = {
      'Product/456': { name: 'Laptop', price: 1000 },
    };

    mutations[TYPES.CACHE_FETCH](state, {
      className: className1,
      identifier: identifier1,
      attributes: attributes1,
    });

    expect(state.cachedFetch).toEqual({
      'User/123': { name: 'John Doe', age: 30 },
      'Product/456': { name: 'Laptop', price: 1000 },
    });
  });

  it('should handle an empty attributes object', () => {
    const className = 'User';
    const identifier = '123';
    const attributes = {};

    mutations[TYPES.CACHE_FETCH](state, { className, identifier, attributes });

    expect(state.cachedFetch).toEqual({
      'User/123': {},
    });
  });
});
