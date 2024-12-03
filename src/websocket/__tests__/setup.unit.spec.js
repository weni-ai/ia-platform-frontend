import { describe, it, expect, vi, beforeEach } from 'vitest';

import WebSocketSetup from '@/websocket/setup';
import WS from '@/websocket/socket';
import listeners from '@/websocket/listeners';

vi.mock('@/websocket/socket');
vi.mock('@/websocket/listeners');
vi.mock('@/utils/env', () => ({
  default: vi.fn(() => 'ws://mock-url'),
}));
vi.mock('@/store/modules/dashboard');

describe('WebSocketSetup', () => {
  let webSocketSetup;
  const mockApp = {
    appToken: 'mockToken',
    appProject: 'mockProject',
    updateUserStatus: vi.fn(),
  };

  beforeEach(() => {
    webSocketSetup = new WebSocketSetup({
      project: 'test-project',
      token: 'test-token',
    });
    webSocketSetup.ws = {
      send: vi.fn(),
      ws: {
        readyState: 1,
        OPEN: 1,
        close: vi.fn(),
        send: vi.fn(),
      },
    };
  });

  describe('connect', () => {
    it('should initialize WS with the correct URL and call listeners', () => {
      const spySetupPingInterval = vi.spyOn(
        webSocketSetup,
        'setupPingInterval',
      );
      webSocketSetup.buildUrl = vi.fn().mockReturnValue('mockUrl');

      webSocketSetup.connect();

      expect(WS).toHaveBeenCalledWith(expect.any(String));
      expect(listeners).toHaveBeenCalledWith({
        ws: webSocketSetup.ws,
      });
      expect(spySetupPingInterval).toHaveBeenCalled();
    });
  });

  describe('setupPingInterval', () => {
    it('should set up an interval to call ping', () => {
      vi.useFakeTimers();
      const spyPing = vi.spyOn(webSocketSetup, 'ping');

      webSocketSetup.setupPingInterval();

      expect(webSocketSetup.pingIntervalId).not.toBeNull();
      vi.advanceTimersByTime(30000);
      expect(spyPing).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('ping', () => {
    it('should call reconnect if WebSocket is not open', () => {
      const spyReconnect = vi.spyOn(webSocketSetup, 'reconnect');
      webSocketSetup.ws = {
        ws: {
          readyState: WebSocket.CLOSED,
          CLOSED: WebSocket.CLOSED,
          close: vi.fn(),
        },
      };

      webSocketSetup.ping();

      expect(spyReconnect).toHaveBeenCalled();
    });
  });

  describe('clearPingInterval', () => {
    it('should clear the existing interval when setting up a new one', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      webSocketSetup.pingIntervalId = setInterval(() => {}, 1000);

      webSocketSetup.setupPingInterval();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should not call clearInterval if no interval exists', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      webSocketSetup.pingIntervalId = null;

      webSocketSetup.clearPingInterval();

      expect(clearIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe('reconnect', () => {
    it('should close the current WebSocket and call connect', () => {
      const spyConnect = vi.spyOn(webSocketSetup, 'connect');
      const spyClose = vi.spyOn(webSocketSetup.ws.ws, 'close');

      webSocketSetup.reconnect();

      expect(spyClose).toHaveBeenCalled();
      expect(spyConnect).toHaveBeenCalled();
    });
  });
});
