import { mount } from '@vue/test-utils';
import BasesFormGenericList from '@/views/repository/content/BasesFormGenericList.vue';
import { beforeEach } from 'vitest';

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

describe('BasesFormGenericList.vue', () => {
  let wrapper;

  const setup = ({ status, data, filterItem }, { stubs } = {}) =>
    mount(BasesFormGenericList, {
      props: {
        title: 'Title of the Generic List',
        description: 'Description of the Generic List',
        addText: 'Add more',
        items: {
          status: status || null,
          next: null,
          data: data || [],
        },
        canEditItem: false,
        shape: 'normal',
        filterItem,
      },

      global: {
        stubs,
      },
    });

  describe('when items status is null', () => {
    beforeEach(() => {
      wrapper = setup({ status: null });
    });

    describe('when the end of the list is showing', () => {
      beforeEach(() => {
        intersectionObserverCaller([{ isIntersecting: true }]);
      });

      it('emits load-more event', () => {
        expect(wrapper.emitted('load-more')).toHaveLength(1);
      });
    });
  });

  describe('when items status is not null', () => {
    beforeEach(() => {
      wrapper = setup({ status: 'complete' });
    });

    describe('when the end of the list is showing', () => {
      beforeEach(() => {
        intersectionObserverCaller([{ isIntersecting: true }]);
      });

      it('should not emit load-more event', () => {
        expect(wrapper.emitted()).not.toHaveProperty('load-more');
      });
    });
  });

  describe('when there is items', () => {
    const BasesFormFilesItem = {
      template: '<span />',
      props: {
        file: Object,
      },
    };

    beforeEach(() => {
      wrapper = setup(
        {
          status: 'complete',
          data: [
            createTextItem({ uuid: '1', name: 'Ana' }),
            createTextItem({ uuid: '2', name: 'Maria' }),
            createTextItem({ uuid: '3', name: 'Pedro' }),
            createTextItem({ uuid: '4', name: 'Marcos' }),
          ],
        },
        {
          stubs: {
            BasesFormFilesItem,
          },
        },
      );
    });

    it('should render all the items', () => {
      const all = wrapper.findAllComponents(BasesFormFilesItem);

      const names = all.map((item) => item.props('file')?.created_file_name);

      expect(names).toStrictEqual(['Ana', 'Maria', 'Pedro', 'Marcos']);
    });

    describe('when there is filter function', () => {
      const BasesFormFilesItem = {
        template: '<span />',
        props: {
          file: Object,
        },
      };

      beforeEach(() => {
        wrapper = setup(
          {
            status: 'complete',
            data: [
              createTextItem({ uuid: '1', name: 'Ana' }),
              createTextItem({ uuid: '2', name: 'Maria' }),
              createTextItem({ uuid: '3', name: 'Pedro' }),
              createTextItem({ uuid: '4', name: 'Marcos' }),
            ],
            filterItem: (item) => item.file_name?.toLowerCase().includes('ar'),
          },
          {
            stubs: {
              BasesFormFilesItem,
            },
          },
        );
      });

      it('should render the filtered items', () => {
        const all = wrapper.findAllComponents(BasesFormFilesItem);

        const names = all.map((item) => item.props('file')?.created_file_name);

        expect(names).toStrictEqual(['Maria', 'Marcos']);
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
});
