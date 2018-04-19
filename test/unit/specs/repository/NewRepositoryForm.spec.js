/* eslint-disable import/first */
jest.mock('@/api/request');

import Vuex from 'vuex';
import Buefy from 'buefy';
import { shallow, createLocalVue } from '@vue/test-utils';

import store from '@/store';
import NewRepositoryForm from '@/components/repository/NewRepositoryForm';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);

describe('NewRepositoryForm.vue', () => {
  let wrapper;
  beforeEach(() => {
    store.replaceState({
      Auth: {},
      Repository: {},
    });
    wrapper = shallow(NewRepositoryForm, { localVue, store });
  });

  test('mount', () => {
    expect(wrapper.vm).toBeDefined();
  });

  describe('valid data', () => {
    beforeEach(() => {
      wrapper.vm.data = {
        name: 'Repository One',
        slug: 'repository1',
        language: 'en',
        categories: [1],
        description: '',
        is_private: true,
      };
    });

    describe('on submit', () => {
      beforeEach(() => {
        wrapper.find('form').trigger('submit');
      });

      test('no errors', () => {
        expect(wrapper.vm.errors).toMatchObject({});
      });

      test('emit created', () => {
        expect(wrapper.emitted('created')).toBeDefined();
      });
    });
  });

  describe('invalid data', () => {
    beforeEach(() => {
      wrapper.vm.data = {
        name: 'Repository',
        slug: 'repository1',
        language: 'en',
        categories: [],
        description: '',
        is_private: false,
      };
    });

    describe('on submit', () => {
      beforeEach(() => {
        wrapper.find('form').trigger('submit');
      });

      test('show categories error', () => {
        expect(wrapper.vm.errors.categories).toBeDefined();
      });

      test('emit created', () => {
        expect(wrapper.emitted('created')).toBeUndefined();
      });
    });
  });
});
