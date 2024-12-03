import { vi, describe, it, expect, beforeEach } from 'vitest';
import setupListeners from '../index';
import messagesListener from '../messages';

vi.mock('../messages', () => ({
  default: {
    create: vi.fn(),
  },
}));

describe('setupListeners', () => {
  let ws;

  beforeEach(() => {
    ws = {
      on: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('should register the "ws" event listener on ws', () => {
    setupListeners({ ws });

    expect(ws.on).toHaveBeenCalledWith('ws', expect.any(Function));
  });

  it('should call messagesListener.create with the correct payload', () => {
    setupListeners({ ws });

    const callback = ws.on.mock.calls[0][1];
    const payload = { data: 'test-payload' };

    callback(payload);

    expect(messagesListener.create).toHaveBeenCalledWith(payload);
  });
});
