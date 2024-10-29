import { mount } from '@vue/test-utils';
import HistoryItem from '@/components/Brain/Tunings/HistoryItem.vue';

describe('HistoryItem.vue', () => {
  let wrapper;

  const props = {
    text: 'Some history text',
    icon: 'article',
    user: 'User Test',
    isRenderGroupText: false,
    groupText: [],
  };

  beforeEach(() => {
    wrapper = mount(HistoryItem, {
      props,
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders the user and text correctly', () => {
    const userElement = wrapper.find('.history-item__user');
    const textElement = wrapper.find('.history-item__text');

    expect(userElement.exists()).toBe(true);
    expect(userElement.text()).toBe(props.user);
    expect(textElement.exists()).toBe(true);
    expect(textElement.text()).toBe(props.text);
  });

  test('renders UnnnicIcon with correct props', () => {
    const iconComponent = wrapper.findComponent('[data-test="history-icon"]');
    expect(iconComponent.exists()).toBe(true);
    expect(iconComponent.props('icon')).toBe(props.icon);
    expect(iconComponent.props('size')).toBe('ant');
    expect(iconComponent.props('scheme')).toBe('neutral-cloudy');
  });

  test('does not render groupText section when isRenderGroupText is false', () => {
    const descriptionSection = wrapper.find('.history-item__description');
    expect(descriptionSection.exists()).toBe(false);
  });

  test('renders groupText when isRenderGroupText is true', async () => {
    await wrapper.setProps({
      isRenderGroupText: true,
      groupText: ['First text', 'Second text'],
    });

    const descriptionSection = wrapper.find('.history-item__description');
    expect(descriptionSection.exists()).toBe(true);

    const textItems = wrapper.findAll('.history-item__text');
    expect(textItems.length).toBe(3);

    expect(textItems[1].text()).toBe('First text');
    expect(textItems[2].text()).toBe('Second text');
  });

  test('renders nothing in groupText section if groupText is empty', async () => {
    await wrapper.setProps({
      isRenderGroupText: true,
      groupText: ['Second text'],
    });

    const descriptionSection = wrapper.find('.history-item__description');
    expect(descriptionSection.exists()).toBe(true);

    const textItems = wrapper.findAll('.history-item__text');
    expect(textItems.length).toBe(2);
  });
});
