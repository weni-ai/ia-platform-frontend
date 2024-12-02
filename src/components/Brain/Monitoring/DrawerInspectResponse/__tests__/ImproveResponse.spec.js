import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMonitoringStore } from '@/store/Monitoring';
import i18n from '@/utils/plugins/i18n';

import ImproveResponse from '../ImproveResponse.vue';

vi.mock('@/store/Monitoring', () => ({
  useMonitoringStore: vi.fn(),
}));

const createWrapper = (props = {}) => {
  const mockMonitoringStore = {
    messages: {
      inspectedAnswer: {
        action: props.actionToEdit || null,
      },
    },
  };

  useMonitoringStore.mockReturnValue(mockMonitoringStore);

  return mount(ImproveResponse, {
    props: {
      type: props.type || 'success',
    },
    global: {
      stubs: ['UnnnicButton', 'UnnnicIcon', 'ModalAddContent'],
    },
  });
};

describe('ImproveResponse.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const headerFailed = () => wrapper.find('[data-testid="header-failed"]');
  const addContentButton = () =>
    wrapper.findComponent('[data-testid="add-content-button"]');
  const addActionButton = () =>
    wrapper.findComponent('[data-testid="add-action-button"]');

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders the failed header when type is "failed"', () => {
    wrapper = createWrapper({ type: 'failed' });

    expect(headerFailed().exists()).toBe(true);
    expect(headerFailed().text()).toContain(
      i18n.global.t('router.monitoring.improve_response.agent_unable_respond'),
    );
  });

  it('does not render the failed header when type is not "failed"', () => {
    wrapper = createWrapper({ type: 'success' });

    expect(headerFailed().exists()).toBe(false);
  });

  it('renders the buttons with correct text', () => {
    wrapper = createWrapper({ actionToEdit: { name: 'TestEditName' } });

    const editButton = wrapper.findComponent(
      '[data-testid="edit-action-button"]',
    );

    expect(editButton.exists()).toBe(true);
    expect(editButton.props('text')).toContain('TestEditName');
    expect(addContentButton().exists()).toBe(false);
    expect(addActionButton().exists()).toBe(true);
  });

  it('renders the add content button when there is no action to edit', () => {
    expect(addContentButton().exists()).toBe(true);
    expect(addContentButton().props('text')).toContain(
      i18n.global.t('router.monitoring.improve_response.add_new_content'),
    );
  });

  it('opens the modal when add content button is clicked', async () => {
    const modalAddContent = () =>
      wrapper.findComponent('[data-testid="modal-add-content"]');

    expect(modalAddContent().exists()).toBe(false);

    await addContentButton().trigger('click');

    expect(modalAddContent().exists()).toBe(true);
  });
});
