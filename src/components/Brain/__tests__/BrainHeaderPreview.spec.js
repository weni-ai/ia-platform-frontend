import { mount } from '@vue/test-utils';
import BrainHeaderPreview from '@/components/Brain/BrainHeaderPreview.vue';

describe('BrainHeaderPreview.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(BrainHeaderPreview, {
      props: {
        brainOn: true,
        previewActions: [
          { label: 'Action 1', value: 'action1' },
          { label: 'Action 2', value: 'action2' },
        ],
      },
      global: {
        stubs: {
          UnnnicIcon: { template: '<div class="unnnic-icon" />' },
          UnnnicIntelligenceText: {
            template: '<div class="unnnic-intelligence-text" />',
          },
          ContentItemActions: {
            template: '<div class="content-item-actions" />',
          },
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('renders the title correctly', () => {
    const title = wrapper.find('.brain-header-preview__header__title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(wrapper.vm.$t('router.preview.title'));
  });

  test('renders UnnnicIcon when brainOn is true', () => {
    const icon = wrapper.findComponent('[data-test="preview-brain-icon"]');
    expect(icon.exists()).toBe(true);
    expect(icon.props('icon')).toBe('fiber_manual_record');
    expect(icon.props('filled')).toBe(true);
    expect(icon.props('size')).toBe('sm');
    expect(icon.props('scheme')).toBe('aux-green-300');
  });

  test('renders UnnnicIntelligenceText when brainOn is true', () => {
    const intelligenceText = wrapper.findComponent(
      '[data-test="preview-brain-text"]',
    );
    expect(intelligenceText.exists()).toBe(true);
  });

  test('does not render UnnnicIcon and UnnnicIntelligenceText when brainOn is false', async () => {
    await wrapper.setProps({ brainOn: false });

    const icon = wrapper.findComponent({ name: 'UnnnicIcon' });
    const intelligenceText = wrapper.findComponent({
      name: 'UnnnicIntelligenceText',
    });

    expect(icon.exists()).toBe(false);
    expect(intelligenceText.exists()).toBe(false);
  });

  test('applies correct padding class when brainOn is true', () => {
    expect(wrapper.classes()).toContain(
      'brain-header-preview__preview-padding-active',
    );
  });

  test('applies correct padding class when brainOn is false', async () => {
    await wrapper.setProps({ brainOn: false });
    expect(wrapper.classes()).toContain(
      'brain-header-preview__preview-padding',
    );
  });

  test('renders ContentItemActions with correct props', () => {
    const contentItemActions = wrapper.findComponent(
      '[data-test="dropdown-actions"]',
    );
    expect(contentItemActions.exists()).toBe(true);
    expect(contentItemActions.attributes('minwidth')).toBe('175px');
  });

  test('updates previewActions prop correctly', async () => {
    const newActions = [
      { label: 'New Action 1', value: 'new-action1' },
      { label: 'New Action 2', value: 'new-action2' },
    ];

    await wrapper.setProps({ previewActions: newActions });
    expect(wrapper.vm.previewActions).toEqual(newActions);
  });
});
