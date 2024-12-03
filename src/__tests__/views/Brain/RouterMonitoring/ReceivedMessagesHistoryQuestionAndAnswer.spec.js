import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import QuestionAndAnswer from '@/views/Brain/RouterMonitoring/RouterMonitoringReceivedMessagesHistory/QuestionAndAnswer.vue';

describe('Monitoring messages history QuestionAndAnswer component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(QuestionAndAnswer, {
      props: {
        isLoading: false,
        data: {
          text: 'Test question',
          llm: {
            status: 'success',
            response: 'Test answer',
          },
          action: {
            name: 'Test Action',
          },
        },
      },
    });
  });

  it('renders response with appropriate class based on llm status', () => {
    expect(
      wrapper.find('.question-and-answer__answer-text--success').text(),
    ).toBe('Test answer');
  });

  it('renders question and response when not loading', () => {
    expect(wrapper.find('[data-testid="question"]').text()).toBe(
      'Test question',
    );
    expect(wrapper.find('[data-testid="answer"]').text()).toBe('Test answer');
  });

  it('renders action status section when status is "action"', async () => {
    wrapper.setProps({
      data: { ...wrapper.vm.data, llm: { status: 'action' } },
    });
    await nextTick();

    expect(wrapper.find('[data-testid="action"]').exists()).toBe(true);
    expect(wrapper.findComponent('[data-testid="action-icon"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.findComponent('[data-testid="action-name"]').text(),
    ).toContain('Test Action');
  });

  it('renders loading state correctly', async () => {
    await wrapper.setProps({ isLoading: true });

    expect(wrapper.find('[data-testid="skeleton-question"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="skeleton-answer"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="question"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="answer"]').exists()).toBe(false);
  });
});
