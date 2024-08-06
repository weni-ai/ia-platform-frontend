import { mount } from '@vue/test-utils';
import NotFound from '@/views/NotFound.vue';

describe('NotFound.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(NotFound);
  });

  test('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('contains the correct elements', () => {
    const section = wrapper.find('section.not-found');
    expect(section.exists()).toBe(true);

    const heading = wrapper.find('h1');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('Page Not Found');
  });

  test('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
