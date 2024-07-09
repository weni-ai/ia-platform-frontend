import { shallowMount, createLocalVue } from '@vue/test-utils';
import UserProfile from '../../../components/user/UserProfile';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('UserProfile.vue', () => {
  let wrapper;

  beforeAll(() => {
    global.runtimeVariables = {
      get: jest.fn().mockImplementation((key) => {
        const variables = {
          VUE_APP_BOTHUB_WEBAPP_BASE_URL: 'https://example.com/',
        };
        return variables[key];
      }),
    };
  });

  beforeEach(() => {
    wrapper = shallowMount(UserProfile, {
      localVue,
      propsData: {
        profile: {
          name: 'Name',
          nickname: 'nickname',
          locale: 'locale',
        },
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
