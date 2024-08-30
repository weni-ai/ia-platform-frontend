import { mount } from '@vue/test-utils';
import ContentList from '@/components/Brain/ContentBase/ContentList.vue';
import ContentItem from '../ContentItem.vue';
import { beforeEach } from 'vitest';
import { ref } from 'vue';

function createTextItem({ uuid, name }) {
  return {
    file: null,
    extension_file: 'txt',
    uuid,
    created_file_name: name,
    status: 'uploaded',
    file_name: `${name}.txt`,
    created_at: '2024-07-04T00:00:00.000000Z',
  };
}

let intersectionObserverCaller;
let observedElement;
let unobservedElement;

global.IntersectionObserver = class {
  constructor(caller) {
    intersectionObserverCaller = caller;
  }

  observe(element) {
    observedElement = element;
  }

  unobserve(element) {
    unobservedElement = element;
  }

  disconnect() {}
};

describe('ContentList.vue', () => {
  let wrapper;

  const setup = ({ status, data, filterItem }) =>
    mount(ContentList, {
      props: {
        description: 'Description of the List',
        subDescription: 'Sub Description of the List',
        defaultIcon: 'icon-name',
        addText: 'Add More',
        items: {
          status: status || null,
          data: data || [],
        },
        canEditItem: false,
        shape: 'normal',
        filterItem,
      },
    });

  describe('when there are items', () => {
    beforeEach(() => {
      wrapper = setup({
        status: 'complete',
        data: ref([
          createTextItem({ uuid: '1', name: 'Ana' }),
          createTextItem({ uuid: '2', name: 'Maria' }),
          createTextItem({ uuid: '3', name: 'Pedro' }),
          createTextItem({ uuid: '4', name: 'Marcos' }),
        ]),
      });
    });

    it('should render all the items', () => {
      const all = wrapper.findAll('[data-test="name"]');
      const names = all.map((item) => item?.text());

      expect(names).toStrictEqual([
        'Ana.txt',
        'Maria.txt',
        'Pedro.txt',
        'Marcos.txt',
      ]);
    });

    describe('when there is a filter function', () => {
      it('should render the filtered items', async () => {
        const searchInput = wrapper.findAllComponents('.search-input')[2];

        await searchInput.setValue('ar');

        await wrapper.vm.$nextTick();

        const all = wrapper.findAll('[data-test="name"]');

        const names = all.map((item) => item.text());

        expect(names).toStrictEqual(['Maria.txt', 'Marcos.txt']);
      });
    });
  });

  describe('when the component is unmounted', () => {
    beforeEach(() => {
      wrapper = setup({ status: null });

      wrapper.unmount();
    });

    it('should unobserve the observed element', () => {
      expect(unobservedElement).toBe(observedElement);
    });
  });

  describe('when there are no items and status is complete', () => {
    beforeEach(() => {
      wrapper = setup({
        status: 'complete',
        data: [],
      });
    });

    it('should render the no list container', () => {
      const noListContainer = wrapper.find('.files-list__no_list_container');
      expect(noListContainer.exists()).toBe(true);
    });
  });

  describe('when the status is loading', () => {
    beforeEach(() => {
      wrapper = setup({
        status: 'loading',
      });
    });

    it('should render skeleton loading components', () => {
      const skeletons = wrapper.findAllComponents({
        name: 'UnnnicSkeletonLoading',
      });
      expect(skeletons.length).toBe(3);
    });
  });

  describe('when the filter text is provided', () => {
    beforeEach(() => {
      wrapper = setup(
        {
          status: 'complete',
          data: ref([
            createTextItem({ uuid: '1', name: 'Ana' }),
            createTextItem({ uuid: '2', name: 'Maria' }),
            createTextItem({ uuid: '3', name: 'Pedro' }),
            createTextItem({ uuid: '4', name: 'Marcos' }),
          ]),
        },
        {
          stubs: {
            ContentItem,
          },
        },
      );

      wrapper.vm.filterText = 'ma';
      wrapper.vm.$nextTick();
    });

    it('should update the filtered items based on filter text', () => {
      const all = wrapper.findAll('[data-test="name"]');

      const names = all.map((item) => item?.text());

      expect(names).toStrictEqual(['Maria.txt', 'Marcos.txt']);
    });
  });

  describe('when the component is mounted', () => {
    beforeEach(() => {
      wrapper = setup({ status: 'diff', data: ref([]) });

      intersectionObserverCaller([{ isIntersecting: true }]);
    });

    it('should observe endOfListElement with IntersectionObserver', () => {
      expect(observedElement).toBe(wrapper.vm.endOfListElement);
    });

    it('should set isShowingEndOfList to true when endOfListElement is intersecting', () => {
      expect(wrapper.vm.isShowingEndOfList).toBe(true);
    });
  });

  describe('when isShowingEndOfList is true and status is null', () => {
    let loadNextMock;

    beforeEach(async () => {
      loadNextMock = vi.fn();

      wrapper = setup({
        status: null,
        data: ref([
          createTextItem({ uuid: '1', name: 'Ana' }),
          createTextItem({ uuid: '2', name: 'Maria' }),
          createTextItem({ uuid: '3', name: 'Pedro' }),
          createTextItem({ uuid: '4', name: 'Marcos' }),
        ]),
      });

      wrapper.vm.$props.items.loadNext = loadNextMock;

      intersectionObserverCaller([{ isIntersecting: true }]);

      await wrapper.vm.$nextTick();
    });

    afterEach(() => {
      loadNextMock.mockRestore();
    });

    it('should call loadNext', () => {
      expect(loadNextMock).toHaveBeenCalled();
    });
  });

  describe('setup function', () => {
    beforeEach(() => {
      wrapper = setup({
        status: 'complete',
        data: ref([
          createTextItem({ uuid: '1', name: 'Ana' }),
          createTextItem({ uuid: '2', name: 'Maria' }),
        ]),
      });
    });

    it('should initialize filterText correctly', () => {
      expect(wrapper.vm.filterText).toBe('');
    });

    it('should initialize endOfListElement correctly', () => {
      expect(wrapper.vm.endOfListElement).toBeTruthy();
    });

    it('should initialize isShowingEndOfList as false initially', () => {
      expect(wrapper.vm.isShowingEndOfList).toBe(false);
    });
  });

  describe('onMounted lifecycle hook', () => {
    let observeSpy;
    let intersectionObserverMock;

    beforeEach(() => {
      observeSpy = vi.fn();
      intersectionObserverMock = vi.fn().mockImplementation((callback) => {
        return {
          observe: observeSpy,
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
      });
      vi.spyOn(global, 'IntersectionObserver').mockImplementation(
        intersectionObserverMock,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create an IntersectionObserver and call observe on mounted', async () => {
      wrapper = setup({
        status: 'diff',
        data: ref([]),
      });

      await wrapper.vm.$nextTick();

      expect(global.IntersectionObserver).toHaveBeenCalled();

      expect(observeSpy).toHaveBeenCalled();

      const observedElement = observeSpy.mock.calls[0][0];
      expect(observedElement).toBe(wrapper.vm.endOfListElement);
    });
  });
});
