import { shallowMount, createLocalVue } from '@vue/test-utils';
import store from '@/store';
import RegisterForm from '@/components/auth/RegisterForm';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);
jest.spyOn(RegisterForm, 'mounted').mockImplementation(() => {});

describe('RegisterForm.spec.js', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(RegisterForm, {
      store,
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('fill form with valid data', () => {
    beforeEach(() => {
      wrapper.vm.data.email = 'new@user.com';
      wrapper.vm.data.name = 'New';
      wrapper.vm.data.nickname = 'new';
      wrapper.vm.data.password = 'n123456';
    });

    test('form data is set correctly', () => {
      expect(wrapper.vm.data.email).toBe('new@user.com');
      expect(wrapper.vm.data.name).toBe('New');
      expect(wrapper.vm.data.nickname).toBe('new');
      expect(wrapper.vm.data.password).toBe('n123456');
    });
  });
});
