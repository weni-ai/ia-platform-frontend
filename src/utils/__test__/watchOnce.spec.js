import { describe, it, vi, expect } from 'vitest';
import watchOnce from '@/utils/watchOnce';
import store from '@/store/index.js';

describe('watchOnce', () => {
  it('should call the provided callback and unwatch', () => {
    const unwatchMock = vi.fn();
    store.watch = vi.fn(() => unwatchMock);

    const mockGetter = vi.fn();
    const mockCallback = vi.fn();

    watchOnce(mockGetter, mockCallback);

    store.watch.mock.calls[0][1]();

    expect(mockCallback).toHaveBeenCalled();

    expect(unwatchMock).toHaveBeenCalled();
  });
});
