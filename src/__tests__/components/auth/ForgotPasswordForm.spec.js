import { shallowMount, createLocalVue } from '@vue/test-utils';
import store from '@/store';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);
jest.spyOn(ForgotPasswordForm, 'mounted').mockImplementation(() => {});

describe('ForgotPasswordForm.vue', () => {
  let wrapper;
  beforeEach(() => {
    store.replaceState({
      Auth: {},
    });
    wrapper = shallowMount(ForgotPasswordForm, {
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

  describe('fill email with invalid data', () => {
    beforeEach(() => {
      wrapper.vm.data.email = 'no@user.com';
    });

    describe('submit form', () => {
      let submitResult;
      beforeEach(async () => {
        submitResult = await wrapper.vm.onSubmit();
      });

      test('return is false', () => {
        expect(submitResult).toBeFalsy();
      });
    });
  });
});
