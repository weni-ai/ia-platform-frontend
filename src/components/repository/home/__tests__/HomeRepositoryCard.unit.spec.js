import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard.vue';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';

const elements = {
  card: '[data-test="card"]',
  quickTestButton: '[data-test="quick-test-button"]',
  quickTestSidebar: { name: 'SideBarQuickTest' },
  contentBasesSidebar: { name: 'SideBarContentBases' },
  deleteContentIntelligenceModal: { name: 'ModalDeleteContentIntelligence' },
  classificationInfoModal: '[data-test="classification-info-modal"]',
  copyIntelligenceModal: '[data-test="copy-intelligence-modal"]',
  copyIntelligenceCancelButton: '[data-test="copy-intelligence-cancel-button"]',
  copyIntelligenceActionButton: '[data-test="copy-intelligence-action-button"]',
  actionsDropdown: '[data-test="actions-dropdown"]',
  deleteBaseOption: '[data-test="Delete base"]',
  viewBasesOption: '[data-test="View bases"]',
  deleteIntelligenceOption: '[data-test="Delete Intelligence"]',
  viewIntentsOption: '[data-test="View intentions"]',
  viewLanguagesOption: '[data-test="View languages"]',
  copyIntelligenceOption: '[data-test="Copy intelligence"]',
  integrateModal: { name: 'IntegrationModal' },
  integrateNotificationModal: { name: 'IntegrateNotification' },
  integrateButton: { name: 'IntegrateButton' },
  integratedCheckIcon: '[class*="icon-integrated"]',
};

const mockRoute = {
  params: {
    intelligenceUuid: 'abcd',
  },
};

const mockRouter = {
  push: vi.fn(),
};

const mockCloneRepository = vi.fn();

const store = createStore({
  getters: {
    getProjectSelected() {
      return 'project-uuid';
    },

    getOrgSelected() {
      return '123';
    },
  },

  actions: {
    updateIntegratedProjects: vi.fn(),
    cloneRepository: mockCloneRepository,
  },
});

const setup = (props = {}) =>
  mount(HomeRepositoryCard, {
    props,

    global: {
      plugins: [store],

      mocks: {
        $route: mockRoute,
        $router: mockRouter,
      },

      stubs: {
        SideBarQuickTest: true,
        SideBarContentBases: true,
        ModalDeleteContentIntelligence: true,
        ModalContainer: true,
        IntegrationModal: true,
        teleport: true,
      },
    },
  });

const contentBaseProps = {
  type: 'content-base',
  uuid: '1234',
  name: 'Content Base Name',
  description: 'Content Base Description',
  language: 'en-us',
  canContribute: true,
};

const contentIntelligenceProps = {
  type: 'content-intelligence',
  uuid: '1234',
  name: 'Content Intelligence Name',
  description: 'Content Intelligence Description',
  contentBasesLength: 3,
};

const classificationIntelligenceProps = {
  type: 'classification-intelligence',
  uuid: '1234',
  name: 'Classification Intelligence Name',
  description: 'Classification Intelligence Description',
  defaultVersionId: 5678,
  force: 89,
  intents: [
    { value: 'First Intent', id: 1, examples__count: 2 },
    { value: 'Second Intent', id: 2, examples__count: 3 },
  ],
  languages: ['en-us', 'pt_br'],
  ownerNickname: 'Joe',
  slug: '1234-classification-intelligence',
};

