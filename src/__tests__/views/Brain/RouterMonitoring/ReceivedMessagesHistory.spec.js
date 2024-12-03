import { vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';
import { useMonitoringStore } from '@/store/Monitoring';

import RouterMonitoringReceivedMessagesHistory from '@/views/Brain/RouterMonitoring/RouterMonitoringReceivedMessagesHistory/index.vue';

const pinia = createTestingPinia({
  initialState: {
    monitoring: {
      messages: {
        inspectedAnswer: {
          id: '123',
          contact_urn: 'contact-urn',
          uuid: '123456789',
          text: 'test text',
          action: null,
          llm: {
            response: 'test llm',
            status: 'success',
          },
          status: 'complete',
        },
      },
      loadMessageDetails: vi.fn(),
    },
  },
});

describe('RouterMonitoringReceivedMessagesHistory.vue', () => {
  let wrapper;
  let monitoringStore = useMonitoringStore();

  beforeEach(() => {
    wrapper = mount(RouterMonitoringReceivedMessagesHistory, {
      global: { plugins: [pinia] },
    });
  });

  it('renders the component with inspectedAnswer data', () => {
    expect(wrapper.find('.received-messages-history').exists()).toBe(true);
    expect(wrapper.find('.header__urn').text()).toBe('contact-urn');
  });

  it('renders the QuestionAndAnswer component with props', () => {
    const questionAndAnswerComponent = wrapper.findComponent(
      '[data-testid="question-and-answer"]',
    );

    expect(questionAndAnswerComponent.exists()).toBe(true);
    expect(questionAndAnswerComponent.props('isLoading')).toBe(false);
  });

  it('loads message history when inspectedAnswer id changes', async () => {
    expect(monitoringStore.loadMessageDetails).toHaveBeenCalledWith({
      id: '123',
    });
  });

  it('shows loading state when isLoadingMessages is true', async () => {
    monitoringStore.messages.inspectedAnswer.status = 'loading';
    await nextTick();

    expect(
      wrapper.findComponent('[data-testid="contact-urn-loading"]').exists(),
    ).toBe(true);
    expect(wrapper.findComponent('[data-testid="contact-urn"]').exists()).toBe(
      false,
    );
  });

  it('calls close function when close icon is clicked', async () => {
    await wrapper.findComponent('[data-testid="close-icon"]').trigger('click');

    expect(monitoringStore.messages.inspectedAnswer).toEqual({});
  });
});
