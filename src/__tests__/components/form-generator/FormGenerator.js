import { shallowMount, createLocalVue } from '@vue/test-utils';
import FormGenerator from '@/components/form-generator/FormGenerator';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('FormGenerator', () => {
  it('renders correctly', () => {
    const schema = {
      name: {
        type: 'string',
        label: 'Name',
      },
      email: {
        type: 'email',
        label: 'Email',
      },
    };

    const wrapper = shallowMount(FormGenerator, {
      localVue,
      propsData: {
        schema: schema,
        initialData: {},
        errors: {},
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
