import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStore } from 'vuex';
import { nextTick } from 'vue';
import Unnnic from '@weni/unnnic-system';

import ModalAddContent from '../index.vue';
import i18n from '@/utils/plugins/i18n';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      read: vi.fn(() =>
        Promise.resolve({ data: { uuid: 'mock-content-base-uuid' } }),
      ),
    },
    intelligences: {
      contentBases: {
        sites: {
          create: vi.fn(() =>
            Promise.resolve({ data: { uuid: 'mock-site-uuid' } }),
          ),
        },
        texts: {
          create: vi.fn(() => Promise.resolve({ data: { text: 'mock-text' } })),
          edit: vi.fn(() =>
            Promise.resolve({ data: { text: 'updated-text' } }),
          ),
        },
      },
    },
  },
}));

const store = createStore({
  state() {
    return {
      router: { contentBaseUuid: '' },
      Auth: { connectProjectUuid: 'mock-project-uuid' },
      Brain: { contentText: { uuid: null, current: '' } },
      alert: {},
    };
  },
});

const createWrapper = (props = {}) => {
  return shallowMount(ModalAddContent, {
    props: {
      modelValue: true,
      ...props,
    },

    global: {
      stubs: {
        UnnnicModalDialog: Unnnic.unnnicModalDialog,
        UnnnicTab: Unnnic.unnnicTab,
      },
      plugins: [store],
    },
  });
};

