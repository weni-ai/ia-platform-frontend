import { mount } from '@vue/test-utils';
import SettingsAdvanced from '@/components/Brain/Tunings/SettingsAdvanced.vue';
import { createStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'test2323test',
      },
      modalWarn: null,
    };
  },
});

const customStore = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'test2323test',
      },
      modalWarn: {
        loading: false,
      },
    };
  },
});

describe('SettingsAdvanced', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SettingsAdvanced, {
      props: {
        brainOn: true,
      },
      global: {
        plugins: [store],
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders title correctly', () => {
    const title = wrapper.find('.advanced__header');
    expect(title.text()).toContain(
      wrapper.vm.$t('router.tunings.advanced.title'),
    );
  });

  test('toggles open state when header is clicked', async () => {
    const scrollIntoViewMock = vi.fn();
    wrapper.vm.$el.scrollIntoView = scrollIntoViewMock;

    const header = wrapper.find('.advanced__header');
    await header.trigger('click');

    expect(wrapper.vm.open).toBe(true);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$el.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  test('emits update:brainOn when UnnnicSwitch is toggled', async () => {
    const switchComponent = wrapper.findComponent({ name: 'UnnnicSwitch' });
    switchComponent.vm.$emit('update:model-value', true);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:brainOn')).toBeTruthy();
    expect(wrapper.emitted('update:brainOn')[0]).toEqual([true]);
  });

  test('sets modalWarn correctly when openActiveOrDeactivateBrain is called', async () => {
    wrapper.vm.openActiveOrDeactivateBrain(true);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$store.state.modalWarn.title).toContain(
      wrapper.vm.$t('router.tunings.advanced.active_brain_modal.title'),
    );
  });

  test('sets the correct modalWarn message correctly when openActiveOrDeactivateBrain is called', async () => {
    wrapper.vm.openActiveOrDeactivateBrain(false);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$store.state.modalWarn.title).toContain(
      wrapper.vm.$t('router.tunings.advanced.deactivate_brain_modal.title'),
    );
  });

  test('calls API and correctly updates brainOn state to false in changeBrainOn method', async () => {
    const mockApiResponse = { data: { brain_on: false } };

    nexusaiAPI.router.tunings.advanced.edit = vi
      .fn()
      .mockResolvedValue(mockApiResponse);

    await wrapper.vm.changeBrainOn(false);

    expect(wrapper.emitted('update:brainOn')).toBeTruthy();
    expect(wrapper.emitted('update:brainOn')[0]).toEqual([false]);
    expect(wrapper.vm.$store.state.modalWarn).toBe(null);
  });

  test('calls API and correctly updates brainOn state to true in changeBrainOn method', async () => {
    const mockApiResponse = { data: { brain_on: true } };
    nexusaiAPI.router.tunings.advanced.edit = vi
      .fn()
      .mockResolvedValue(mockApiResponse);

    const customWrapper = mount(SettingsAdvanced, {
      props: {
        brainOn: false,
      },
      global: {
        plugins: [customStore],
      },
    });

    await customWrapper.vm.changeBrainOn(true);

    expect(customWrapper.emitted('update:brainOn')).toBeTruthy();
    expect(customWrapper.emitted('update:brainOn')[0]).toEqual([true]);
    expect(customWrapper.vm.$store.state.modalWarn).toBe(null);
  });
});
