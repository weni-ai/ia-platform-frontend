import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { isMT, isMessage, default as previewModule } from '@/utils/FlowPreview';

const mockPost = vi.fn();

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

    it('should correctly identify message types', () => {
      expect(isMT(mockEvent)).toBe(true);
      expect(isMessage(mockEvent)).toBe(true);
    });

    it('should correctly handle previewHasQuickReplies', () => {
      vm.preview.quickReplies = [];
      expect(vm.previewHasQuickReplies()).toBe(false);
      vm.preview.quickReplies = ['reply1'];
      expect(vm.previewHasQuickReplies()).toBe(true);
    });

    it('should handle drawer type in update run context', async () => {
      const runContext = {
        session: { runs: mockSession.runs, wait: { hint: { type: 'audio' } } },
        events: [mockEvent],
      };

      await vm.previewUpdateRunContext(runContext);

      expect(vm.preview.drawerType).toBe('audio');
    });

    it('should update activity correctly', () => {
      vm.previewUpdateActivity({});
      expect(vm.preview.session).toBeTruthy();
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
      previewModule.methods.previewUpdateRunContext(runContext, {
        text: 'Hello',
      });

      await vm.previewUpdateRunContext(runContext, { text: 'Hello' });
      console.log('vm.previewUpdateRunContext', vm.preview.events);
      expect(vm.preview.events.length).toBe(1);
      expect(vm.preview.events[0].type).toBe('msg_created');
    });

    it('should resume preview and handle errors', async () => {
      mockPost.mockResolvedValueOnce({ data: { events: [mockEvent] } });

      await vm.previewResume('Test message');

      expect(mockPost).toHaveBeenCalledWith(
        `api/v2/flows/${mockFlowUuid}/simulate`,
        expect.any(Object),
        {
          headers: { Authorization: mockAuthToken },
        },
      );
      expect(vm.previewUpdateRunContext).toHaveBeenCalledWith(
        expect.objectContaining({ events: [mockEvent] }),
        expect.any(Object),
      );

      mockPost.mockRejectedValueOnce({
        response: { status: 500, data: { error: 'Server error' } },
      });

      await vm.previewResume('Test message');
      expect(vm.preview.events).toContainEqual({
        type: 'error',
        text: 'Server error, try again later',
      });
    });

    it('should start preview and update run context', async () => {
      mockPost.mockResolvedValueOnce({
        data: { events: [mockEvent], session: { runs: mockSession.runs } },
      });

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

      expect(vm.previewUpdateRunContext).toHaveBeenCalledWith(
        expect.objectContaining({
          events: [mockEvent],
          session: { runs: mockSession.runs },
        }),
      );
    });
  });
});
