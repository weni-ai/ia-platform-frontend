import { shallowMount, createLocalVue } from '@vue/test-utils';
import EvaluateVersionItem from '@/components/repository/repository-evaluate/versions/EvaluateVersionItem';

import VueMoment from 'vue-moment';
import store from '@/store';
import Buefy from 'buefy';
import VueRouter from 'vue-router';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);
localVue.use(VueMoment);

describe('EvaluateVersionItem.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(EvaluateVersionItem, {
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        id: 2,
        version: 2,
        language: 'pt',
        created_at: '2019-05-06T13:04:15.850503Z',
      },
      store,
    });
  });

  it('renders', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
