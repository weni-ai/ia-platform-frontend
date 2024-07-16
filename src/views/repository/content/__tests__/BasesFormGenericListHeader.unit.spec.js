import { mount } from '@vue/test-utils';
import GenericListHeader from '@/views/repository/content/BasesFormGenericListHeader.vue';

const buttons = {
  'add more': '[data-test="add-more-button"]',
  'accordion expand': '[data-test="accordion-expand-button"]',
};

describe('BasesFormGenericListHeader.vue', () => {
  let wrapper;

  describe.each([
    {
      shape: 'normal',
      shouldHaveButton: 'add more',
      shouldNotHaveButton: 'accordion expand',
    },
    {
      shape: 'accordion',
      shouldHaveButton: 'accordion expand',
      shouldNotHaveButton: 'add more',
    },
  ])(
    `when header is $shape shape`,
    ({ shape, shouldHaveButton, shouldNotHaveButton }) => {
      beforeEach(() => {
        wrapper = mount(GenericListHeader, {
          props: {
            open: true,
            title: 'Title of the header',
            addText: 'Add more',
            shape,
          },
        });
      });

      it('shows title', () => {
        const title = wrapper.find('[data-test="title"]');

        expect(title.text()).toBe('Title of the header');
      });

      it(`should have ${shouldHaveButton} button`, () => {
        expect(wrapper.find(buttons[shouldHaveButton]).exists()).toBe(true);
      });

      it(`should not have ${shouldNotHaveButton} button`, () => {
        expect(wrapper.find(buttons[shouldNotHaveButton]).exists()).toBe(false);
      });
    },
  );

  describe("when header is 'normal' shape", () => {
    let addMoreButton;

    beforeEach(() => {
      wrapper = mount(GenericListHeader, {
        props: {
          open: true,
          title: 'Title of the header',
          addText: 'Add more',
          shape: 'normal',
        },
      });

      addMoreButton = wrapper.find(buttons['add more']);
    });

    describe('when user clicks on add more button', () => {
      it('emits add event', async () => {
        await addMoreButton.trigger('click');

        expect(wrapper.emitted('add')).toHaveLength(1);
      });
    });
  });

  describe("when header is 'accordion' shape", () => {
    const setup = ({ open } = { open: true }) => {
      return mount(GenericListHeader, {
        props: {
          open,
          title: 'Title of the header',
          shape: 'accordion',
        },
      });
    };

    describe('when user clicks on accordion expand button', () => {
      it('emits update:open event with false argument', async () => {
        wrapper = setup();

        await wrapper.find(buttons['accordion expand']).trigger('click');

        expect(wrapper.emitted('update:open')).toHaveLength(1);
        expect(wrapper.emitted('update:open')[0]).toEqual([false]);
      });
    });

    describe('when header is closed initially', () => {
      describe('when user clicks on accordion expand button', () => {
        it('emits update:open event with true argument', async () => {
          wrapper = setup({ open: false });

          await wrapper.find(buttons['accordion expand']).trigger('click');

          expect(wrapper.emitted('update:open')).toHaveLength(1);
          expect(wrapper.emitted('update:open')[0]).toEqual([true]);
        });
      });
    });
  });

  describe('when header has counter', () => {
    beforeEach(() => {
      wrapper = mount(GenericListHeader, {
        props: {
          open: true,
          title: 'Title of the header',
          counter: '8',
          addText: 'Add more',
          shape: 'normal',
        },
      });
    });

    it('shows title with counter', () => {
      const title = wrapper.find('[data-test="title"]');

      expect(title.text()).toBe('Title of the header (8)');
    });
  });

  describe('when header has hide toggle', () => {
    beforeEach(() => {
      wrapper = mount(GenericListHeader, {
        props: {
          open: false,
          title: 'Title of the header',
          shape: 'accordion',
          hideToggle: true,
        },
      });
    });

    it('hides accordion expand button', () => {
      const title = wrapper.find(buttons['accordion expand']);
      expect(title.exists()).toBe(false);
    });

    it('hides add more button', () => {
      const title = wrapper.find(buttons['add more']);
      expect(title.exists()).toBe(false);
    });
  });
});
