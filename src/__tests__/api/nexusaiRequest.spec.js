import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as Sentry from '@sentry/browser';
import nexusaiRequest from '@/api/nexusaiRequest';
import store from '@/store';
import i18n from '@/utils/plugins/i18n';

vi.mock('axios', () => ({
  default: {
    create: vi.fn().mockReturnValue({
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    }),
  },
}));

vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

vi.mock('@/store', () => ({
  default: {
    getters: {
      authenticated: false,
      authToken: '',
    },
    state: {
      alert: {},
    },
  },
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

describe('nexusaiRequest.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create axios client with correct baseURL and headers', () => {
    store.getters.authenticated = true;
    store.getters.authToken = 'token123';

    nexusaiRequest.$http;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: runtimeVariables.get('NEXUS_API_BASE_URL'),
      headers: {
        Authorization: 'token123',
      },
    });
  });

  it('should not include Authorization header when not authenticated', () => {
    store.getters.authenticated = false;

    nexusaiRequest.$http;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: runtimeVariables.get('NEXUS_API_BASE_URL'),
      headers: {},
    });
  });

  it('should capture error using Sentry', () => {
    const error = new Error('Test Error');
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    nexusaiRequest.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e).eq(error);
    }

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should set alert state on 500 error', () => {
    const error = { response: { status: 500 } };
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    nexusaiRequest.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e.response.status).eq(500);
    }
    expect(store.state.alert).toEqual({
      text: i18n.global.t('internal_server_error'),
      type: 'error',
    });
  });

  it('should set alert state on 408 error', () => {
    const error = { response: { status: 408 } };
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    nexusaiRequest.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e.response.status).eq(408);
    }
    expect(store.state.alert).toEqual({
      text: i18n.global.t('internal_server_error'),
      type: 'error',
    });
  });

  it('should set alert state on 401 error', () => {
    const error = { response: { status: 401 } };
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    nexusaiRequest.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e.response.status).eq(401);
    }

    expect(store.state.alert).toEqual({
      text: i18n.global.t('unauthorized'),
      type: 'error',
    });
  });

  it('should set alert state on unexpected error', () => {
    const error = { response: { status: 123 } };
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    nexusaiRequest.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e.response.status).eq(123);
    }

    expect(store.state.alert).toEqual({
      text: i18n.global.t('unexpected_error'),
      type: 'error',
    });
  });
});
