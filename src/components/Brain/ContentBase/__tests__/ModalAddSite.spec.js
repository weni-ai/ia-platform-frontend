import { mount } from '@vue/test-utils';
import ModalAddSite from '@/components/Brain/ContentBase/ModalAddSite.vue';
import nexusaiAPI from '@/api/nexusaiAPI.js';
import { createStore } from 'vuex';
import i18n from '@/utils/plugins/i18n.js';

vi.spyOn(
  nexusaiAPI.intelligences.contentBases.sites,
  'create',
).mockResolvedValue({
  data: {
    uuid: '1234',
  },
});

const store = createStore({
  state() {
    return {
      alert: null,
    };
  },
});

describe('ModalAddSite', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = mount(ModalAddSite, {
      props: {
        contentBaseUuid: 'testContentBaseUuid',
      },
      global: {
        plugins: [store],
      },
    });
  });

  it('should render modal with the correct title', () => {
    expect(wrapper.find('[data-test="site-input"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(
      i18n.global.t('content_bases.sites.add_site'),
    );
  });

  describe('when the user enters an invalid URL', () => {
    it('should not enable the finish button', async () => {
      const input = wrapper.findComponent('[data-test="site-input"]');

      await input.setValue('www.valid-url.com');
      expect(wrapper.vm.submitDisabled).toBe(false);

      await input.setValue('invalid-url');
      expect(wrapper.vm.submitDisabled).toBe(true);
    });

    it('should replace spaces on input site', async () => {
      const input = wrapper.findComponent('[data-test="site-input"]');

      await input.setValue(' www . valid - url . com ');
      wrapper.vm.onInput({ target: { value: ' www . valid - url . com ' } });

      expect(wrapper.vm.site).toBe('www.valid-url.com');
    });
  });

  describe('when the user enters a valid URL', () => {
    it('should enable the finish button', async () => {
      const input = wrapper.findComponent('[data-test="site-input"]');
      await input.setValue('www.valid-url.com');

      expect(wrapper.vm.submitDisabled).toBeFalsy();
    });

    it('should call the add site API and emit events correctly', async () => {
      const input = wrapper.findComponent('[data-test="site-input"]');
      await input.setValue('www.valid-url.com');

      const finishButton = wrapper.find('[data-test="finish-button"]');

      await finishButton.trigger('click');

      expect(
        nexusaiAPI.intelligences.contentBases.sites.create,
      ).toHaveBeenCalledWith({
        contentBaseUuid: 'testContentBaseUuid',
        link: 'https://www.valid-url.com',
      });

      expect(wrapper.emitted('addedSite')).toBeTruthy();
      expect(wrapper.emitted('addedSite')[0]).toEqual([
        {
          file: null,
          file_name: null,
          extension_file: 'site',
          uuid: '1234',
          created_file_name: 'https://www.valid-url.com',
          status: 'processing',
        },
        'testContentBaseUuid',
      ]);

      expect(store.state.alert).toEqual({
        type: 'success',
        text: i18n.global.t(
          'content_bases.sites.content_of_the_sites_has_been_added',
        ),
      });
    });
  });

  describe('when the add site API fails', () => {
    it('should set site status to "fail" and not emit addedSite event', async () => {
      vi.spyOn(
        nexusaiAPI.intelligences.contentBases.sites,
        'create',
      ).mockRejectedValue(new Error('API error'));

      const input = wrapper.findComponent('[data-test="site-input"]');
      await input.setValue('www.valid-url.com');

      const finishButton = wrapper.findComponent('[data-test="finish-button"]');
      await finishButton.trigger('click');

      expect(wrapper.emitted('addedSite')).toBeTruthy();
      expect(wrapper.emitted('addedSite')[0][0].status).toBe('fail');
    });
  });

  describe('when the cancel button is clicked', () => {
    it('should emit close event', async () => {
      const cancelButton = wrapper.find('[data-test="cancel-button"]');
      await cancelButton.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('normalizeURL', () => {
    it('should return the URL if it starts with https://', () => {
      const result = wrapper.vm.normalizeURL('https://example.com');
      expect(result).toBe('https://example.com');
    });

    it('should return the URL if it starts with http://', () => {
      const result = wrapper.vm.normalizeURL('http://example.com');
      expect(result).toBe('http://example.com');
    });

    it('should prepend https:// if the URL does not start with http:// or https://', () => {
      const result = wrapper.vm.normalizeURL('example.com');
      expect(result).toBe('https://example.com');
    });
  });
});
