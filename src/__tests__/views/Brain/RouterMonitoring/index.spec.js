import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createStore } from 'vuex';
import { createTestingPinia } from '@pinia/testing';

import WS from '@/websocket/setup';

import RouterMonitoring from '@/views/Brain/RouterMonitoring/index.vue';
import { useMonitoringStore } from '@/store/Monitoring';

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: '123-456',
        token: 'test-token',
      },
    };
  },
});

const pinia = createTestingPinia({
  initialState: {
    monitoring: {
      ws: null,
    },
  },
});

vi.mock('@/websocket/setup', () => ({
  default: vi.fn(() => ({
    connect: vi.fn(),
  })),
}));

describe('RouterMonitoring view', () => {
  let wrapper;
  let WSMock;
  let connectMock;

  const monitoringStore = useMonitoringStore();

  beforeEach(() => {
    monitoringStore.ws = null;
    connectMock = vi.fn();
    WSMock = vi.fn(() => ({
      connect: connectMock,
    }));
    WS.mockImplementation(WSMock);

    wrapper = shallowMount(RouterMonitoring, {
      global: { plugins: [store, pinia] },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all child components', () => {
    expect(wrapper.find('[data-testid="divider"]').exists()).toBe(true);
    expect(wrapper.findComponent('[data-testid="performance"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.findComponent('[data-testid="received-messages"]').exists(),
    ).toBe(true);
  });

  it('initializes WebSocket with correct parameters on mount', () => {
    expect(WSMock).toHaveBeenCalledWith({
      project: '123-456',
      token: 'test-token',
    });
    expect(connectMock).toHaveBeenCalled();
  });

  it('does not initialize WebSocket again if already connected', async () => {
    wrapper.unmount();
    wrapper = shallowMount(RouterMonitoring, {
      global: { plugins: [store, pinia] },
    });

    expect(WSMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledTimes(1);
  });
});
