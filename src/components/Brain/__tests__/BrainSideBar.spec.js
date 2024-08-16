import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';
import { expect } from 'vitest';
import BrainSideBar from '@/components/Brain/BrainSideBar.vue';

const routes = [
  { path: '/personalization', name: 'router-personalization', component: {} },
  { path: '/content', name: 'router-content', component: {} },
  { path: '/actions', name: 'router-actions', component: {} },
  { path: '/tunings', name: 'router-tunings', component: {} },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const store = createStore({
  state: {},
  actions: {},
});

describe('BrainSideBar', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(BrainSideBar, {
      global: {
        plugins: [router, store],
      },
    });
  });

  test('renders correctly with props and initial state', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent('[data-test="floating-btn"]').exists()).toBe(
      true,
    );
  });

  test('toggles the collapsing of the sidebar by clicking on the button', async () => {
    const button = wrapper.findComponent('[data-test="floating-btn"]');
    expect(wrapper.classes()).not.toContain('collapsed');

    await button.trigger('click');
    expect(wrapper.classes()).toContain('collapsed');

    await button.trigger('click');
    expect(wrapper.classes()).not.toContain('collapsed');
  });

  test('navigates to the correct tab when clicking on a sidebar item', async () => {
    const sidebarItems = wrapper.findAll('[data-test="nav-router"]');
    expect(sidebarItems.length).toBe(4);

    const pushSpy = vi.spyOn(router, 'push');

    await sidebarItems[1].trigger('click');
    expect(pushSpy).toHaveBeenCalledWith({ name: 'router-content' });
  });

  test('runs the navigation correctly in afterEach', async () => {
    const afterEachMock = vi.fn();
    router.afterEach(afterEachMock);

    router.push('/personalization');
    await flushPromises();

    expect(afterEachMock).toHaveBeenCalled();
    expect(afterEachMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });
});
