import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, it } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';
import { useAlertStore } from '@/store/Alert';
import { nextTick } from 'vue';

import App from '../App.vue';
import i18n from '@/utils/plugins/i18n';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: {} },
    {
      path: '/router',
      name: 'router',
      component: {},
    },
  ],
});

const store = createStore({
  state() {
    return {
      User: {
        me: 'user@me.com',
      },
      alert: null,
      modalWarn: null,
      obstructiveError: null,
    };
  },
  actions: {
    getMyProfileInfo: vi.fn(() => ({ data: null })),
  },
});

vi.mock('@/utils/HotjarIdentifyUser.js', () => ({
  HotjarIdentifyUser: vi.fn(),
}));

vi.mock('lodash', () => ({
  isEmpty: vi.fn(),
}));

describe('App.vue', () => {
  const pinia = createTestingPinia({
    initialState: {
      alert: {
        data: null,
      },
      close: vi.fn(),
    },
  });

  let wrapper;
  const alertStore = useAlertStore();

  const createWrapper = () => {
    wrapper = mount(App, {
      global: {
        plugins: [store, pinia, router],
      },
    });
  };

  beforeEach(() => {
    alertStore.data = {};

    createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders obstructive error when obstructiveError is true', async () => {
    store.state.obstructiveError = true;
    await nextTick();

    expect(
      wrapper.findComponent('[data-testid="obstructive-error"]').exists(),
    ).toBe(true);
  });

  it('renders router when obstructiveError is false', async () => {
    store.state.obstructiveError = false;
    await nextTick();
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true);
  });

  it('renders alert when store pinia is not empty', async () => {
    alertStore.data = { text: 'Test alert' };
    await nextTick();
    expect(wrapper.findComponent('[data-testid="alert-pinia"]').exists()).toBe(
      true,
    );
  });

  it('renders alert when store vuex is not empty', async () => {
    store.state.alert = { text: 'Test alert' };
    await nextTick();

    expect(wrapper.findComponent('[data-testid="alert-vuex"]').exists()).toBe(
      true,
    );
  });

  it('renders ModalWarn when modalWarn is not null', async () => {
    store.state.modalWarn = { title: 'Test modal' };
    await nextTick();
    expect(wrapper.findComponent('[data-testid="modal-warn"]').exists()).toBe(
      true,
    );
  });

  it('calls alertStore.close when alert pinia is closed', async () => {
    alertStore.data = { text: 'Test alert' };
    const closeSpy = vi.spyOn(alertStore, 'close');
    await nextTick();
    const alertComponent = wrapper.findComponent('[data-testid="alert-pinia"]');
    await alertComponent.vm.$emit('close');
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('clear alert state when alert vuex is closed', async () => {
    store.state.alert = { text: 'Test alert' };
    await nextTick();
    const alertComponent = wrapper.findComponent('[data-testid="alert-vuex"]');
    await alertComponent.vm.$emit('close');
    expect(store.state.alert).toBe(null);
  });

  it('calls modalWarn.action when modal warn is actioned', async () => {
    store.state.modalWarn = { title: 'Test modal', action: vi.fn() };
    await nextTick();
    const modalComponent = wrapper.findComponent('[data-testid="modal-warn"]');
    await modalComponent.vm.$emit('action');
    expect(store.state.modalWarn.action).toHaveBeenCalledTimes(1);
  });

  it('clears modalWarn state when modal warn is closed', async () => {
    store.state.modalWarn = { title: 'Test modal', close: vi.fn() };
    await nextTick();
    const modalComponent = wrapper.findComponent('[data-testid="modal-warn"]');
    await modalComponent.vm.$emit('close');
    expect(store.state.modalWarn).toBe(null);
  });

  describe('dynamicTitle', () => {
    it('returns correct title for pt-BR locale', () => {
      i18n.global.locale = 'pt-BR';
      expect(wrapper.vm.dynamicTitle).toBe('Weni Inteligência Artificial');
    });

    it('returns correct title for en-US locale', () => {
      i18n.global.locale = 'en-US';
      expect(wrapper.vm.dynamicTitle).toBe('Weni Artificial Intelligence');
    });

    it('returns correct title for other locales', () => {
      i18n.global.locale = 'es';
      expect(wrapper.vm.dynamicTitle).toBe('Weni Inteligencia Artificial');
    });
  });
});
