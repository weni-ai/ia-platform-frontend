import { vi, describe, it, expect, beforeEach } from 'vitest';

import { useMonitoringStore } from '@/store/Monitoring';

import createMessage from '../create';

vi.mock('@/store/Monitoring', () => ({
  useMonitoringStore: vi.fn(),
}));

describe('createMessage', () => {
  let createNewMessageMock;

  beforeEach(() => {
    createNewMessageMock = vi.fn();

    useMonitoringStore.mockReturnValue({
      createNewMessage: createNewMessageMock,
    });

    vi.clearAllMocks();
  });

  it('should call createNewMessage with the correct message', () => {
    const message = 'test-message';

    createMessage(message);

    expect(createNewMessageMock).toHaveBeenCalledWith({ message });
  });
});
