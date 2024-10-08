import { shallowMount, createLocalVue } from '@vue/test-utils';
import store from '../../../store';
import EditProfileForm from '../../../components/user/EditProfileForm';
import Buefy from 'buefy';

jest.spyOn(EditProfileForm, 'mounted').mockImplementation(() => {});
const localVue = createLocalVue();
localVue.use(Buefy);

describe('EditProfileForm.vue', () => {
  let wrapper;
  beforeEach(() => {
    store.replaceState({
      Auth: {
        token: '1f5e7e21d331536b58448595f69eb50a6b5e49b8',
      },
      User: {
        profiles: {},
      },
    });
    wrapper = shallowMount(EditProfileForm, {
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      localVue,
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  test('has formSchema', () => {
    expect(wrapper.vm.formSchema).toBeDefined();
  });

  describe('fill with valid data', () => {
    beforeEach(() => {
      wrapper.setData({
        data: {
          nickname: 'fake',
          email: 'fake@user.com',
          name: 'New Name',
          locale: '',
        },
      });
    });

    test('has data', () => {
      expect(Object.keys(wrapper.vm.data)).toEqual(
        expect.arrayContaining(['nickname', 'email', 'name', 'locale']),
      );
    });

    describe('submit', () => {
      beforeEach(async () => {
        await wrapper.vm.onSubmit();
      });

      test('no errors', () => {
        expect(Object.keys(wrapper.vm.errors)).toHaveLength(0);
      });
    });
  });

  describe('fill with invalid data', () => {
    beforeEach(() => {
      wrapper.setData({
        data: {
          nickname: '',
          email: 'fake@user.com',
          name: 'New Name',
          locale: '',
        },
      });
    });

    test('has data', () => {
      expect(Object.keys(wrapper.vm.data)).toEqual(
        expect.arrayContaining(['nickname', 'email', 'name', 'locale']),
      );
    });

    describe('submit', () => {
      let submit;
      beforeEach(async () => {
        submit = await wrapper.vm.onSubmit();
      });

      test('return false', () => {
        expect(submit).toBeFalsy();
      });
    });
  });
});
