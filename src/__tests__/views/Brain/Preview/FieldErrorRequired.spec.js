import { mount } from '@vue/test-utils';
import FieldErrorRequired from '@/views/Brain/Preview/FieldErrorRequired.vue';

describe('FieldErrorRequired', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FieldErrorRequired);
  });

  test('renders the error message correctly', () => {
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('customization.invalid_field'),
    );
  });

  test('renders the icon correctly', () => {
    const icon = wrapper.find('.field-error__icon');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('material-symbols-rounded');
    expect(icon.classes()).toContain('unnnic-icon-scheme--neutral-darkest');
    expect(icon.classes()).toContain('unnnic-icon-size--sm');
  });

  test('has the correct CSS classes', () => {
    const errorElement = wrapper.find('.field-error');
    expect(errorElement.exists()).toBe(true);

    const iconElement = wrapper.find('.field-error__icon');
    expect(iconElement.exists()).toBe(true);
  });

  test('applies correct styles', () => {
    const errorElement = wrapper.find('.field-error');
    expect(errorElement.exists()).toBe(true);
    expect(errorElement.classes()).toContain('field-error');
  });
});
