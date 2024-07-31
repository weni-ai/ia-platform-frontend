import ClassificationSpecificAttributes from '@/components/repository/CreateRepository/ClassificationSpecificAttributes.vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';

const getAllCategories = vi.fn(() => ({
  data: [
    {
      id: 1,
      name: 'Category 1',
      icon: 'category1',
    },
    {
      id: 2,
      name: 'Category 2',
      icon: 'category2',
    },
  ],
}));

const store = createStore({
  actions: {
    getAllCategories,
  },
});

const setup = () =>
  mount(ClassificationSpecificAttributes, {
    props: {
      repositoryType: 'classifier',
      language: '',
      isPrivate: true,
      categories: [1],
    },

    global: {
      plugins: [store],
    },
  });

describe('ClassificationSpecificAttributes.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = setup();
  });

  it('should call get all categories action', () => {
    expect(getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should show all categories', async () => {
    await flushPromises();

    const categoryListText = wrapper
      .find('[data-test="categories-list"]')
      .text();

    expect(categoryListText).toContain('Category 1');
    expect(categoryListText).toContain('Category 2');
  });

  describe('when the user clicks a new category', () => {
    beforeEach(async () => {
      await flushPromises();
    });

    it('should emits the new categories list along with the addition', () => {
      wrapper.find('[data-test="category-2"]').trigger('click');

      expect(wrapper.emitted('update:categories')).toHaveLength(1);
      expect(wrapper.emitted('update:categories')[0]).toEqual([[1, 2]]);
    });
  });

  describe('when the user clicks on a category that is already inserted', () => {
    it('should emits the new categories list without the clicked item', () => {
      wrapper.find('[data-test="category-1"]').trigger('click');

      expect(wrapper.emitted('update:categories')).toHaveLength(1);
      expect(wrapper.emitted('update:categories')[0]).toEqual([[]]);
    });
  });

  describe.each([
    {
      card: 'set-as-private-card',
      expectedIsPrivate: true,
    },
    {
      card: 'set-as-public-card',
      expectedIsPrivate: false,
    },
  ])('when the user clicks on $card', ({ card, expectedIsPrivate }) => {
    it(`emits update:isPrivate ${expectedIsPrivate}`, () => {
      wrapper.find(`[data-test="${card}"]`).trigger('click');

      expect(wrapper.emitted('update:isPrivate')).toHaveLength(1);
      expect(wrapper.emitted('update:isPrivate')[0]).toEqual([
        expectedIsPrivate,
      ]);
    });
  });
});
