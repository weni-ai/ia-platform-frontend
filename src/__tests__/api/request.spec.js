import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as Sentry from '@sentry/browser';
import request from '@/api/request';
import store from '@/store';

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
  },
}));

global.runtimeVariables = {
  get: vi.fn(),
};

describe('request.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create axios client with correct baseURL and headers', () => {
    store.getters.authenticated = true;
    store.getters.authToken = 'token123';
    runtimeVariables.get.mockReturnValue('http://example.com');

    request.$http;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://example.com',
      headers: {
        Authorization: 'token123',
      },
    });
  });

  it('should not include Authorization header when not authenticated', () => {
    store.getters.authenticated = false;
    runtimeVariables.get.mockReturnValue('http://example.com');

    request.$http;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://example.com',
      headers: {},
    });
  });

  it('should capture exception on 500 status error', () => {
    const error = { response: { status: 500 } };
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    request.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e.response.status).toBe(500);
    }

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should capture exception on 408 status error', () => {
    const error = { response: { status: 408 } };
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    request.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e.response.status).toBe(408);
    }

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should rethrow error without capturing for other status codes', () => {
    const error = { response: { status: 400 } };
    const mockResponseInterceptor = vi.fn();
    axios.create.mockReturnValue({
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    });

    request.$http;
    const errorHandler = mockResponseInterceptor.mock.calls[0][1];
    try {
      errorHandler(error);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
