<template>
  <section
    data-test="card"
    :class="['unnnic-card-intelligence', `unnnic-card-intelligence--${type}`]"
    @click.prevent.stop="repositoryDetailsRouterParams"
  >
    <header class="unnnic-card-intelligence__header">
      <section class="unnnic-card-intelligence__header__title">
        {{ name }}
      </section>

      <section class="unnnic-card-intelligence__header__buttons">
        <template
          v-if="
            type === 'classification-intelligence' &&
            hasIntegrationDefined &&
            !hasIntegrationCheckError
          "
        >
          <UnnnicIcon
            v-if="hasIntegration"
            icon="check"
            scheme="weni-600"
            class="unnnic-card-intelligence__header__buttons__icon-integrated"
          />

          <IntegrateButton
            v-else
            @click="changeIntegrateModalState(true)"
          />
        </template>

        <UnnnicToolTip
          v-else-if="type === 'content-base'"
          side="top"
          :text="$t('content_bases.quick_test')"
          enabled
        >
          <UnnnicButton
            iconCenter="mode_comment"
            size="small"
            class="button-quick-test"
            type="alternative"
            data-test="quick-test-button"
            @click.stop="isQuickTestOpen = true"
          />
        </UnnnicToolTip>

        <button
          class="unnnic-card-intelligence__header__buttons__more-actions"
          @click.stop
        >
          <DropdownActions
            v-if="actions.length"
            data-test="actions-dropdown"
            :actions="actions"
          />
        </button>
      </section>
    </header>

    <UnnnicIntelligenceText
      tag="p"
      color="neutral-dark"
      family="secondary"
      size="body-gt"
      class="unnnic-card-intelligence__description"
    >
      {{ description }}
    </UnnnicIntelligenceText>

    <UnnnicDivider
      ySpacing="xs"
      scheme="neutral-lightest"
    />

    <HomeRepositoryCardFooter
      :type="type"
      :language="language"
      :contentBasesLength="contentBasesLength"
      :intents="intents"
      :languages="languages"
      :force="force"
    />
  </section>

  <IntegrationModal
    v-if="integrateModal"
    :openModal="integrateModal"
    :repository="getCurrentRepository"
    :hasIntegration="hasIntegration"
    @close-integratation-modal="changeIntegrateModalState(false)"
    @dispatch-update-integration="changeIntegrationValue($event)"
    @dispatch-integration-notification="showIntegrationNotification"
  />

  <UnnnicModal
    v-if="openConfirmModal"
    data-test="copy-intelligence-modal"
    :showModal="openConfirmModal"
    :text="
      $t('webapp.intelligences_lib.clone.confirm_modal_title', {
        intelligence: selectedIntelligence,
      })
    "
    scheme="feedback-yellow"
    modalIcon="alert-circle-1"
    @close="openConfirmModal = false"
  >
    <template #message>
      <span
        v-html="$t('webapp.intelligences_lib.clone.confirm_modal_message')"
      />
    </template>
    <template #options>
      <UnnnicButton
        type="tertiary"
        data-test="copy-intelligence-cancel-button"
        @click="openConfirmModal = false"
      >
        {{ $t('webapp.home.cancel') }}
      </UnnnicButton>
      <UnnnicButton
        type="secondary"
        data-test="copy-intelligence-action-button"
        @click="copyIntelligence()"
      >
        {{ $t('webapp.intelligences_lib.clone.copy') }}
      </UnnnicButton>
    </template>
  </UnnnicModal>

  <IntegrateNotification
    v-if="openNotificationModal"
    :title="notificationModalTitle"
    :type="notificationModalType"
    :message="notificationModalMessage"
    @close="openNotificationModal = false"
  />

  <SideBarContentBases
    v-if="isViewBasesOpen"
    :name="name"
    :intelligenceUuid="uuid"
    @close="isViewBasesOpen = false"
  />

  <SideBarQuickTest
    v-if="isQuickTestOpen"
    :name="name"
    :repositoryUuid="uuid"
    :repositoryLanguage="language"
    @close="isQuickTestOpen = false"
  />

  <ModalDeleteContentIntelligence
    v-if="isDeleteIntelligenceConfirmationOpen"
    :uuid="uuid"
    :name="name"
    @close="isDeleteIntelligenceConfirmationOpen = false"
    @removed="$emit('removed')"
  />

  <ModalContainer
    v-if="openModal"
    data-test="classification-info-modal"
    :infoModal="modalInfo"
    :showModal="openModal"
    @close-modal="openModal = false"
  >
  </ModalContainer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import IntegrationModal from '@/components/shared/IntegrationModal.vue';
import IntegrateButton from '@/components/repository/IntegrateButton.vue';
import IntegrateNotification from '@/components/repository/IntegrateNotification.vue';
import SideBarContentBases from './SideBarContentBases.vue';
import SideBarQuickTest from './SideBarQuickTest.vue';
import DropdownActions from '@/views/repository/content/ContentItemActions.vue';
import HomeRepositoryCardFooter from '@/components/repository/home/HomeRepositoryCardFooter.vue';
import ModalContainer from '@/components/repository/home/ModalContainer.vue';
import ModalDeleteContentIntelligence from './ModalDeleteContentIntelligence.vue';

