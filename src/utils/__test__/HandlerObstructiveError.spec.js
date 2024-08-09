import { describe, expect, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import store from '@/store';
import '@/utils/HandlerObstructiveError';

describe('HandlerObstructiveError', () => {
  beforeEach(() => {
    store.state.obstructiveError = '';
  });

  const triggerUnhandledRejection = (error) => {
    const event = new Event('unhandledrejection');
    event.reason = error;
    window.dispatchEvent(event);
  };

  test.each([
    [false, undefined, '', ''],
    [true, 401, 'unauthorized', 'unauthorized'],
    [true, 500, 'default', 'default'],
    [false, undefined, '', ''],
  ])(
    'should set obstructiveError to %s when obstructiveErrorProducer is %s and status is %s',
    (obstructiveErrorProducer, status, expectedError, description) => {
      const error = new AxiosError('Test Error');
      error.config = { obstructiveErrorProducer };

      if (status !== undefined) {
        error.response = { status };
      }

      triggerUnhandledRejection(error);

      expect(store.state.obstructiveError).toBe(expectedError);
    },
  );
});
