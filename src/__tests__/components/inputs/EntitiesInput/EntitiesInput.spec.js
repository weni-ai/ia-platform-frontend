import { mount, createLocalVue } from '@vue/test-utils';

import sinon from 'sinon';
import Buefy from 'buefy';

import EntitiesInput from '@/components/inputs/EntitiesInput';
import EntityForm from '@/components/inputs/EntitiesInput/EntityForm';

const localVue = createLocalVue();

localVue.use(Buefy);

describe('EntitiesInput.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(EntitiesInput, {
      localVue,
      mocks: {
        $t: () => 'Add entity for',
      },
      propsData: {
        repository: {},
        text: 'my name is douglas',
        availableAddLabel: true,
      },
      stubs: {
        EntityForm,
      },
    });
  });

  const findAddEntityButton = () =>
    wrapper.findComponent({ ref: 'addEntityBtn' });
  const addEntity = () => findAddEntityButton().find('button').trigger('click');

  it('add entity button is disabled when nothing is selected', () => {
    const btn = findAddEntityButton();

    expect(btn.exists()).toBe(true);
    expect(btn.text().includes('Add entity')).toBe(true);
    expect(btn.attributes('disabled')).toBe('disabled');
  });

  it('add entity button enables when some text is selected', () => {
    wrapper.setProps({
      text: '000aaaa000',
      textSelected: {
        start: 3,
        end: 7,
      },
    });

    const btn = findAddEntityButton();

    expect(btn.text()).toBe('Add entity for');
    expect(btn.attributes('disabled')).toBe('disabled');
  });

  it('adds an entity', () => {
    wrapper.setProps({
      text: '000aaaa000',
      textSelected: {
        start: 3,
        end: 7,
      },
    });

    const getEntitiesStub = sinon.stub();

    wrapper.setMethods({
      getEntities: getEntitiesStub,
    });

    addEntity();
    expect(getEntitiesStub.called).toBeDefined();
  });

  it('removes an entity', async () => {
    wrapper.setProps({
      text: '000aaaa000',
      textSelected: {
        start: 3,
        end: 7,
      },
    });

    wrapper.setMethods({
      getEntities: () =>
        Promise.resolve({
          next: () => Promise.resolve(),
          items: [
            {
              data: {
                label: 'lorem',
              },
            },
          ],
        }),
    });

    addEntity();

    await localVue.nextTick();
    await localVue.nextTick();
  });
});
