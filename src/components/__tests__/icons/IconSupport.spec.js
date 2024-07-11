import { mount } from '@vue/test-utils';
import IconSupport from '@/components/icons/IconSupport.vue';

describe('IconSupport', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(IconSupport);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('renders SVG icon correctly', () => {
    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('path').exists()).toBe(true);
  });

  test('SVG has correct attributes', () => {
    const svgElement = wrapper.find('svg');
    expect(svgElement.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svgElement.attributes('width')).toBe('20');
    expect(svgElement.attributes('height')).toBe('20');
    expect(svgElement.attributes('fill')).toBe('currentColor');
  });

  test('SVG path contains correct data', () => {
    const pathElement = wrapper.find('path');
    const expectedPathData =
      'M10 3.22l-.61-.6a5.5 5.5 0 0 0-7.666.105 5.5 5.5 0 0 0-.114 7.665L10 18.78l8.39-8.4a5.5 5.5 0 0 0-.114-7.665 5.5 5.5 0 0 0-7.666-.105l-.61.61z';

    expect(pathElement.attributes('d')).toBe(expectedPathData);
  });
});