export default {
  name: 'HomeRepositoryCard',
  components: {
    IntegrationModal,
    SideBarContentBases,
    SideBarQuickTest,
    IntegrateButton,
    IntegrateNotification,
    DropdownActions,
    HomeRepositoryCardFooter,
    ModalContainer,
    ModalDeleteContentIntelligence,
  },
  props: {
    type: {
      type: String,
      required: true,
    },

    uuid: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      default: '',
    },

    contentBasesLength: {
      type: Number,
      default: 0,
    },

    intents: {
      type: Array,
      default() {
        return [];
      },
    },

    languages: {
      type: Array,
      default() {
        return [];
      },
    },

    force: {
      type: Number,
      default: 0,
    },

    defaultVersionId: {
      type: Number,
      default: 0,
    },

    slug: {
      type: String,
      default: '',
    },

    ownerNickname: {
      type: String,
      default: '',
    },

    isPrivate: Boolean,
    canContribute: Boolean,
  },

  emits: ['removed', 'deleteBase'],

  data() {
    return {
      integrateModal: false,
      hasIntegration: null,
      integrationError: null,
      openSuccessModal: false,
      openConfirmModal: false,
      openNotificationModal: false,
      notificationModalTitle: '',
      notificationModalType: '',
      notificationModalMessage: '',
      selectedIntelligence: '',
      isViewBasesOpen: false,
      isQuickTestOpen: false,
      isDeleteIntelligenceConfirmationOpen: false,
      deletingIntelligence: false,

      modalInfo: {},
      openModal: false,
    };
  },

  computed: {
    actions() {
      const actions = [];

      if (this.type === 'classification-intelligence') {
        actions.push({
          scheme: 'neutral-dark',
          icon: 'graph-stats-1',
          text: this.$tc(
            'webapp.intelligences_lib.show_intents',
            this.intents.length,
          ),
          onClick: () => this.showDetailModal(this.intentModal),
        });

        actions.push({
          scheme: 'neutral-dark',
          icon: 'translate-1',
          text: this.$tc(
            'webapp.intelligences_lib.show_languages',
            this.languages.length,
          ),
          onClick: () => this.showDetailModal(this.laguagueModal),
        });

        if (!this.isPrivate) {
          actions.push({
            scheme: 'neutral-dark',
            icon: 'copy-paste-1',
            text: this.$t('webapp.home.copy-intelligence'),
            onClick: () => this.openCopyConfirm(this.name),
          });
        }
      } else if (this.type === 'content-intelligence') {
        actions.push({
          scheme: 'neutral-dark',
          icon: 'article',
          text: this.$t('intelligences.view_bases'),
          onClick: () => this.viewContentBases(),
        });

        actions.push({
          scheme: 'aux-red-500',
          icon: 'delete',
          text: this.$t('intelligences.delete_intelligence'),
          onClick: () => (this.isDeleteIntelligenceConfirmationOpen = true),
        });
      } else if (this.type === 'content-base' && this.canContribute) {
        actions.push({
          scheme: 'aux-red-500',
          icon: 'delete',
          text: this.$t('bases.actions.delete'),
          onClick: () =>
            this.deleteBase({
              name: this.name,
              uuid: this.uuid,
            }),
        });
      }

      return actions;
    },

    ...mapGetters(['getProjectSelected', 'getOrgSelected']),

    getCurrentRepository() {
      return {
        uuid: this.uuid,
        name: this.name,
        repository_version_id: this.defaultVersionId,
      };
    },
    hasIntegrationDefined() {
      return this.hasIntegration !== null;
    },
    hasIntegrationCheckError() {
      return this.integrationError !== null;
    },
    intentModal() {
      return {
        title: this.$tc('webapp.intelligences_lib.intent_modal_title', 1, {
          nick: this.name,
        }),
        subtitle: this.$tc(
          'webapp.intelligences_lib.intent_modal_subtitle',
          10,
        ),
        type: 0,
        intents: this.intents,
        ownerNickname: this.ownerNickname,
        slug: this.slug,
      };
    },
    laguagueModal() {
      return {
        title: this.$tc('webapp.intelligences_lib.language_modal_title', 1, {
          nick: this.name,
        }),
        subtitle: this.$t(
          'webapp.intelligences_lib.language_modal_subtitle',
          10,
        ),
        type: 1,
        languages: this.languages,
      };
    },
  },

  mounted() {
    this.checkIfHasIntegration();

    // this.showIntegrationNotification('failure');
  },

  methods: {
    ...mapActions([
      'setIntegrationRepository',
      'getIntegrationRepository',
      'updateIntegratedProjects',
      'cloneRepository',
    ]),

    viewContentBases() {
      this.isViewBasesOpen = true;
    },

    async checkIfHasIntegration() {
      try {
        const inProject = JSON.parse(localStorage.getItem('in_project'));

        this.hasIntegration = inProject.some(
          ({
            repository_version,
            repository_uuid,
            project_uuid,
            organization,
          }) =>
            repository_version === this.defaultVersionId &&
            repository_uuid === this.uuid &&
            project_uuid === this.getProjectSelected &&
            organization === this.getOrgSelected,
        );
      } catch (err) {
        this.integrationError = err.response && err.response.data;
      }
    },
    changeIntegrationValue(value) {
      this.hasIntegration = value;
      this.updateIntegratedProjects();
    },
    showIntegrationNotification(value) {
      this.notificationModalType = value;
      if (value === 'success') {
        this.notificationModalTitle = this.$t(
          'webapp.intelligences_lib.integration_success_title',
        );
        this.notificationModalMessage = this.$t(
          'webapp.intelligences_lib.integration_success_description',
        );
      } else {
        this.notificationModalTitle = this.$t(
          'webapp.intelligences_lib.integration_error_title',
        );
        this.notificationModalMessage = this.$t(
          'webapp.intelligences_lib.integration_error_description',
        );
      }
      this.openNotificationModal = true;
    },
    showDetailModal(value) {
      this.openModal = true;
      this.modalInfo = { ...value };
    },
    changeIntegrateModalState(value) {
      this.integrateModal = value;
    },
    repositoryDetailsRouterParams() {
      if (this.type === 'content-intelligence') {
        this.$router.push({
          name: 'intelligence-home',
          params: {
            intelligenceUuid: this.uuid,
          },
        });
      } else if (this.type === 'classification-intelligence') {
        const path = `/dashboard/${this.ownerNickname}/${this.slug}/`;

        this.$router.push(path);
      } else if (this.type === 'content-base') {
        this.$router.push({
          name: 'intelligence-content-base-edit',
          params: {
            intelligenceUuid: this.$route.params.intelligenceUuid,
            contentBaseUuid: this.uuid,
          },
        });
      }
    },
    async copyIntelligence() {
      try {
        await this.cloneRepository({
          repositoryUUID: this.uuid,
          ownerId: +this.getOrgSelected,
        });
        this.notificationModalType = 'success';
        this.notificationModalTitle = this.$t(
          'webapp.intelligences_lib.clone.success_modal_title',
        );
        this.notificationModalMessage = this.$t(
          'webapp.intelligences_lib.clone.success_modal_message',
        );
      } catch (error) {
        this.notificationModalType = 'error';
        this.notificationModalTitle = this.$t(
          'webapp.intelligences_lib.clone.error_modal_title',
        );
        this.notificationModalMessage = error.response.data;
      } finally {
        this.openConfirmModal = false;
        this.openNotificationModal = true;
      }
    },
    openCopyConfirm(intelligence) {
      this.selectedIntelligence = intelligence;
      this.openConfirmModal = true;
    },
    deleteBase(repository) {
      this.$emit('deleteBase', repository);
    },
  },
};
</script>

