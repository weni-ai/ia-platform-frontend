import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import AgentResponse from '../AgentResponse.vue';

describe('AgentResponse.vue', () => {
  let wrapper;

  const defaultProps = {
    status: 'error',
    response: 'Sample agent response',
    inspectionData: { key: 'value' },
  };

  const mountWrapper = (props = {}) => {
    return shallowMount(AgentResponse, {
      props: {
        ...defaultProps,
        ...props,
      },
    });
  };

  beforeEach(() => {
    wrapper = mountWrapper();
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders the agent response with correct props', () => {
    const agentResponseTitle = wrapper.findComponent(
      '[data-testid="agent-response-title"]',
    );
    expect(agentResponseTitle.exists()).toBe(true);
    expect(agentResponseTitle.props()).toMatchObject({
      color: 'neutral-cloudy',
      family: 'secondary',
      size: 'body-gt',
      tag: 'p',
    });
  });

  it('renders the agent response text when status is not "success"', () => {
    const agentResponse = wrapper.find('[data-testid="agent-response-text"]');
    expect(agentResponse.exists()).toBe(true);
    expect(agentResponse.text()).toBe(`“${defaultProps.response}”`);
  });

  it('does not render groundedness when status is not "success"', () => {
    const groundedness = wrapper.findComponent(
      '[data-testid="agent-response-success-groundedness"]',
    );
    expect(groundedness.exists()).toBe(false);
  });

  it('renders the agent response text when groundedness sources are empty', () => {
    const inspectionData = {
      groundedness: [{ sources: [] }, { sources: [] }],
    };
    wrapper = mountWrapper({ status: 'success', inspectionData });
    const agentResponse = wrapper.find('[data-testid="agent-response-text"]');
    expect(agentResponse.exists()).toBe(true);
    expect(agentResponse.text()).toBe(`“${defaultProps.response}”`);
  });

  it('renders groundedness when status is "success" and sources are not empty', () => {
    const inspectionData = {
      groundedness: [{ sources: ['source1'] }, { sources: [] }],
    };
    wrapper = mountWrapper({ status: 'success', inspectionData });
    const groundedness = wrapper.findComponent(
      '[data-testid="agent-response-success-groundedness"]',
    );
    expect(groundedness.exists()).toBe(true);
    expect(groundedness.props()).toMatchObject({
      inspectionData,
    });
  });

  it('does not render the response text when status is "success" and sources are not empty', () => {
    const inspectionData = {
      groundedness: [{ sources: ['source1'] }],
    };
    wrapper = mountWrapper({ status: 'success', inspectionData });
    const responseText = wrapper.find('[data-testid="agent-response-text"]');
    expect(responseText.exists()).toBe(false);
  });

  it('applies the correct class to the section', () => {
    const section = wrapper.find('section');
    expect(section.classes()).toContain('inspect-response__agent');
  });
});
