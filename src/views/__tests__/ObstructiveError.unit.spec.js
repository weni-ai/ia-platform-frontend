import { config, mount } from '@vue/test-utils';
import ObstructiveError from '@/views/ObstructiveError.vue';
import { createStore } from 'vuex';
import i18n from '@/utils/plugins/i18n';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  if (!config.global.plugins.includes(i18n)) {
    config.global.plugins.push(i18n);
  }
});

const store = createStore({
  state() {
    return {
      obstructiveError: 'default',
    };
  },
});

const setup = () =>
  mount(ObstructiveError, {
    global: {
      plugins: [store],

      mocks: {
        $t: (key) => key,
      },
    },
  });

describe('ObstructiveError.vue', () => {
  let wrapper;

  describe.each([{ type: 'default' }, { type: 'unauthorized' }])(
    'when the type is $type',
    ({ type }) => {
      beforeEach(() => {
        store.state.obstructiveError = type;

        wrapper = setup();
      });

      it('should show the specific title', () => {
        expect(wrapper.html()).toContain(`obstructive_error.${type}.title`);
      });

      it('should show the specific description', () => {
        expect(wrapper.html()).toContain(
          `obstructive_error.${type}.description`,
        );
      });
    },
  );

  describe('when the type is unknown', () => {
    beforeEach(() => {
      store.state.obstructiveError = 'unknown';

      wrapper = setup();
    });

    it('should show the default title', () => {
      expect(wrapper.html()).toContain('obstructive_error.default.title');
    });

    it('should show the default description', () => {
      expect(wrapper.html()).toContain('obstructive_error.default.description');
    });
  });
});