describe('ModalAddContent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const modalAddContent = () =>
    wrapper.findComponent('[data-testid="modal-add-content"]');
  const tabs = () => wrapper.findComponent('[data-testid="tabs"]');
  const tabSites = () => wrapper.findComponent('[data-testid="tab-sites"]');
  const tabFiles = () => wrapper.findComponent('[data-testid="tab-files"]');
  const tabText = () => wrapper.find('[data-testid="tab-text"]');

  it('renders correctly with initial props', () => {
    expect(modalAddContent().exists()).toBe(true);
    expect(wrapper.find('[data-testid="tabs"]').exists()).toBe(true);
  });

  it('renders tabs correctly', async () => {
    expect(tabs().exists()).toBe(true);
    expect(tabSites().exists()).toBe(true);
    expect(tabFiles().exists()).toBe(true);
    expect(tabText().exists()).toBe(true);
  });

  it('switches tabs correctly', async () => {
    tabs().vm.$emit('change', 'sites');
    await nextTick();

    expect(tabSites().isVisible()).toBe(true);
  });

  it('disables save button when no content is provided', () => {
    expect(modalAddContent().props('primaryButtonProps')).toMatchObject({
      disabled: true,
    });
  });

  it('closes modal on cancel button click', async () => {
    modalAddContent().vm.$emit('secondary-button-click');

    await nextTick();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
  });

  it('closes modal on UnnnicModalDialog emits update:modelValue', async () => {
    modalAddContent().vm.$emit('update:modelValue', false);

    await nextTick();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
  });

  it('calls saveContents on save button click', async () => {
    wrapper.vm.contents.text = 'Test content';
    modalAddContent().vm.$emit('primary-button-click');
    await nextTick();
    expect(wrapper.vm.isSavingContents).toBe(true);
  });

  it('enables save button when text area has content', async () => {
    tabs().vm.$emit('change', 'text');
    wrapper.vm.contents.text = 'Test content';
    await nextTick();

    expect(modalAddContent().props('primaryButtonProps')).toMatchObject({
      disabled: false,
    });
  });

  it('shows correct text area placeholder', () => {
    expect(tabText().attributes('placeholder')).toBe(
      i18n.global.t('content_bases.write_content_placeholder'),
    );
  });

  describe('tabs events', () => {
    it('emits update:model-value when files tab is updated', async () => {
      wrapper.vm.activeTab = 'files';
      await tabFiles().vm.$emit('update:model-value', ['file1', 'file2']);

      expect(wrapper.vm.contents.files).toEqual(['file1', 'file2']);
    });

    it('emits update:model-value when sites tab is updated', async () => {
      wrapper.vm.activeTab = 'sites';
      await tabSites().vm.$emit('update:model-value', ['https://site1.com']);

      expect(wrapper.vm.contents.sites).toEqual(['https://site1.com']);
    });

    it('emits input event when text tab is updated', async () => {
      wrapper.vm.activeTab = 'text';
      await tabText().setValue('Hello World!');
      await tabText().trigger('input');

      expect(wrapper.vm.contents.text).toBe('Hello World!');
    });
  });

  describe('saveSitesContent', () => {
    it('returns early when sites array is empty', async () => {
      wrapper.vm.contents.sites = [];
      const result = await wrapper.vm.saveSitesContent();
      expect(result).toEqual(undefined);
    });

    it('calls nexusaiAPI.intelligences.contentBases.sites.create for each site', async () => {
      const sites = ['https://site1.com', 'https://site2.net'];
      wrapper.vm.contents.sites = sites;
      await wrapper.vm.saveSitesContent();

      expect(
        nexusaiAPI.intelligences.contentBases.sites.create,
      ).toHaveBeenNthCalledWith(1, {
        contentBaseUuid: wrapper.vm.contentBaseUuid,
        link: sites[0],
      });
      expect(
        nexusaiAPI.intelligences.contentBases.sites.create,
      ).toHaveBeenNthCalledWith(2, {
        contentBaseUuid: wrapper.vm.contentBaseUuid,
        link: sites[1],
      });
    });
  });

  describe('saveTextContent', () => {
    it('returns early when text is empty', async () => {
      wrapper.vm.contents.text = '';
      const result = await wrapper.vm.saveTextContent();
      expect(result).toEqual(undefined);
    });

    it('calls create method when uuid is falsy', async () => {
      wrapper.vm.contents.text = 'Test content';
      await wrapper.vm.saveTextContent();

      expect(
        nexusaiAPI.intelligences.contentBases.texts.create,
      ).toHaveBeenCalledWith({
        contentBaseUuid: wrapper.vm.contentBaseUuid,
        text: 'Test content',
      });
    });

    it('calls edit method when uuid is truthy', async () => {
      store.state.Brain.contentText = {
        uuid: '1234',
        current: 'Test content',
      };
      wrapper.vm.contents.text = 'Test edited content';

      await wrapper.vm.saveTextContent();

      expect(
        nexusaiAPI.intelligences.contentBases.texts.edit,
      ).toHaveBeenCalledWith({
        contentBaseUuid: wrapper.vm.contentBaseUuid,
        contentBaseTextUuid: '1234',
        text: 'Test edited content',
      });
    });

    it('sets current text to new value when edit is successful', async () => {
      store.state.Brain.contentText = {
        uuid: '1234',
        current: 'Test content',
      };
      wrapper.vm.contents.text = 'Test edited content';

      await wrapper.vm.saveTextContent();

      expect(store.state.Brain.contentText.current).toBe('updated-text'); // Mocked nexusaiAPI before
    });
  });

  describe('saveContents', () => {
    it('close modal when files are present but no sites or text', async () => {
      wrapper.vm.contents.files = ['file1', 'file2'];
      wrapper.vm.contents.sites = [];
      wrapper.vm.contents.text = '';

      await wrapper.vm.saveContents();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });

    it('save site content when sites are present', async () => {
      wrapper.vm.contents.sites = ['https://site1.com'];

      await wrapper.vm.saveContents();

      expect(
        nexusaiAPI.intelligences.contentBases.sites.create,
      ).toHaveBeenCalledTimes(1);
    });

    it('calls saveTextContent when text is present', async () => {
      store.state.Brain.contentText = {
        uuid: null,
        current: '',
      };
      wrapper.vm.contents.text = 'Test content';

      await wrapper.vm.saveContents();

      expect(
        nexusaiAPI.intelligences.contentBases.texts.create,
      ).toHaveBeenCalledTimes(1);
    });

    it('renders success message when saveContents works', async () => {
      store.state.alert = {};
      wrapper.vm.contents.text = 'Test content';
      await wrapper.vm.saveContents();
      expect(store.state.alert).toEqual({
        text: i18n.global.t(
          'router.monitoring.modal_add_content.success_alert',
        ),
        type: 'success',
      });
    });
  });
});
