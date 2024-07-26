import { mount } from '@vue/test-utils';
import BarAddSite from '@/views/repository/content/BarAddSite.vue';
import { createStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';

const setup = () =>
  mount(BarAddSite, {
    props: {
      contentBaseUuid: '1234',
    },
    global: {
      plugins: [createStore()],
    },
  });

const elements = {
  addButton: '[data-test="add-button"]',
  addOneMoreSiteButton: '[data-test="add-one-more-site-button"]',
  siteInput: { name: 'UnnnicInput' },
  addForm: '[data-test="add-form"]',
};

const createRequest = vi
  .spyOn(nexusaiAPI.intelligences.contentBases.sites, 'create')
  .mockImplementation(({ link }) => {
    if (link.includes('with-error')) {
      throw new Error();
    }

    return {
      data: {
        uuid: '1',
        link,
      },
    };
  });

describe('BarAddSite.vue', () => {
  let wrapper;

  describe('when the component is initialized', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it('add button should be disabled', () => {
      const addButton = wrapper.find(elements.addButton);

      expect(addButton.isDisabled()).toBeTruthy();
    });

    it('should have only one site input', () => {
      expect(wrapper.findAllComponents(elements.siteInput)).toHaveLength(1);
    });
  });

  describe('when the user clicks on add one more site button', () => {
    beforeEach(() => {
      wrapper = setup();

      wrapper.find(elements.addOneMoreSiteButton).trigger('click');
    });

    it('should have two site inputs', () => {
      const siteInputs = wrapper.findAllComponents(elements.siteInput);

      expect(siteInputs).toHaveLength(2);
    });

    describe('when the user inserts valid URLs', () => {
      beforeEach(() => {
        const urls = ['https://site1.com', 'site2.com'];

        wrapper
          .findAllComponents(elements.siteInput)
          .forEach(async (siteInput, index) => {
            await siteInput.vm.$emit('update:modelValue', urls[index]);
          });
      });

      it('add button should not be disabled', () => {
        expect(wrapper.find(elements.addButton).isDisabled()).toBeFalsy();
      });

      describe('when the user submits the URLs', () => {
        beforeEach(async () => {
          await wrapper.find(elements.addForm).trigger('submit');
        });

        it('should emit addedSites with the added sites', () => {
          expect(wrapper.emitted('addedSites')).toContainEqual([
            [
              expect.objectContaining({
                created_file_name: 'https://site1.com',
                extension_file: 'site',
                status: 'processing',
                uuid: '1',
              }),
              expect.objectContaining({
                created_file_name: 'https://site2.com',
                extension_file: 'site',
                status: 'processing',
                uuid: '1',
              }),
            ],
            '1234',
          ]);
        });
      });

      describe('when the user submits the URLs and there is an API error', () => {
        beforeEach(async () => {
          createRequest.mockRejectedValueOnce();
          await wrapper.find(elements.addForm).trigger('submit');
        });

        it('should emit addedSites with the added sites and the failure status', () => {
          expect(wrapper.emitted('addedSites')).toContainEqual([
            [
              expect.objectContaining({
                created_file_name: 'https://site1.com',
                extension_file: 'site',
                status: 'fail',
              }),
              expect.objectContaining({
                created_file_name: 'https://site2.com',
                extension_file: 'site',
                status: 'processing',
                uuid: '1',
              }),
            ],
            '1234',
          ]);
        });
      });

      describe('when the user clicks on remove site input button', () => {
        beforeEach(() => {
          wrapper
            .findAllComponents(elements.siteInput)[0]
            .find('svg')
            .trigger('click');
        });

        it('should go back to having only one site input', () => {
          expect(wrapper.findAllComponents(elements.siteInput)).toHaveLength(1);
        });
      });
    });
  });

  describe('when the user inserts invalid URLs', () => {
    beforeEach(() => {
      wrapper = setup();

      const urls = ['https://site1'];

      wrapper
        .findAllComponents(elements.siteInput)
        .forEach(async (siteInput, index) => {
          await siteInput.vm.$emit('update:modelValue', urls[index]);
        });
    });

    it('add button should be disabled', () => {
      expect(wrapper.find(elements.addButton).isDisabled()).toBeTruthy();
    });
  });
});
