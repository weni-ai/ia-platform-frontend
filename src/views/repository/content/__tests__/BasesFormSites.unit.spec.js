import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import BasesFormSites from '@/views/repository/content/BasesFormSites.vue';
import nexusaiAPI from '@/api/nexusaiAPI';

const deleteRequest = vi
  .spyOn(nexusaiAPI.intelligences.contentBases.sites, 'delete')
  .mockResolvedValue({});

const generateItems = () => ({
  addItem: vi.fn(),
  removeItem: vi.fn(),
  loadNext: vi.fn(),
  next: null,
  status: null,
  data: [
    {
      uuid: '1',
      link: 'https://website.com/pathname1',
      status: 'uploaded',
      created_at: '2024-07-12T00:00:00.000000Z',
      extension_file: 'site',
      created_file_name: 'https://website.com/pathname1',
    },
    {
      uuid: '2',
      link: 'https://website.com/pathname2',
      status: 'uploaded',
      created_at: '2024-07-12T00:00:00.000000Z',
      extension_file: 'site',
      created_file_name: 'https://website.com/pathname2',
    },
    {
      uuid: '3',
      link: 'https://website.com/pathname3',
      status: 'uploaded',
      created_at: '2024-07-12T00:00:00.000000Z',
      extension_file: 'site',
      created_file_name: 'https://website.com/pathname3',
    },
  ],
});

const setup = ({ items }) =>
  mount(BasesFormSites, {
    props: {
      items,
    },
    global: {
      stubs: ['BarAddSite'],

      mocks: {
        $route: {
          params: {
            contentBaseUuid: '1234',
          },
        },
        $store: {
          state: {
            alert: null,
          },
        },
      },
    },
  });

describe('BasesFormSites.vue', () => {
  let wrapper;
  let items;

  beforeEach(() => {
    items = generateItems();

    wrapper = setup({
      items,
    });

    vi.clearAllMocks();
  });

  describe('when the component is initialized', () => {
    it('does not show modal remove site', () => {
      const modalDeleteSite = wrapper.find('[data-test="modal-remove-site"]');

      expect(modalDeleteSite.exists()).toBeFalsy();
    });
  });

  describe('when the user wants to add a site', () => {
    beforeEach(async () => {
      const listComponent = wrapper.findComponent({
        name: 'BasesFormGenericList',
      });

      listComponent.vm.$emit('add');
    });

    it('opens add bar', () => {
      const addBar = wrapper.findComponent({ name: 'BarAddSite' });

      expect(addBar.exists()).toBeTruthy();
    });

    describe('when the user inserted link', () => {
      beforeEach(() => {
        const addBar = wrapper.findComponent({ name: 'BarAddSite' });

        addBar.vm.$emit('addedSites', [
          {
            file: null,
            extension_file: 'site',
            uuid: '4',
            created_file_name: 'https://website.com/pathname4',
            status: 'uploaded',
            created_at: '2024-07-22T00:00:00.000000Z',
          },
        ]);
      });

      it('should call addItem method', () => {
        expect(items.addItem).toHaveBeenCalledWith(
          expect.objectContaining({
            uuid: '4',
            created_file_name: 'https://website.com/pathname4',
            extension_file: 'site',
            file: null,
            status: 'uploaded',
            created_at: '2024-07-22T00:00:00.000000Z',
          }),
        );
      });
    });
  });

  describe('when the user wants to remove a site', () => {
    let listComponent;

    beforeEach(() => {
      listComponent = wrapper.findComponent({
        name: 'BasesFormGenericList',
      });

      listComponent.vm.$emit('remove', generateItems().data[1]);
    });

    it('shows modal delete site', async () => {
      const modalRemoveSite = wrapper.find('[data-test="modal-remove-site"]');

      expect(modalRemoveSite.exists()).toBeTruthy();
    });

    describe('when the user confirms', () => {
      it('should request to remove the file', async () => {
        const buttonRemove = wrapper.find('[data-test="button-remove"]');

        buttonRemove.trigger('click');

        expect(deleteRequest).toHaveBeenCalledWith({
          contentBaseUuid: '1234',
          linkUuid: '2',
        });
      });
    });
  });

  describe('when the user wants to remove a file with error', () => {
    let items;

    beforeEach(() => {
      items = generateItems();

      items.data[1].status = 'fail';

      wrapper = setup({ items });
    });

    describe('when the user wants to remove a file', () => {
      let listComponent;

      beforeEach(() => {
        listComponent = wrapper.findComponent({
          name: 'BasesFormGenericList',
        });

        listComponent.vm.$emit('remove', items.data[1]);
      });

      it('should call the remove file', async () => {
        expect(items.removeItem).toHaveBeenCalledWith(
          expect.objectContaining({
            uuid: '2',
          }),
        );
      });
    });
  });
});
