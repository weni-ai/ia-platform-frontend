import { shallowMount, createLocalVue } from '@vue/test-utils';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase/RepositoryViewBase';
import Repository from '@/models/repository';
import store from '@/store';
import Router from 'vue-router';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

localVue.use(Router);

describe('RepositoryViewBase.vue', () => {
  let repository;
  let wrapper;
  beforeEach(() => {
    repository = new Repository({
      ready_for_train: false,
      requirements_to_train: {
        en: [
          'There was no change in this bot version. No examples or translations for English have been added or removed.',
        ],
      },
      languages_ready_for_train: {
        en: false,
      },
      languages_warnings: {},
    });

    wrapper = shallowMount(RepositoryViewBase, {
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        repository,
      },
      store,
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('loading', () => {
    beforeEach(() => {
      wrapper.setProps({
        repository: null,
      });
    });

    test('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('error 404', () => {
    beforeEach(() => {
      wrapper.setProps({
        repository: null,
        errorCode: 404,
      });
    });

    test('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('error -1', () => {
    beforeEach(() => {
      wrapper.setProps({
        repository: null,
        errorCode: -1,
      });
    });

    test('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