describe('HomeRepositoryCard.vue', () => {
  let wrapper;

  describe('when the type prop is content-base', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      wrapper = setup(contentBaseProps);
    });

    describe('when the component is initialized', () => {
      it('should not show quick test sidebar', () => {
        expect(
          wrapper.findComponent(elements.quickTestSidebar).exists(),
        ).toBeFalsy();
      });
    });

    describe('when the user clicks on card', () => {
      it('redirects to content base edit', () => {
        wrapper.find(elements.card).trigger('click');

        expect(mockRouter.push).toHaveBeenCalledTimes(1);

        expect(mockRouter.push).toHaveBeenCalledWith({
          name: 'intelligence-content-base-edit',
          params: {
            contentBaseUuid: '1234',
            intelligenceUuid: 'abcd',
          },
        });
      });
    });

    describe('whe the user clicks on quick test button', () => {
      let quickTestSidebar;

      beforeEach(async () => {
        await wrapper.find(elements.quickTestButton).trigger('click');

        quickTestSidebar = wrapper.findComponent(elements.quickTestSidebar);
      });

      it('should open quick test sidebar', () => {
        expect(quickTestSidebar.exists()).toBeTruthy();
      });

      it('should pass the correct props to quick test sidebar', () => {
        expect(quickTestSidebar.props()).toEqual(
          expect.objectContaining({
            name: 'Content Base Name',
            repositoryUuid: '1234',
            repositoryLanguage: 'en-us',
          }),
        );
      });
    });

    describe('when the user clicks on action dropdown', () => {
      beforeEach(() => {
        wrapper.find(elements.actionsDropdown).trigger('click');
      });

      describe('when the user clicks on delete base option', () => {
        it('emits deleteBase event', () => {
          wrapper.find(elements.deleteBaseOption).trigger('click');

          const deleteBaseEmit = wrapper.emitted('deleteBase');

          expect(deleteBaseEmit).toHaveLength(1);
          expect(deleteBaseEmit[0]).toEqual([
            {
              name: 'Content Base Name',
              uuid: '1234',
            },
          ]);
        });
      });
    });
  });

  describe('when the type prop is content-intelligence', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      wrapper = setup(contentIntelligenceProps);
    });

    describe('when the component is initialized', () => {
      it('should not show content bases sidebar', () => {
        expect(
          wrapper.findComponent(elements.contentBasesSidebar).exists(),
        ).toBeFalsy();
      });

      it('should not show delete content intelligence modal', () => {
        expect(
          wrapper
            .findComponent(elements.deleteContentIntelligenceModal)
            .exists(),
        ).toBeFalsy();
      });
    });

    describe('when the user clicks on card', () => {
      it('redirects to content intelligence home page', () => {
        wrapper.find(elements.card).trigger('click');

        expect(mockRouter.push).toHaveBeenCalledTimes(1);

        expect(mockRouter.push).toHaveBeenCalledWith({
          name: 'intelligence-home',
          params: {
            intelligenceUuid: '1234',
          },
        });
      });
    });

    describe('when the user clicks on action dropdown', () => {
      beforeEach(() => {
        wrapper.find(elements.actionsDropdown).trigger('click');
      });

      describe('when the user clicks on view bases option', () => {
        let contentBasesSidebar;

        beforeEach(async () => {
          await wrapper.find(elements.viewBasesOption).trigger('click');

          contentBasesSidebar = wrapper.findComponent(
            elements.contentBasesSidebar,
          );
        });

        it('should open content bases sidebar', () => {
          expect(contentBasesSidebar.exists()).toBeTruthy();
        });

        it('should pass the correct props to content bases sidebar', () => {
          expect(contentBasesSidebar.props()).toEqual(
            expect.objectContaining({
              name: 'Content Intelligence Name',
              intelligenceUuid: '1234',
            }),
          );
        });
      });

      describe('when the user clicks on delete intelligence option', () => {
        let deleteContentIntelligenceModal;

        beforeEach(async () => {
          await wrapper
            .find(elements.deleteIntelligenceOption)
            .trigger('click');

          deleteContentIntelligenceModal = wrapper.findComponent(
            elements.deleteContentIntelligenceModal,
          );
        });

        it('should open delete content intelligence modal', () => {
          expect(deleteContentIntelligenceModal.exists()).toBeTruthy();
        });

        it('should pass the correct props to delete content intelligence modal', () => {
          expect(deleteContentIntelligenceModal.props()).toEqual(
            expect.objectContaining({
              name: 'Content Intelligence Name',
              uuid: '1234',
            }),
          );
        });
      });
    });
  });

  //

  describe('when the type prop is classification-intelligence', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      wrapper = setup(classificationIntelligenceProps);
    });

    describe('when the component is initialized', () => {
      it('should not show classification info modal', () => {
        expect(
          wrapper.findComponent(elements.classificationInfoModal).exists(),
        ).toBeFalsy();
      });
    });

    describe('when the user clicks on card', () => {
      it('redirects to classification intelligence home page', () => {
        wrapper.find(elements.card).trigger('click');

        expect(mockRouter.push).toHaveBeenCalledTimes(1);

        expect(mockRouter.push).toHaveBeenCalledWith(
          '/dashboard/Joe/1234-classification-intelligence/',
        );
      });
    });

    describe('when the user clicks on action dropdown', () => {
      beforeEach(() => {
        wrapper.find(elements.actionsDropdown).trigger('click');
      });

      describe.each([
        {
          option: elements.viewIntentsOption,
          expectedAttributes: expect.objectContaining({
            infoModal: expect.objectContaining({
              intents: [
                {
                  id: 1,
                  value: 'First Intent',
                  examples__count: 2,
                },
                {
                  id: 2,
                  value: 'Second Intent',
                  examples__count: 3,
                },
              ],
              ownerNickname: 'Joe',
              slug: '1234-classification-intelligence',
            }),
          }),
        },
        {
          option: elements.viewLanguagesOption,
          expectedAttributes: expect.objectContaining({
            infoModal: expect.objectContaining({
              languages: ['en-us', 'pt_br'],
            }),
          }),
        },
      ])(
        'when the user clicks on $option option',
        ({ option, expectedAttributes }) => {
          let classificationInfoModal;

          beforeEach(async () => {
            await wrapper.find(option).trigger('click');

            classificationInfoModal = wrapper.findComponent(
              elements.classificationInfoModal,
            );
          });

          it('should open classification info modal', () => {
            expect(classificationInfoModal.exists()).toBeTruthy();
          });

          it('should pass the correct props to classification info modal', () => {
            expect(classificationInfoModal.props()).toEqual(expectedAttributes);
          });
        },
      );

      it('should not show copy intelligence modal', () => {
        expect(
          wrapper.findComponent(elements.copyIntelligenceModal).exists(),
        ).toBeFalsy();
      });

      describe('when the user clicks on copy intelligence option', () => {
        let copyIntelligenceModal;

        beforeEach(async () => {
          await wrapper.find(elements.copyIntelligenceOption).trigger('click');

          copyIntelligenceModal = wrapper.findComponent(
            elements.copyIntelligenceModal,
          );
        });

        it('should show copy intelligence modal', () => {
          expect(copyIntelligenceModal.exists()).toBeTruthy();
        });

        describe('when the user clicks on cancel button', () => {
          it('should not show copy intelligence modal', async () => {
            await wrapper
              .find(elements.copyIntelligenceCancelButton)
              .trigger('click');

            expect(copyIntelligenceModal.exists()).toBeFalsy();
          });
        });

        describe('when the user clicks on action button', () => {
          let notificationModal;

          beforeEach(async () => {
            await wrapper
              .find(elements.copyIntelligenceActionButton)
              .trigger('click');

            notificationModal = wrapper.findComponent(
              elements.integrateNotificationModal,
            );
          });

          it('should not show copy intelligence modal', async () => {
            expect(copyIntelligenceModal.exists()).toBeFalsy();
          });

          it('should call clone repository action', () => {
            expect(mockCloneRepository).toHaveBeenCalledWith(
              expect.any(Object),
              {
                ownerId: 123,
                repositoryUUID: '1234',
              },
            );
          });

          it('should show integrate notification modal', () => {
            expect(notificationModal.exists()).toBeTruthy();
          });

          it('should pass the correct props to integrate modal', () => {
            expect(notificationModal.props()).toEqual(
              expect.objectContaining({
                message:
                  "The intelligence was successfully copied! You can find it in the Organization's Intelligences tab 😉",
                title: 'Copied intelligence!',
                type: 'success',
              }),
            );
          });
        });

        describe('when the user clicks on action button but the request has error', () => {
          let notificationModal;

          beforeEach(async () => {
            mockCloneRepository.mockRejectedValueOnce({
              response: { data: 'error trying to copy intelligence' },
            });

            await wrapper
              .find(elements.copyIntelligenceActionButton)
              .trigger('click');

            notificationModal = wrapper.findComponent(
              elements.integrateNotificationModal,
            );
          });

          it('should not show copy intelligence modal', async () => {
            expect(copyIntelligenceModal.exists()).toBeFalsy();
          });

          it('should show integrate notification modal', () => {
            expect(notificationModal.exists()).toBeTruthy();
          });

          it('should pass the correct props to integrate modal', () => {
            expect(notificationModal.props()).toEqual(
              expect.objectContaining({
                message: 'error trying to copy intelligence',
                title: 'Error copying intelligence',
                type: 'error',
              }),
            );
          });
        });
      });
    });
  });

  describe('when the classification intelligence is already integrated', () => {
    beforeEach(() => {
      localStorage.setItem(
        'in_project',
        JSON.stringify([
          {
            repository_uuid: classificationIntelligenceProps.uuid,
            repository_version:
              classificationIntelligenceProps.defaultVersionId,
            project_uuid: 'project-uuid',
            organization: '123',
          },
        ]),
      );

      vi.clearAllMocks();
      wrapper = setup(classificationIntelligenceProps);
    });

    it('should show integrated check icon', () => {
      expect(wrapper.find(elements.integratedCheckIcon).exists()).toBeTruthy();
    });
  });

  describe('when the classification intelligence is not integrated', () => {
    beforeEach(() => {
      localStorage.setItem('in_project', JSON.stringify([]));

      vi.clearAllMocks();
      wrapper = setup(classificationIntelligenceProps);
    });

    it('should not show integrate modal', () => {
      expect(
        wrapper.findComponent(elements.integrateModal).exists(),
      ).toBeFalsy();
    });

    it('should not show integrated check icon', () => {
      expect(wrapper.find(elements.integratedCheckIcon).exists()).toBeFalsy();
    });

    it('should show integrate button', () => {
      expect(
        wrapper.findComponent(elements.integrateButton).exists(),
      ).toBeTruthy();
    });

    describe('when the user clicks on integrate button', () => {
      let integrateModal;

      beforeEach(async () => {
        await wrapper.findComponent(elements.integrateButton).vm.$emit('click');

        integrateModal = wrapper.findComponent(elements.integrateModal);
      });

      it('should show integrate modal', () => {
        expect(integrateModal.exists()).toBeTruthy();
      });

      it('should pass the correct props to integrate modal', () => {
        expect(integrateModal.props()).toEqual(
          expect.objectContaining({
            repository: {
              uuid: '1234',
              name: 'Classification Intelligence Name',
              repository_version_id: 5678,
            },
            hasIntegration: false,
          }),
        );
      });

      describe('when the integrate modal emits dispatchUpdateIntegration with true value', () => {
        it('should not show integrated check icon', async () => {
          await integrateModal.vm.$emit('dispatchUpdateIntegration', true);

          expect(
            wrapper.find(elements.integratedCheckIcon).exists(),
          ).toBeTruthy();
        });
      });

      it('should not show integrate notification modal', () => {
        expect(
          wrapper.findComponent(elements.integrateNotificationModal).exists(),
        ).toBeFalsy();
      });

      describe.each([
        {
          status: 'success',
          expectedProps: {
            message: 'The Intelligence was successfully integrated 😉',
            title: 'Integrated intelligence',
            type: 'success',
          },
        },
        {
          status: 'error',
          expectedProps: {
            message: 'The Intelligence was not successfully integrated',
            title: 'Unable to integrate Intelligence',
            type: 'error',
          },
        },
      ])(
        'when the integrate modal emits dispatchIntegrationNotification with $status status',
        ({ status, expectedProps }) => {
          let integrateNotificationModal;

          beforeEach(async () => {
            await integrateModal.vm.$emit(
              'dispatchIntegrationNotification',
              status,
            );

            integrateNotificationModal = wrapper.findComponent(
              elements.integrateNotificationModal,
            );
          });

          it('should show integrate notification modal', () => {
            expect(integrateNotificationModal.exists()).toBeTruthy();
          });

          it('should pass the correct props to integrate modal', () => {
            expect(integrateNotificationModal.props()).toEqual(
              expect.objectContaining(expectedProps),
            );
          });
        },
      );
    });
  });
});
