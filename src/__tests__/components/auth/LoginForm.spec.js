import store from '@/store';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import LoginForm from '@/components/auth/LoginForm';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('LoginForm.vue', () => {
  let wrapper;
  beforeEach(() => {
    store.replaceState({
      Auth: { token: null },
      User: {},
    });
    wrapper = shallowMount(LoginForm, {
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

  describe('click on forgot password button', () => {
    beforeEach(() => {
      const forgotPassword = wrapper.find({ ref: 'forgotPassword' });
      forgotPassword.trigger('click');
    });

    test('emit forgotPasswordClick event', () => {
      expect(wrapper.emitted('forgotPasswordClick')).toBeDefined();
    });
  });
});
