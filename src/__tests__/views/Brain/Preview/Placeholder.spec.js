import { mount } from '@vue/test-utils';
import Placeholder from '@/views/Brain/Preview/Placeholder.vue';

describe('Placeholder', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Placeholder);
  });

  test('renders the placeholder description correctly', () => {
    console.log('wrapper.text()', wrapper.text());
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('router.preview.placeholder'),
    );
  });

  test('renders the chat icon correctly', () => {
    const icon = wrapper.find('.preview-placeholder__icon-chat');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('src')).toBe('/src/assets/icons/chat.svg');
    expect(icon.attributes('alt')).toBe('chat');
  });

  test('has the correct CSS classes', () => {
    const placeholderElement = wrapper.find('.preview-placeholder');
    expect(placeholderElement.exists()).toBe(true);

    const iconElement = wrapper.find('.preview-placeholder__icon-chat');
    expect(iconElement.exists()).toBe(true);

    const descriptionElement = wrapper.find(
      '.preview-placeholder__description',
    );
    expect(descriptionElement.exists()).toBe(true);
  });

  test('applies correct styles to description', () => {
    const descriptionElement = wrapper.find(
      '.preview-placeholder__description',
    );
    expect(descriptionElement.exists()).toBe(true);
    expect(descriptionElement.classes()).toContain(
      'preview-placeholder__description',
    );
  });
});
