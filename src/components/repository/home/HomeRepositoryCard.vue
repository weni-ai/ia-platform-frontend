<template>
  <div
    :style="{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }"
  >
    <div
      :class="['unnnic-card-intelligence', `unnnic-card-intelligence--${type}`]"
      @click.prevent.stop="repositoryDetailsRouterParams()"
    >
      <header class="unnnic-card-intelligence__header">
        <div class="unnnic-card-intelligence__header__title">
          {{ repositoryDetail.name || repositoryDetail.title }}
        </div>

        <div class="unnnic-card-intelligence__header__buttons">
          <template
            v-if="
              hasIntegrationDefined &&
              !hasIntegrationCheckError &&
              repositoryDetail.repository_type === 'classifier'
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
            v-else-if="type === 'base'"
            side="top"
            :text="$t('content_bases.quick_test')"
            enabled
          >
            <UnnnicButton
              iconCenter="mode_comment"
              size="small"
              class="button-quick-test"
              type="alternative"
              @click.stop="isQuickTestOpen = true"
            />
          </UnnnicToolTip>

          <DropdownActions
            v-if="actions.length"
            :actions="actions"
          />
        </div>
      </header>

      <UnnnicIntelligenceText
        tag="p"
        color="neutral-dark"
        family="secondary"
        size="body-gt"
        class="unnnic-card-intelligence__description"
      >
        {{ repositoryDetail.description }}
      </UnnnicIntelligenceText>

      <UnnnicDivider
        ySpacing="xs"
        scheme="neutral-lightest"
      />

      <footer
        v-if="type === 'base'"
        class="base__footer"
      >
        {{ language }}
      </footer>

      <section class="unnnic-card-intelligence__detail">
        <div
          v-if="type === 'repository'"
          v-show="repositoryDetail.repository_type === 'classifier'"
          class="unnnic-card-intelligence__detail__content"
        >
          <div class="unnnic-card-intelligence__detail__content__data">
            {{
              $tc(
                'webapp.intelligences_lib.intent',
                repositoryDetail.intents.length,
              )
            }}
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <UnnnicAvatarIcon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="typing-1"
              scheme="aux-pink"
            />

            <div
              class="unnnic-card-intelligence__detail__content__data__info__number"
            >
              {{ repositoryDetail.intents.length }}
            </div>
          </div>
        </div>

        <div
          v-if="
            (type === 'repository' &&
              repositoryDetail.repository_type === 'content') ||
            type === 'intelligence'
          "
          class="unnnic-card-intelligence__detail__content"
        >
          <div class="unnnic-card-intelligence__detail__content__data">
            {{
              $tc(
                'webapp.intelligences_lib.knowledge_bases',
                repositoryDetail.count_knowledge_bases ||
                  repositoryDetail.content_bases_count,
              )
            }}
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <UnnnicAvatarIcon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="article"
              scheme="aux-purple"
            />

            <div
              class="unnnic-card-intelligence__detail__content__data__info__number"
            >
              {{
                repositoryDetail.count_knowledge_bases ||
                repositoryDetail.content_bases_count
              }}
            </div>
          </div>
        </div>

        <div
          v-if="
            type === 'repository' &&
            repositoryDetail.repository_type === 'classifier'
          "
          class="unnnic-card-intelligence__detail__content"
        >
          <div class="unnnic-card-intelligence__detail__content__data">
            {{
              $tc(
                'webapp.intelligences_lib.language',
                repositoryDetail.available_languages.length,
              )
            }}
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <UnnnicAvatarIcon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="translate-1"
              scheme="aux-purple"
            />

            <div
              class="unnnic-card-intelligence__detail__content__data__info__number"
            >
              {{ repositoryDetail.available_languages.length }}
            </div>
          </div>
        </div>

        <div
          v-if="type === 'repository'"
          v-show="repositoryDetail.repository_type === 'classifier'"
          class="unnnic-card-intelligence__detail__content"
        >
          <div class="unnnic-card-intelligence__detail__content__data">
            {{
              $tc(
                'webapp.intelligences_lib.intelligence_force',
                repositoryDetail.intents.length,
              )
            }}
            <UnnnicToolTip
              v-if="repositoryDetail.repository_type === 'classifier'"
              :text="$t('webapp.intelligences_lib.intelligence_force_tooltip')"
              enabled
              side="top"
              maxWidth="17rem"
              class="unnnic-card-intelligence__type__icon"
            >
              <UnnnicIconSvg
                icon="information-circle-4"
                scheme="neutral-soft"
                size="sm"
              />
            </UnnnicToolTip>
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <UnnnicAvatarIcon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="fitness-biceps-1"
              scheme="feedback-blue"
            />

            <div
              class="unnnic-card-intelligence__detail__content__data__info__number"
            >
              {{ `${intelligenceForce}%` }}
            </div>
          </div>
        </div>
      </section>
    </div>
    <IntegrationModal
      :openModal="integrateModal"
      :repository="getCurrentRepository"
      :hasIntegration="hasIntegration"
      @closeIntegratationModal="changeIntegrateModalState(false)"
      @dispatchUpdateIntegration="changeIntegrationValue($event)"
      @dispatchIntegrationNotification="showIntegrationNotification"
    />
    <UnnnicModal
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
          @click="openConfirmModal = false"
        >
          {{ $t('webapp.home.cancel') }}
        </UnnnicButton>
        <UnnnicButton
          type="secondary"
          @click="copyIntelligence()"
        >
          {{ $t('webapp.intelligences_lib.clone.copy') }}
        </UnnnicButton>
      </template>
    </UnnnicModal>
    <UnnnicModal
      :showModal="openNotificationModal"
      :text="notificationModalTitle"
      :scheme="
        notificationModalType === 'success' ? 'feedback-green' : 'feedback-red'
      "
      :modalIcon="
        notificationModalType === 'success'
          ? 'check-circle-1-1'
          : 'alert-circle-1'
      "
      @close="openNotificationModal = false"
    >
      <template #message>
        <span v-html="notificationModalMessage" />
      </template>
    </UnnnicModal>

    <SideBarContentBases
      v-if="isViewBasesOpen"
      :name="repositoryDetail.name"
      :intelligenceUuid="repositoryDetail.uuid"
      @close="isViewBasesOpen = false"
    />

    <SideBarQuickTest
      v-if="isQuickTestOpen"
      :id="repositoryDetail.id"
      :name="repositoryDetail.title"
      :repositoryUuid="repositoryDetail.uuid"
      :repositoryLanguage="repositoryDetail.language"
      @close="isQuickTestOpen = false"
    />

    <UnnnicModal
      :showModal="isDeleteIntelligenceConfirmationOpen"
      :text="$t('intelligences.delete_intelligence')"
      scheme="aux-red-500"
      modalIcon="error"
      @close="isDeleteIntelligenceConfirmationOpen = false"
    >
      <template #message>
        <span
          v-html="
            $t(
              'intelligences.delete_intelligence_confirmation_modal_description',
              {
                name: repositoryDetail.name,
              },
            )
          "
        ></span>
      </template>
      <template #options>
        <UnnnicButton
          type="tertiary"
          @click="isDeleteIntelligenceConfirmationOpen = false"
        >
          {{ $t('cancel') }}
        </UnnnicButton>
        <UnnnicButton
          type="warning"
          :loading="deletingIntelligence"
          @click="deleteIntelligence"
        >
          {{ $t('delete') }}
        </UnnnicButton>
      </template>
    </UnnnicModal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import IntegrationModal from '@/components/shared/IntegrationModal.vue';
