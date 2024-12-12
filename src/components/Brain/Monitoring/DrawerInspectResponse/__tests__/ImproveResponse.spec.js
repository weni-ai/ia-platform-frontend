import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMonitoringStore } from '@/store/Monitoring';
import { useActionsStore } from '@/store/Actions';
import i18n from '@/utils/plugins/i18n';

import ImproveResponse from '../ImproveResponse.vue';

vi.mock('@/store/Monitoring', () => ({
  useMonitoringStore: vi.fn(),
}));

vi.mock('@/store/Actions', () => ({
  useActionsStore: vi.fn(),
}));

const createWrapper = (props = {}) => {
  const mockMonitoringStore = {
    messages: {
      inspectedAnswer: {
        action: props.actionToEdit || null,
      },
    },
  };

  const mockActionsStore = {
    actions: {
      status: null,
    },
    load: vi.fn(),
  };

  useMonitoringStore.mockReturnValue(mockMonitoringStore);
  useActionsStore.mockReturnValue(mockActionsStore);

  return mount(ImproveResponse, {
    props: {
      type: props.type || 'success',
    },
    global: {
      stubs: ['UnnnicButton', 'UnnnicIcon', 'ModalAddContent', 'ModalActions'],
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
  const editActionButton = () =>
    wrapper.findComponent('[data-testid="edit-action-button"]');
  const modalAddAction = () =>
    wrapper.findComponent('[data-testid="modal-add-action"]');

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('calls actionsStore.load if actions.status is not complete on mounted', () => {
    const mockActionsStore = useActionsStore();

    wrapper = createWrapper();
    wrapper.vm.actionsStore.actions.status = null;
    expect(mockActionsStore.load).toHaveBeenCalled();

    mockActionsStore.load.mockReset();

    wrapper = createWrapper();
    wrapper.vm.actionsStore.actions.status = 'complete';

    expect(mockActionsStore.load).not.toHaveBeenCalled();
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

  it('opens the modal when add action button is clicked', async () => {
    expect(modalAddAction().exists()).toBe(false);

    await addActionButton().trigger('click');

    expect(modalAddAction().exists()).toBe(true);
  });

  it('close the modal when @previous-step at ModalActions is emitted', async () => {
    await addActionButton().trigger('click');
    expect(wrapper.vm.isModalAddActionOpen).toBe(true);

    await modalAddAction().vm.$emit('previous-step');

    expect(wrapper.vm.isModalAddActionOpen).toBe(false);
  });

  it('should pass actionToEditUuid to ModalActions when shouldEditAction is true', async () => {
    wrapper = createWrapper({
      actionToEdit: { name: 'TestEditName', uuid: '123' },
    });

    await editActionButton().trigger('click');
    await wrapper.vm.$nextTick();

    expect(modalAddAction().exists()).toBe(true);
    expect(modalAddAction().props('actionToEditUuid')).toBe(
      wrapper.vm.actionToEdit?.uuid,
    );
  });

  it('should pass undefined to actionToEditUuid when shouldEditAction is false', async () => {
    wrapper = createWrapper({
      actionToEdit: { name: 'TestEditName', uuid: '123' },
    });

    await addActionButton().trigger('click');
    await wrapper.vm.$nextTick();

    expect(modalAddAction().exists()).toBe(true);
    expect(modalAddAction().props('actionToEditUuid')).toBe('');
  });

  it('should reset shouldEditAction when isModalAddActionOpen is closed', async () => {
    wrapper.vm.isModalAddActionOpen = true;
    wrapper.vm.shouldEditAction = true;
    await wrapper.vm.$nextTick();

    wrapper.vm.isModalAddActionOpen = false;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.shouldEditAction).toBe(false);
  });
});
