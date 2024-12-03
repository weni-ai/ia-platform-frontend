import { mount } from '@vue/test-utils';
import { describe } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import RouterMonitoringNewMessages from '@/views/Brain/RouterMonitoring/RouterMonitoringNewMessages.vue';
import i18n from '@/utils/plugins/i18n';

const pinia = createTestingPinia({
  initialState: {
    monitoring: {
      messages: {
        newMessages: Array(5).fill('Message'),
      },
    },
  },
});

describe('RouterMonitoringNewMessages.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RouterMonitoringNewMessages, {
      global: { plugins: [pinia] },
    });
  });

  it('renders the correct button text with messages count', () => {
    expect(wrapper.text()).toBe(
      i18n.global.t('router.monitoring.new_messages_load', 5, {
        n: 5,
      }),
    );
  });

  it('emits load event when the button is clicked', async () => {
    expect(wrapper.emitted('load')).toBeFalsy();

    await wrapper
      .find('[data-testid="load-new-messages-button"]')
      .trigger('click');

    expect(wrapper.emitted('load')).toBeTruthy();
    expect(wrapper.emitted('load').length).toBe(1);
  });
});
