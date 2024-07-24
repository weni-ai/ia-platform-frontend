import { describe, it, expect } from 'vitest';
import forceHttps from '@/api/utils/forceHttps';

describe('forceHttps.js', () => {
  it('should convert http to https', () => {
    const httpUrl = 'http://brain.com';
    const httpsUrl = forceHttps(httpUrl);
    expect(httpsUrl).toBe('https://brain.com/');
  });

  it('should convert http with path to https', () => {
    const httpUrl = 'http://brain.com/path/to/resource';
    const httpsUrl = forceHttps(httpUrl);
    expect(httpsUrl).toBe('https://brain.com/path/to/resource');
  });

  it('should handle https url without change', () => {
    const httpsUrl = 'https://brain.com';
    const resultUrl = forceHttps(httpsUrl);
    expect(resultUrl).toBe('https://brain.com/');
  });

  it('should handle url with port number', () => {
    const httpUrl = 'http://brain.com:8080';
    const httpsUrl = forceHttps(httpUrl);
    expect(httpsUrl).toBe('https://brain.com:8080/');
  });

  it('should handle url with query parameters', () => {
    const httpUrl = 'http://brain.com?query=param';
    const httpsUrl = forceHttps(httpUrl);
    expect(httpsUrl).toBe('https://brain.com/?query=param');
  });

  it('should handle url with hash fragment', () => {
    const httpUrl = 'http://brain.com#section';
    const httpsUrl = forceHttps(httpUrl);
    expect(httpsUrl).toBe('https://brain.com/#section');
  });

  it('should throw error for invalid url', () => {
    expect(() => forceHttps('invalid-url')).toThrowError();
  });
});
