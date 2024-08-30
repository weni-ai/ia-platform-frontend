import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ContentSites from '@/components/Brain/ContentSites.vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import { useRoute } from 'vue-router';
import { createStore } from 'vuex';

const deleteRequest = vi
  .spyOn(nexusaiAPI.intelligences.contentBases.sites, 'delete')
  .mockResolvedValue({});

const generateItems = () => ({
  addItem: vi.fn(),
  removeItem: vi.fn(),
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
      status: 'fail-upload',
      created_at: '2024-07-12T00:00:00.000000Z',
      extension_file: 'site',
      created_file_name: 'https://website.com/pathname3',
    },
  ],
});

const storeMock = createStore({
  state() {
    return {
      alert: null,
    };
  },
});

const setup = (items) =>
  mount(ContentSites, {
    props: {
      items,
      shape: 'accordion',
    },
    global: {
      plugins: [storeMock],
      mocks: {
        $route: {
          params: {
            contentBaseUuid: '1234',
          },
        },
        $store: {
          state: {
            alert: null,
            router: {
              contentBaseUuid: '1234',
            },
          },
        },
      },
    },
  });

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('ContentSites.vue', () => {
  let wrapper;
  let items;

  beforeEach(() => {
    useRoute.mockImplementationOnce(() => ({
      name: 'router-personalization',
      params: {
        contentBaseUuid: 'uuuid-01',
      },
    }));

    items = generateItems();
    wrapper = setup(items);
    vi.clearAllMocks();
  });

  describe('when initialized', () => {
    it('does not show add site modal', () => {
      const addSiteModal = wrapper.findComponent({ name: 'ModalAddSite' });
      expect(addSiteModal.exists()).toBeFalsy();
    });

    it('shows add site button when no sites are available', async () => {
      wrapper.setProps({ items: { ...items, data: [] }, shape: '' });
      await wrapper.vm.$nextTick();
      const addButton = wrapper.find('.sites__content__button-add-site');
      expect(addButton.exists()).toBeTruthy();
    });
  });

  describe('when the user wants to add a site', () => {
    it('opens add site modal on button click', async () => {
      wrapper.setProps({ items: { ...items, data: [] }, shape: '' });
      await wrapper.vm.$nextTick();
      const addButton = wrapper.find('.sites__content__button-add-site');
      await addButton.trigger('click');
      const addSiteModal = wrapper.findComponent({ name: 'ModalAddSite' });
      expect(addSiteModal.exists()).toBeTruthy();
    });
  });

  describe('when a site is added', () => {
    beforeEach(async () => {
      wrapper.vm.isAddSiteOpen = true;
      await wrapper.vm.$nextTick();
      const addSiteModal = wrapper.findComponent({ name: 'ModalAddSite' });
      addSiteModal.vm.$emit('added-site', {
        uuid: '4',
        created_file_name: 'https://website.com/pathname4',
        status: 'uploaded',
      });
    });

    it('should call addItem method', () => {
      expect(items.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: '4',
          created_file_name: 'https://website.com/pathname4',
        }),
      );
    });
  });

  describe('when the user wants to remove a site', () => {
    beforeEach(() => {
      wrapper.vm.openDeleteSite('2', 'https://website.com/pathname2');
    });

    it('shows modal delete site', async () => {
      const modalRemoveSite = wrapper.find('[data-test="modal-remove-site"]');
      expect(modalRemoveSite.exists()).toBeTruthy();
    });

    describe('when the user confirms removal', () => {
      it('should request to remove the file', async () => {
        const buttonRemove = wrapper.find('[data-test="button-remove"]');
        await buttonRemove.trigger('click');
        expect(
          nexusaiAPI.intelligences.contentBases.sites.delete,
        ).toHaveBeenCalledWith({
          contentBaseUuid: 'uuuid-01',
          linkUuid: '2',
        });
      });

      it('removes the site from the items list', async () => {
        wrapper.vm.onRemove(items.data[2]);
        const buttonRemove = wrapper.find('[data-test="button-remove"]');
        await buttonRemove.trigger('click');
        expect(deleteRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            contentBaseUuid: 'uuuid-01',
            linkUuid: '2',
          }),
        );
      });
    });
  });

  describe('when the user wants to remove a file with an error status', () => {
    beforeEach(() => {
      wrapper.vm.onRemove(items.data[2]);
    });

    it('should call removeItem directly for files with error status', () => {
      expect(items.removeItem).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: '3' }),
      );
    });
  });

  describe('modal interaction and Vuex alert state', () => {
    it('should update Vuex alert state when a site is removed', async () => {
      wrapper.vm.onRemove(items.data[2]);
      wrapper.vm.openDeleteSite('1', 'https://website.com/pathname1');
      await wrapper.vm.$nextTick();
      const buttonRemove = wrapper.find('[data-test="button-remove"]');
      await buttonRemove.trigger('click');
      await wrapper.vm.$nextTick();

      expect(storeMock.state.alert).toEqual({
        type: 'default',
        text: expect.any(String),
      });
    });

    it('should close modal after removing a site', async () => {
      wrapper.vm.onRemove(items.data[2]);
      wrapper.vm.openDeleteSite('1', 'https://website.com/pathname1');
      await wrapper.vm.$nextTick();
      const buttonRemove = wrapper.find('[data-test="button-remove"]');
      await buttonRemove.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.modalDeleteSite).toBeNull();
    });
  });

  describe('closeAddSite', () => {
    it('closes the add site modal', async () => {
      wrapper.vm.isAddSiteOpen = true;
      wrapper.vm.closeAddSite();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isAddSiteOpen).toBe(false);
    });
  });

  describe('onRemove', () => {
    it('removes item directly if status is "fail-upload"', async () => {
      const failedItem = {
        uuid: '5',
        created_file_name: 'https://website.com/pathname5',
        status: 'fail-upload',
      };

      wrapper.vm.onRemove(failedItem);

      await wrapper.vm.$nextTick();

      expect(items.removeItem).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: '5' }),
      );
    });

    it('opens delete modal if status is not "fail-upload"', async () => {
      const successfulItem = {
        uuid: '6',
        created_file_name: 'https://website.com/pathname6',
        status: 'uploaded',
      };

      wrapper.vm.onRemove(successfulItem);

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.modalDeleteSite).contains({
        uuid: '6',
        name: 'https://website.com/pathname6',
      });
    });
  });

  describe('conditional behaviors', () => {
    it('does not show add site button when sites are available', async () => {
      wrapper.setProps({ items: { ...items, data: items.data }, shape: '' });
      await wrapper.vm.$nextTick();
      const addButton = wrapper.find('.sites__content__button-add-site');
      expect(addButton.exists()).toBeFalsy();
    });
  });

  describe('modal interaction', () => {
    it('closes delete modal when cancel button is clicked', async () => {
      wrapper.vm.onRemove(items.data[2]);
      wrapper.vm.openDeleteSite('1', 'https://website.com/pathname1');
      await wrapper.vm.$nextTick();

      const buttonCancel = wrapper.find('[data-test="button-cancel"]');
      await buttonCancel.trigger('click');

      expect(wrapper.vm.modalDeleteSite).toBeNull();
    });
  });

  describe('when there are no items and shape is not accordion', () => {
    it('renders empty content section with title and description', async () => {
      wrapper.setProps({
        items: { ...items, data: [] },
        shape: 'not-accordion',
      });
      await wrapper.vm.$nextTick();

      const emptyContent = wrapper.find('.sites__content--empty');
      expect(emptyContent.exists()).toBeTruthy();

      const titleText = emptyContent.find('[data-test="label-title"]');
      expect(titleText.text()).toBe(wrapper.vm.$t('content_bases.sites.title'));

      const descriptionText = wrapper.find('[data-test="label-description"]');

      expect(descriptionText.text()).toBe(
        wrapper.vm.$t('content_bases.sites.description'),
      );
    });

    it('renders add site button when there are no items', async () => {
      wrapper.setProps({
        items: { ...items, data: [] },
        shape: 'not-accordion',
      });
      await wrapper.vm.$nextTick();

      const addButton = wrapper.find('.sites__content__button-add-site');
      expect(addButton.exists()).toBeTruthy();
    });
  });

  describe('when items are available or shape is accordion', () => {
    it('renders ContentList with correct props', async () => {
      wrapper.setProps({ items: items, shape: 'accordion' });
      await wrapper.vm.$nextTick();

      const contentList = wrapper.findComponent({ name: 'ContentList' });
      expect(contentList.exists()).toBeTruthy();
      expect(contentList.props('items')).toEqual(items);
      expect(contentList.props('shape')).toBe('accordion');
      expect(contentList.props('description')).toBe(
        wrapper.vm.$t('content_bases.sites.title'),
      );
      expect(contentList.props('subDescription')).toBe(
        wrapper.vm.$t('content_bases.sites.description'),
      );
    });
  });

  describe('ModalAddSite interactions', () => {
    it('opens ModalAddSite when isAddSiteOpen is true', async () => {
      wrapper.vm.isAddSiteOpen = true;
      await wrapper.vm.$nextTick();

      const addSiteModal = wrapper.findComponent({ name: 'ModalAddSite' });
      expect(addSiteModal.exists()).toBeTruthy();
    });

    it('closes ModalAddSite when isAddSiteOpen is false', async () => {
      wrapper.vm.isAddSiteOpen = false;
      await wrapper.vm.$nextTick();

      const addSiteModal = wrapper.findComponent({ name: 'ModalAddSite' });
      expect(addSiteModal.exists()).toBeFalsy();
    });
  });
});
