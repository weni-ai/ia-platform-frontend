import { shallowMount, createLocalVue } from '@vue/test-utils';
import store from '@/store';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('ResetPasswordForm.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ResetPasswordForm, {
      store,
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        nickname: 'fake',
        token: 'token1',
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('fill password with valid data', () => {
    beforeEach(() => {
      wrapper.vm.data.password = 'n123456';
    });

    describe('submit form', () => {
      let submitResult;
      beforeEach(async () => {
        submitResult = await wrapper.vm.onSubmit();
      });

      test('submit form with valid data', () => {
        expect(wrapper.vm.data.password).toBe('n123456');
      });
    });

    describe('pass invalid token', () => {
      beforeEach(() => {
        wrapper.setProps({ token: 'invalid_token' });
      });

      describe('submit form', () => {
        let submitResult;
        beforeEach(async () => {
          submitResult = await wrapper.vm.onSubmit();
        });

        test('return false', () => {
          expect(submitResult).toBeFalsy();
        });
      });
    });
  });

  describe('fill password with invalid data', () => {
    beforeEach(() => {
      wrapper.vm.data.password = '';
    });

    describe('submit form', () => {
      let submitResult;
      beforeEach(async () => {
        submitResult = await wrapper.vm.onSubmit();
      });

      test('return false', () => {
        expect(submitResult).toBeFalsy();
      });
    });
  });
});
