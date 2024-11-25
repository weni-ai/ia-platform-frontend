import { describe, it, expect, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';

import DrawerInspectResponse from '../index.vue';
import ContactMessage from '../ContactMessage.vue';
import Unnnic from '@weni/unnnic-system';
import ActionDetails from '../ActionDetails.vue';
import AgentResponse from '../AgentResponse.vue';
import ResponseEvaluator from '../ResponseEvaluator.vue';

describe('DrawerInspectResponse', () => {
  let wrapper;
  const inspectionDataMock = {
    text: 'Test message',
    llm: { status: 'action', response: 'Sample response' },
    action: { name: 'action-name' },
    is_approved: true,
  };

  const contextT = (key) =>
    i18n.global.t(`router.monitoring.inspect_response.${key}`);

  const mountWrapper = (props = {}) => {
    wrapper = shallowMount(DrawerInspectResponse, {
      props: {
        modelValue: true,
        inspectionData: inspectionDataMock,
        ...props,
      },
      global: {
        stubs: {
          UnnnicDrawer: Unnnic.unnnicDrawer,
        },
      },
    });
  };

  beforeEach(() => {
    mountWrapper();
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders the drawer with the correct props', () => {
    const drawer = wrapper.findComponent('[data-testid="drawer"]');
    expect(drawer.exists()).toBe(true);
    expect(drawer.props()).toMatchObject({
      modelValue: true,
      title: contextT('title'),
      description: contextT('intelligent_agent_response_details'),
    });
  });

  it('renders the ContactMessage component with the correct props', () => {
    const contactMessage = wrapper.findComponent(ContactMessage);
    expect(contactMessage.exists()).toBe(true);
    expect(contactMessage.props('text')).toEqual(inspectionDataMock.text);
  });

  it('conditionally renders the ActionDetails component when llm.status is "action"', () => {
    const actionDetails = wrapper.findComponent(ActionDetails);
    expect(actionDetails.exists()).toBe(true);

    expect(actionDetails.props('action')).toEqual(inspectionDataMock.action);
  });

  it('does not render the ActionDetails component when llm.status is not "action"', async () => {
    await wrapper.setProps({
      inspectionData: {
        ...inspectionDataMock,
        llm: { ...inspectionDataMock.llm, status: 'success' },
      },
    });
    const actionDetails = wrapper.findComponent(ActionDetails);
    expect(actionDetails.exists()).toBe(false);
  });

  it('renders the AgentResponse component with the correct props', () => {
    const agentResponse = wrapper.findComponent(AgentResponse);
    expect(agentResponse.exists()).toBe(true);
    expect(agentResponse.props()).toMatchObject({
      status: inspectionDataMock.llm.status,
      response: inspectionDataMock.llm.response,
      inspectionData: inspectionDataMock,
    });
  });

  it('does not render the ResponseEvaluator component when llm.status is "failed"', async () => {
    await wrapper.setProps({
      inspectionData: {
        ...inspectionDataMock,
        llm: { ...inspectionDataMock.llm, status: 'failed' },
      },
    });
    const responseEvaluator = wrapper.findComponent(ResponseEvaluator);
    expect(responseEvaluator.exists()).toBe(false);
  });

  it('conditionally renders the ResponseEvaluator component when llm.status is not "failed"', () => {
    const responseEvaluator = wrapper.findComponent(ResponseEvaluator);
    expect(responseEvaluator.exists()).toBe(true);
    expect(responseEvaluator.props('isApproved')).toEqual(
      inspectionDataMock.is_approved,
    );
  });

  it('emits "update:model-value" with false when close is called', async () => {
    const drawer = wrapper.findComponent('[data-testid="drawer"]');
    await drawer.vm.$emit('close');
    expect(wrapper.emitted('update:model-value')).toBeTruthy();
    expect(wrapper.emitted('update:model-value')[0]).toEqual([false]);
  });
});
