import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import SelectFlow from '../SelectFlow.vue';
import lodash from 'lodash';
import { createPinia, setActivePinia } from 'pinia';
import { Actions } from '@/api/nexus/Actions';
import { useActionsStore } from '@/store/Actions';

vi.spyOn(lodash, 'debounce').mockImplementation((fn) => fn);

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

const items = {
  status: ref(null),
  data: ref([
    { uuid: '123', name: 'Flow One' },
    { uuid: '456', name: 'Flow Two' },
    { uuid: '789', name: 'Flow Three' },
  ]),
  reset: vi.fn(),
  overwriteParams: vi.fn(),
  loadNext: vi.fn(),
};

const alreadyAddedAction = {
  uuid: '123',
  name: 'Action One',
  prompt: 'Action One Description',
  type: 'custom',
};

describe('SelectFlow.vue', () => {
  let wrapper;
  let flows;

  beforeEach(() => {
    setActivePinia(createPinia());

    wrapper = mount(SelectFlow, {
      props: {
        flowUuid: '',
        name: '',
        items,
      },

      global: {},
    });

    flows = wrapper.findAll('[data-test^="flow-"]');
  });

  describe('when the component is mounted', () => {
    it('should observe the enf of list element', () => {
      expect(observedElement).toBe(
        wrapper.find({ ref: 'endOfListElement' }).wrapperElement,
      );
    });
  });

  describe('when the component is unmounted', () => {
    beforeEach(() => {
      wrapper.unmount();
    });

    it('should unobserve the observed element', () => {
      expect(unobservedElement).toBe(observedElement);
    });
  });

  describe('when the user changes the filter input', () => {
    it('overwrites request params', async () => {
      const input = wrapper.findComponent('[data-test="filter-input"]');

      await input.vm.$emit('update:modelValue', 'Flow Name');

      expect(items.overwriteParams).toHaveBeenCalledWith({ name: 'Flow Name' });
    });
  });

  it('should render all flows', () => {
    expect(flows.length).toBe(3);

    expect(flows.map((flow) => flow.text())).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Flow One'),
        expect.stringContaining('Flow Two'),
        expect.stringContaining('Flow Three'),
      ]),
    );
  });

  describe('when the user wants to select a flow', () => {
    it('emits update:flowUuid and update:name', () => {
      const selectableFlow = flows.find((flow) => {
        return !flow.attributes('data-test').endsWith(alreadyAddedAction.uuid);
      });

      selectableFlow.trigger('click');

      expect(wrapper.emitted('update:flowUuid')).toContainEqual(['456']);
      expect(wrapper.emitted('update:name')).toContainEqual(['Flow Two']);
    });
  });

  describe('when the user wants to select an already added flow', () => {
    it('should not emit update:flowUuid and update:name', async () => {
      vi.spyOn(Actions, 'list').mockResolvedValue([alreadyAddedAction]);

      const actionsStore = useActionsStore();
      await actionsStore.load();

      const nonSelectableFlow = flows.find((flow) => {
        return flow.attributes('data-test').endsWith(alreadyAddedAction.uuid);
      });

      nonSelectableFlow.trigger('click');

      expect(wrapper.emitted()).not.toHaveProperty('update:flowUuid');
      expect(wrapper.emitted()).not.toHaveProperty('update:name');
    });
  });
});
