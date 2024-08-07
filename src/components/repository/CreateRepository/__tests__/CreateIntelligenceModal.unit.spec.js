import { config, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import CreateIntelligenceModal from '@/components/repository/CreateRepository/CreateIntelligenceModal.vue';
import i18n from '@/utils/plugins/i18n';
import repository from '@/api/v2/repository';

const createRequest = vi.spyOn(repository, 'create').mockResolvedValue({
  data: {
    owner__nickname: 'joe',
    slug: 'intelligence-of-joe',
  },
});

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  if (!config.global.plugins.includes(i18n)) {
    config.global.plugins.push(i18n);
  }
});

const mockRouter = {
  push: vi.fn(),
};

const store = createStore({
  state() {
    return {
      alert: null,
    };
  },

  getters: {
    getOrgSelected() {
      return '123';
    },
  },
});

const setup = () =>
  mount(CreateIntelligenceModal, {
    global: {
      plugins: [store],
      stubs: [
        'RouterLink',
        'IntelligenceTab',
        'ClassificationSpecificAttributes',
      ],
      mocks: {
        $t: (key) => key,
        $router: mockRouter,
      },
    },
  });

const elements = {
  unnnicModalDialog: { name: 'UnnnicModalDialog' },
  createIntelligenceCancelModal: { name: 'CreateIntelligenceCancelModal' },
  intelligenceTabComponent: { name: 'IntelligenceTab' },
  classificationSpecificAttributesComponent: {
    name: 'ClassificationSpecificAttributes',
  },
  submitButton: '[data-test="submit-button"]',
  cancelButton: '[data-test="cancel-button"]',
};

describe('CreateIntelligenceModal.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = setup();
  });

  it('should pass the correct props to UnnnicModalDialog', () => {
    expect(wrapper.findComponent(elements.unnnicModalDialog).props()).toEqual(
      expect.objectContaining({
        modelValue: true,
        persistent: false,
        size: 'md',
        title: 'webapp.create_repository.intelligence',
        showCloseIcon: true,
        showActionsDivider: false,
        primaryButtonProps: expect.objectContaining({
          text: 'webapp.create_repository.create_intelligence_button',
          'data-test': 'submit-button',
        }),
        secondaryButtonProps: expect.objectContaining({
          text: 'webapp.create_repository.cancel_create_intelligence_button',
          'data-test': 'cancel-button',
        }),
      }),
    );
  });

  it('create intelligence button should be disabled', () => {
    expect(wrapper.find(elements.submitButton).isDisabled()).toBeTruthy();
  });

  describe('when the user try to close create intelligence modal', () => {
    it('emits close event', () => {
      wrapper.find(elements.cancelButton).trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('when the user fills name, description, language and categories', () => {
    beforeEach(() => {
      const intelligenceTab = wrapper.findComponent(
        elements.intelligenceTabComponent,
      );

      const classificationSpecificAttributes = wrapper.findComponent(
        elements.classificationSpecificAttributesComponent,
      );

      intelligenceTab.vm.$emit('update:name', 'Intelligence Name');

      intelligenceTab.vm.$emit(
        'update:description',
        'Intelligence Description',
      );

      classificationSpecificAttributes.vm.$emit('update:language', 'en');

      classificationSpecificAttributes.vm.$emit('update:categories', [1, 2]);
    });

    it('create intelligence button should not be disabled', () => {
      expect(wrapper.find(elements.submitButton).isDisabled()).toBeFalsy();
    });

    describe('when the user create intelligence', () => {
      beforeEach(() => {
        wrapper.find(elements.submitButton).trigger('click');
      });

      it('should call create intelligence API', () => {
        expect(createRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Intelligence Name',
            description: 'Intelligence Description',
            categories: [1, 2],
            is_private: true,
            language: 'en',
            repository_type: 'classifier',
            organization: '123',
          }),
        );
      });

      it('should redirects to classification home page', () => {
        expect(mockRouter.push).toHaveBeenCalledTimes(1);

        expect(mockRouter.push).toHaveBeenCalledWith({
          path: '/dashboard/joe/intelligence-of-joe/',
        });
      });
    });

    describe('when the user create intelligence but there is a request error', () => {
      beforeEach(() => {
        createRequest.mockRejectedValueOnce({
          response: { data: { detail: 'error trying to create intelligence' } },
        });

        wrapper.find(elements.submitButton).trigger('click');
      });

      it('should show alert message to the user', () => {
        expect(store.state.alert).toEqual(
          expect.objectContaining({
            type: 'error',
            text: 'error trying to create intelligence',
          }),
        );
      });
    });

    describe('when the user change the intelligence type to content', () => {
      beforeEach(() => {
        wrapper
          .findComponent(elements.intelligenceTabComponent)
          .vm.$emit('update:repositoryType', 'content');
      });

      it('create intelligence button should be disabled', () => {
        expect(wrapper.find(elements.submitButton).isDisabled()).toBeTruthy();
      });

      describe('when the user try to close create intelligence modal', () => {
        it('emits close event', () => {
          wrapper.find(elements.cancelButton).trigger('click');

          expect(wrapper.emitted('close')).toHaveLength(1);
        });
      });
    });

    it('should not show create intelligence cancel modal', () => {
      expect(
        wrapper.findComponent(elements.createIntelligenceCancelModal).exists(),
      ).toBeFalsy();
    });

    describe('when the user try to close create intelligence modal', () => {
      let createIntelligenceCancelModal;

      beforeEach(async () => {
        await wrapper.find(elements.cancelButton).trigger('click');

        createIntelligenceCancelModal = wrapper.findComponent(
          elements.createIntelligenceCancelModal,
        );
      });

      it('should show create intelligence cancel modal', () => {
        expect(createIntelligenceCancelModal.exists()).toBeTruthy();
      });

      describe('when the create intelligence cancel modal emits close event', () => {
        it('should not show create intelligence cancel modal', async () => {
          await createIntelligenceCancelModal.vm.$emit('close');

          expect(createIntelligenceCancelModal.exists()).toBeFalsy();
        });
      });

      describe('when the create intelligence cancel modal emits cancel create intelligence', () => {
        it('emits close event', () => {
          createIntelligenceCancelModal.vm.$emit('cancelCreateIntelligence');

          expect(wrapper.emitted('close')).toHaveLength(1);
        });
      });
    });
  });
});