import IntegrateButton from '@/components/repository/IntegrateButton.vue';
import SideBarContentBases from './SideBarContentBases.vue';
import SideBarQuickTest from './SideBarQuickTest.vue';
import nexusaiAPI from '../../../api/nexusaiAPI';
import { get } from 'lodash';
import DropdownActions from '@/views/repository/content/ContentItemActions.vue';

export default {
  name: 'HomeRepositoryCard',
  components: {
    IntegrationModal,
    SideBarContentBases,
    SideBarQuickTest,
    IntegrateButton,
    DropdownActions,
  },
  props: {
    type: {
      type: String,
      default: 'repository',
    },

    repositoryDetail: {
      type: [Object, Array],
      default: null,
    },

    canContribute: Boolean,
  },
  data() {
    return {
      dropdownOpen: false,
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
    };
  },

  computed: {
    actions() {
      const actions = [];

      if (this.repositoryDetail.repository_type === 'classifier') {
        actions.push({
          scheme: 'neutral-dark',
          icon: 'graph-stats-1',
          text: this.$tc(
            'webapp.intelligences_lib.show_intents',
            this.repositoryDetail.intents.length,
          ),
          onClick: () => this.showDetailModal(this.intentModal),
        });

        actions.push({
          scheme: 'neutral-dark',
          icon: 'translate-1',
          text: this.$tc(
            'webapp.intelligences_lib.show_languages',
            this.repositoryDetail.available_languages.length,
          ),
          onClick: () => this.showDetailModal(this.laguagueModal),
        });

        if (!this.repositoryDetail.is_private) {
          actions.push({
            scheme: 'neutral-dark',
            icon: 'copy-paste-1',
            text: this.$t('webapp.home.copy-intelligence'),
            onClick: () => this.openCopyConfirm(this.repositoryDetail.name),
          });
        }
      } else if (
        (this.type === 'base' && this.canContribute) ||
        this.type === 'intelligences'
      ) {
        actions.push({
          scheme: 'aux-red-500',
          icon: 'delete',
          text: this.$t('bases.actions.delete'),
          onClick: () => this.deleteBase(this.repositoryDetail),
        });
      } else if (['repository', 'intelligence'].includes(this.type)) {
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
      }

      return actions;
    },

    ...mapGetters(['getProjectSelected', 'getOrgSelected']),

    language() {
      return get(this.repositoryDetail, 'language', '').toUpperCase();
    },

    getCurrentRepository() {
      return {
        name: this.repositoryDetail.name,
        repository_version_id: this.repositoryDetail.version_default?.id,
        uuid: this.repositoryDetail.uuid,
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
          nick: this.repositoryDetail.name,
        }),
        subtitle: this.$tc(
          'webapp.intelligences_lib.intent_modal_subtitle',
          10,
        ),
        type: 0,
        intents: this.repositoryDetail.intents,
        ownerNickname: this.repositoryDetail.owner__nickname,
        slug: this.repositoryDetail.slug,
      };
    },
    laguagueModal() {
      return {
        title: this.$tc('webapp.intelligences_lib.language_modal_title', 1, {
          nick: this.repositoryDetail.name,
        }),
        subtitle: this.$t(
          'webapp.intelligences_lib.language_modal_subtitle',
          10,
        ),
        type: 1,
        languages: this.repositoryDetail.available_languages,
      };
    },
    intelligenceForce() {
      const scoreObject = this.repositoryDetail?.repository_score;
      const scoreResult =
        (scoreObject?.evaluate_size_score +
          scoreObject?.intents_balance_score +
          scoreObject?.intents_size_score) /
        3;
      return scoreResult.toFixed(0);
    },
  },

  mounted() {
    this.checkIfHasIntegration();
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
            repository_version === this.repositoryDetail.version_default.id &&
            repository_uuid === this.repositoryDetail.uuid &&
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
      this.$emit('dispatchShowModal', value);
    },
    changeIntegrateModalState(value) {
      this.integrateModal = value;
    },
    repositoryDetailsRouterParams() {
      if (
        this.type === 'intelligence' ||
        (this.type === 'repository' &&
          this.repositoryDetail?.repository_type === 'content')
      ) {
        this.$router.push({
          name: 'intelligence-home',
          params: {
            intelligenceUuid: this.repositoryDetail.uuid,
          },
        });
      } else if (this.type === 'repository') {
        let path;

        if (this.repositoryDetail.repository_type === 'content') {
          path = `/dashboard/${this.repositoryDetail.owner__nickname}/${this.repositoryDetail.slug}/content/bases`;
        } else if (this.repositoryDetail.repository_type === 'classifier') {
          path = `/dashboard/${this.repositoryDetail.owner__nickname}/${this.repositoryDetail.slug}/`;
        }

        this.$router.push(path);
      } else if (this.type === 'base') {
        this.$router.push({
          name: 'intelligence-content-base-edit',
          params: {
            intelligenceUuid: this.$route.params.intelligenceUuid,
            contentBaseUuid: this.repositoryDetail.uuid,
          },
        });
      }
    },
    async copyIntelligence() {
      try {
        await this.cloneRepository({
          repositoryUUID: this.repositoryDetail.uuid,
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
        this.$emit('onCopySuccess');
      }
    },
    openCopyConfirm(intelligence) {
      this.selectedIntelligence = intelligence;
      this.openConfirmModal = true;
    },
    deleteBase(repository) {
      this.$emit('deleteBase', repository);
    },
    deleteIntelligence() {
      this.deletingIntelligence = true;

      nexusaiAPI
        .deleteIntelligence({
          orgUuid: this.$store.state.Auth.connectOrgUuid,
          intelligenceUuid: this.repositoryDetail.uuid,
        })
        .then(() => {
          this.isDeleteIntelligenceConfirmationOpen = false;
          this.$emit('removed');
        })
        .finally(() => {
          this.deletingIntelligence = false;
        });
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
    }
  }

  &__description {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__detail {
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-xs;

    &__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-nano;

      &__data {
        color: $unnnic-color-neutral-dark;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-regular;
        font-family: $unnnic-font-family-secondary;

        &__info {
          display: flex;
          align-items: center;
          column-gap: $unnnic-spacing-xs;

          &__number {
            color: $unnnic-color-neutral-darkest;
            font-size: $unnnic-font-size-body-gt;
            line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
            font-weight: $unnnic-font-weight-bold;
            font-family: $unnnic-font-family-secondary;
          }
        }
      }
    }
  }

  &__type__icon {
    margin-left: $unnnic-spacing-nano;
  }

  &--intelligence,
  &--repository {
    .unnnic-card-intelligence__description {
      margin-top: $unnnic-spacing-sm;
      margin-bottom: $unnnic-spacing-xs;
    }
  }

  &--base {
    .unnnic-card-intelligence__description {
      margin-top: $unnnic-spacing-xs;
    }
  }
}
</style>

<style lang="scss">
.base__footer {
  color: $unnnic-color-neutral-cloudy;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-bold;
}

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
