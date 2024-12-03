import { vi } from 'vitest';
import Socket from '@/websocket/socket.js';

vi.stubGlobal(
  'WebSocket',
  vi.fn().mockImplementation((url) => ({
    url,
    readyState: WebSocket.OPEN,
    OPEN: WebSocket.OPEN,
    send: vi.fn(),
    onmessage: null,
    onPong: null,
  })),
);

describe('Socket', () => {
  let socket;
  const mockUrl = 'ws://mock-url/';

  beforeEach(() => {
    socket = new Socket(mockUrl);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize WebSocket with the provided URL', () => {
      expect(socket.ws.url).toBe(mockUrl);
      expect(socket.ws.send).toBeDefined();
    });

    it('should set up onmessage listener on the WebSocket instance', () => {
      expect(typeof socket.ws.onmessage).toBe('function');
    });

    it('should set up onPong property on the WebSocket instance', () => {
      expect(socket.ws.onPong).toBe(socket.pongData);
    });
  });

  describe('on', () => {
    it('should add a handler and call it when the corresponding message is received', () => {
      const callback = vi.fn();
      socket.on('test-type', callback);

      const mockEvent = {
        data: JSON.stringify({
          type: 'test-type',
          message: JSON.stringify({ key: 'value' }),
        }),
      };
      socket.ws.onmessage(mockEvent);

      expect(callback).toHaveBeenCalledWith(JSON.stringify({ key: 'value' }));
    });

    it('should not call the handler if the type does not match', () => {
      const callback = vi.fn();
      socket.on('test-type', callback);

      const mockEvent = {
        data: JSON.stringify({
          type: 'other-type',
          message: JSON.stringify({ key: 'value' }),
        }),
      };
      socket.ws.onmessage(mockEvent);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('#createOnMessageListener', () => {
    it('should trigger the appropriate callback when a matching message is received', () => {
      const callback = vi.fn();
      socket.on('test-type', callback);

      const mockEvent = {
        data: JSON.stringify({
          type: 'test-type',
          message: JSON.stringify({ some: 'data' }),
        }),
      };

      socket.ws.onmessage(mockEvent);

      expect(callback).toHaveBeenCalledWith(JSON.stringify({ some: 'data' }));
    });

    it('should not trigger callback if type does not match', () => {
      const callback = vi.fn();
      socket.on('test-type', callback);

      const mockEvent = {
        data: JSON.stringify({
          type: 'other-type',
          message: JSON.stringify({ some: 'data' }),
        }),
      };

      socket.ws.onmessage(mockEvent);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not call the handler if data.message is falsy', () => {
      const callback = vi.fn();
      socket.on('test-type', callback);

      const mockEvent = {
        data: JSON.stringify({
          type: 'test-type',
          message: null,
        }),
      };

      socket.ws.onmessage(mockEvent);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('send', () => {
    it('should send a message through the WebSocket', () => {
      const message = { type: 'ping', message: {} };

      expect(socket.ws.readyState).toBe(WebSocket.OPEN);

      socket.send(message);

      expect(socket.ws.send).toHaveBeenCalledWith(JSON.stringify(message));
    });
  });
});
