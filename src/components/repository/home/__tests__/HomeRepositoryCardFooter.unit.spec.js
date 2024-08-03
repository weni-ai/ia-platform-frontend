import { mount } from '@vue/test-utils';
import HomeRepositoryCardFooter from '@/components/repository/home/HomeRepositoryCardFooter.vue';

const setup = ({
  type,
  language,
  contentBasesLength,
  intents,
  languages,
  force,
} = {}) =>
  mount(HomeRepositoryCardFooter, {
    props: {
      type,
      language,
      contentBasesLength,
      intents,
      languages,
      force,
    },
  });

describe('HomeRepositoryCardFooter.vue', () => {
  let wrapper;

  describe('when the type prop is content-base', () => {
    it('should show the language', () => {
      wrapper = setup({
        type: 'content-base',
        language: 'en-us',
      });

      expect(wrapper.text()).toContain('en-us');
    });
  });

  describe('when the type prop is content-intelligence', () => {
    it('should show the content bases length', () => {
      wrapper = setup({
        type: 'content-intelligence',
        contentBasesLength: 3,
      });

      expect(wrapper.text()).toContain('3');
    });
  });

  describe('when the type prop is classification-intelligence', () => {
    beforeEach(() => {
      wrapper = setup({
        type: 'classification-intelligence',
        intents: new Array(123),
        languages: new Array(321),
        force: 48,
      });
    });

    it('should show the intents length', () => {
      expect(wrapper.text()).toContain('123');
    });

    it('should show the languages length', () => {
      expect(wrapper.text()).toContain('321');
    });

    it('should show the force percentage', () => {
      expect(wrapper.text()).toContain('48%');
    });
  });
});
