import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { isMT, isMessage, default as previewModule } from '@/utils/FlowPreview';

const mockPost = vi.fn();
const MESSAGE_DELAY_MS = 200;

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: mockPost,
    })),
  },
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

global.runtimeVariables = {
  get: vi.fn(() => 'http://mock-api.com'),
};

const mockFlowUuid = 'mock-flow-uuid';
const mockAuthToken = 'mockAuthToken';
const mockEvent = {
  type: 'msg_created',
  msg: { text: 'Hello' },
  step_uuid: 'step-uuid',
};
const mockContact = { urns: ['tel:1234567890'], uuid: 'mock-uuid' };
const mockSession = {
  runs: [{ path: [{ uuid: 'step-uuid', exit_uuid: 'exit-uuid' }] }],
};

describe('FlowPreview', () => {
  let previewAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', mockAuthToken);

    previewAPI = previewModule.computed.previewAPI.call({
      preview: { flowUuid: mockFlowUuid },
    });
  });

  describe('computed properties', () => {
    it('should create axios client with correct baseURL', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://mock-api.com',
      });
    });

    it('previewAPI should return a function to make API calls', () => {
      const body = { key: 'value' };
      previewAPI(body);

      expect(mockPost).toHaveBeenCalledWith(
        `api/v2/flows/${mockFlowUuid}/simulate`,
        body,
        {
          headers: {
            Authorization: mockAuthToken,
          },
        },
      );
    });
  });

  describe('methods', () => {
    let vm;

    beforeEach(() => {
      vm = {
        preview: previewModule.data().preview,
        ...previewModule.methods,
        previewAPI,
      };
      vm.preview.flowUuid = mockFlowUuid;
      vm.preview.contact = mockContact;
      vm.preview.session = {
        contact: mockContact,
        runs: mockSession.runs,
      };
    });

    it('should initialize preview contact correctly', () => {
      const contentBaseUuid = 'test-content-base-uuid';
      vm.previewInit({ contentBaseUuid });

      expect(vm.preview.contact.uuid).toBe('mock-uuid');
      expect(vm.preview.contact.urns[0]).toMatch(/^tel:/);
    });

    it('should update events correctly', () => {
      const callback = vi.fn();
      vm.previewUpdateEvents([mockEvent], mockSession, {}, callback);

      expect(vm.preview.events).toContain(mockEvent);
      expect(callback).toHaveBeenCalled();
    });

    it('should save quick replies if event is of message type (MT) and has quick replies', () => {
      const callback = vi.fn();
      const mockQuickReplies = ['reply1', 'reply2'];

      const mtEvent = {
        type: 'msg_created',
        msg: {
          text: 'This is a message',
          quick_replies: mockQuickReplies,
        },
        step_uuid: 'step-uuid',
        created_on: new Date().toISOString(),
      };

      vm.previewUpdateEvents([mtEvent], mockSession, {}, callback);

      expect(vm.preview.events).toContain(mtEvent);
      expect(vm.preview.quickReplies).toBe(mockQuickReplies);
      expect(callback).toHaveBeenCalled();
    });

    it('should call setTimeout and re-call previewUpdateEvents if events remain', () => {
      vi.useFakeTimers();
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const callback = vi.fn();
      const mockEvent2 = { ...mockEvent, id: 2 };

      const events = [mockEvent, mockEvent2];
      const session = { runs: mockSession.runs };

      vm.previewUpdateEvents(events, session, {}, callback);

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        MESSAGE_DELAY_MS,
      );
      expect(events).toHaveLength(1);

      vi.runAllTimers();

      expect(events).toHaveLength(0);
      expect(callback).toHaveBeenCalled();
      vi.useRealTimers();
      setTimeoutSpy.mockRestore();
    });

    it('should call the callback immediately if events are initially empty', () => {
      const callback = vi.fn();

      const events = [];
      const session = { runs: mockSession.runs };

      vm.previewUpdateEvents(events, session, {}, callback);

      expect(callback).toHaveBeenCalled();
    });

    it('should correctly identify message types', () => {
      expect(isMT(mockEvent)).toBe(true);
      expect(isMessage(mockEvent)).toBe(true);
    });

    it('should correctly handle previewHasQuickReplies', () => {
      vm.preview.quickReplies = {};
      expect(vm.previewHasQuickReplies()).toBe(false);
      vm.preview.quickReplies = [];
      expect(vm.previewHasQuickReplies()).toBe(false);
      vm.preview.quickReplies = ['reply1'];
      expect(vm.previewHasQuickReplies()).toBe(true);
    });

    it('should handle various drawer types based on run context hints', async () => {
      const cases = [
        { hintType: 'audio', expectedDrawerType: 'audio' },
        { hintType: 'video', expectedDrawerType: 'videos' },
        { hintType: 'image', expectedDrawerType: 'images' },
        { hintType: 'location', expectedDrawerType: 'location' },
        { hintType: 'digits', hintCount: 1, expectedDrawerType: 'digit' },
        { hintType: 'digits', hintCount: 2, expectedDrawerType: 'digits' },
        {
          hintType: 'unknown',
          expectedDrawerType: null,
          expectedLog: 'Unknown hint',
        },
      ];

      const originalLog = console.log;
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      for (const {
        hintType,
        hintCount,
        expectedDrawerType,
        expectedLog,
      } of cases) {
        const runContext = {
          session: {
            runs: mockSession.runs,
            wait: {
              hint: {
                type: hintType,
                count: hintCount,
              },
            },
          },
          events: [mockEvent],
        };

        await vm.previewUpdateRunContext(runContext);

        if (expectedDrawerType) {
          expect(vm.preview.drawerType).toBe(expectedDrawerType);
        }

        if (expectedLog) {
          expect(logSpy).toHaveBeenCalledWith(expectedLog, hintType);
        } else {
          expect(logSpy).not.toHaveBeenCalled();
        }
      }

      console.log = originalLog;
      logSpy.mockRestore();
    });

    it('should set drawerType to quickReplies and open drawer when quickReplies are present', async () => {
      const runContext = {
        session: {
          runs: mockSession.runs,
          wait: { hint: { type: 'Unknown' } },
        },
        events: [mockEvent],
      };

      vm.preview.quickReplies = [
        { text: 'Quick Reply 1' },
        { text: 'Quick Reply 2' },
      ];

      const spyPreviewHasQuickReplies = vi
        .spyOn(vm, 'previewHasQuickReplies')
        .mockReturnValue(true);

      await vm.previewUpdateRunContext(runContext);

      expect(spyPreviewHasQuickReplies).toHaveBeenCalled();
      expect(vm.preview.drawerType).toBe('quickReplies');
      expect(vm.preview.drawerOpen).toBe(true);

      spyPreviewHasQuickReplies.mockRestore();
    });

    it('should update activity correctly', () => {
      vm.previewUpdateActivity({});
      expect(vm.preview.session).toBeTruthy();
    });

    it('should update paths and recentMessages correctly when session is present', () => {
      const recentMessages = {};
      vm.preview.session = {
        runs: [
          {
            path: [
              { node_uuid: 'node1', exit_uuid: 'exit1' },
              { node_uuid: 'node2', exit_uuid: 'exit2' },
            ],
            flow_uuid: 'flow1',
          },
        ],
        status: 'waiting',
      };

      vm.previewUpdateActivity(recentMessages);

      expect(recentMessages).toHaveProperty('exit1:node2');
      expect(recentMessages['exit1:node2']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit2:null');
      expect(recentMessages['exit2:null']).toEqual([]);
      expect(vm.preview.session).toBeTruthy();
    });

    it('should handle multiple runs and update active nodes and activeFlow correctly', () => {
      const recentMessages = {};
      vm.preview.session = {
        runs: [
          {
            path: [
              { node_uuid: 'node1', exit_uuid: 'exit1' },
              { node_uuid: 'node2', exit_uuid: 'exit2' },
            ],
            flow_uuid: 'flow1',
          },
          {
            path: [
              { node_uuid: 'node3', exit_uuid: 'exit3' },
              { node_uuid: 'node4', exit_uuid: 'exit4' },
            ],
            flow_uuid: 'flow2',
          },
        ],
        status: 'waiting',
      };

      vm.previewUpdateActivity(recentMessages);

      expect(recentMessages).toHaveProperty('exit1:node2');
      expect(recentMessages['exit1:node2']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit2:null');
      expect(recentMessages['exit2:null']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit3:node4');
      expect(recentMessages['exit3:node4']).toEqual([]);
      expect(recentMessages).toHaveProperty('exit4:null');
      expect(recentMessages['exit4:null']).toEqual([]);
      expect(vm.preview.session).toBeTruthy();
    });

    it('should do nothing when session is not present', () => {
      const recentMessages = {};
      vm.preview.session = null;

      vm.previewUpdateActivity(recentMessages);

      expect(vm.preview.session).toBeNull();
      expect(recentMessages).toEqual({});
    });

    it('should correctly handle previewResume with no text', async () => {
      await vm.previewResume('');
      expect(vm.preview.sprinting).toBe(false);
    });

    it('should update events with timeout', () => {
      const callback = vi.fn();
      vm.previewUpdateEvents([mockEvent], mockSession, {}, callback);

      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
      }, 300);
    });

    it('should update run context with no events', async () => {
      const runContext = {
        session: { runs: mockSession.runs },
      };

      await vm.previewUpdateRunContext(runContext, { text: 'Hello' });
      expect(vm.preview.events.length).toBe(1);
      expect(vm.preview.events[0].type).toBe('msg_created');
    });

    it('should resume preview and handle errors', async () => {
      mockPost.mockResolvedValueOnce({
        data: { events: [mockEvent], session: { runs: mockSession.runs } },
      });

      await vm.previewResume('Test message');

      expect(mockPost).toHaveBeenCalledWith(
        `api/v2/flows/${mockFlowUuid}/simulate`,
        expect.any(Object),
        {
          headers: { Authorization: mockAuthToken },
        },
      );

      mockPost.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Server error' } },
      });

      await vm.previewResume('Test message');
      expect(vm.preview.events).toContainEqual({
        type: 'error',
        text: 'Server error, try again later',
      });

      mockPost.mockRejectedValueOnce({
        response: { status: 498, data: { error: 'Server error' } },
      });

      await vm.previewResume('Test message');
      expect(vm.preview.events).toContainEqual({
        type: 'error',
        text: 'Server error',
      });
    });

    it('should start preview and update run context', async () => {
      mockPost.mockResolvedValueOnce({
        data: { events: [mockEvent], session: { runs: mockSession.runs } },
      });

      const originalPreviewUpdateRunContext = vm.previewUpdateRunContext;
      const spyPreviewUpdateRunContext = vi.fn();
      vm.previewUpdateRunContext = spyPreviewUpdateRunContext;

      await vm.previewStart({
        languageId: 'en',
        flowUuid: mockFlowUuid,
        flowName: 'Test Flow',
      });

      expect(vm.preview.flowUuid).toBe(mockFlowUuid);
      expect(mockPost).toHaveBeenCalledWith(
        `api/v2/flows/${mockFlowUuid}/simulate`,
        expect.any(Object),
        {
          headers: { Authorization: mockAuthToken },
        },
      );

      expect(spyPreviewUpdateRunContext).toHaveBeenCalledWith(
        expect.objectContaining({
          events: [mockEvent],
          session: { runs: mockSession.runs },
        }),
      );

      vm.previewUpdateRunContext = originalPreviewUpdateRunContext;
    });
  });
});