<style lang="scss" scoped>
.button-quick-test {
  :deep(.material-symbols-rounded) {
    color: $unnnic-color-weni-600;
  }
}
</style>

<style lang="scss" scoped>
.unnnic-card-intelligence {
  height: 100%;
  box-sizing: border-box;

  &__header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: $unnnic-spacing-xs;

    &__title {
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__buttons {
      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-xs;

      &__icon-integrated {
        $button-size: 2.375 * $unnnic-font-size;

        width: $button-size;
        height: $button-size;
        text-align: center;
        line-height: $button-size;
      }

      &__tag {
        margin-left: $unnnic-inline-xs;
        margin-right: $unnnic-inline-nano;
      }

      &__icon {
        color: $unnnic-color-neutral-cleanest;
      }

      &__dropdown {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;

        &--reddish {
          color: $unnnic-color-feedback-red;
        }

        div {
          display: flex;
          flex-wrap: nowrap;
          padding-left: $unnnic-inset-xs;
          min-width: 7.6rem;
        }

        &__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          .rotation {
            animation: rotation 1300ms linear infinite;
          }

          @keyframes rotation {
            0% {
            }

            100% {
              transform: rotate(360deg);
            }
          }
        }
      }

      &__more-actions {
        background: none;
        border: none;
        display: flex;
      }
    }
  }

  &__description {
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &--content-intelligence,
  &--classification-intelligence {
    .unnnic-card-intelligence__description {
      margin-top: $unnnic-spacing-sm;
      margin-bottom: $unnnic-spacing-xs;
    }
  }

  &--content-base {
    .unnnic-card-intelligence__description {
      margin-top: $unnnic-spacing-xs;
    }
  }
}
</style>

<style lang="scss">
.unnnic-card-intelligence {
  display: flex;
  flex-direction: column;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-md - $unnnic-border-width-thinner;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  cursor: pointer;
  flex: 1;

  &:hover {
    box-shadow: 0 0.25rem 8px lightgrey;
  }

  &__clickable {
    cursor: pointer;
  }
}
</style>
