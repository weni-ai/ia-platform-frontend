<template>
  <div>
    <div @click.prevent.stop="repositoryDetailsRouterParams()" class="unnnic-card-intelligence">
      <section class="unnnic-card-intelligence__header">
        <div class="unnnic-card-intelligence__header__detail">
          <div class="unnnic-card-intelligence__header__detail__title">
            {{ repositoryDetail.name }}
          </div>

          <!-- <div class="unnnic-card-intelligence__header__detail__subtitle">
            {{ $t("webapp.intelligences_lib.created_by") }}
            <strong>{{ repositoryDetail.owner__nickname }}</strong>
          </div> -->
        </div>

        <div class="unnnic-card-intelligence__header__buttons">
          <div v-if="hasIntegrationDefined && !hasIntegrationCheckError">
            <unnnic-tool-tip
               side="top"
               :text="hasIntegration ?
                $t('webapp.home.remove_integrate') : $t('webapp.home.integrate')"
               enabled
             >
              <unnnic-button
                v-if="!hasIntegration"
                @click.prevent.stop="changeIntegrateModalState(true)"
                iconCenter="add-1"
                size="small"
                icon="add-1"
                class="mr-2"
                type="alternative"
              />
            </unnnic-tool-tip>
          </div>

          <unnnic-dropdown
            v-if="type === 'repository'"
            position="bottom-left"
            :open.sync="dropdownOpen"
          >
            <div slot="trigger">
              <unnnic-icon-svg
                icon="navigation-menu-vertical-1"
                class="unnnic-card-intelligence__header__buttons__icon"
                size="sm"
                slot="trigger"
                clickable
              />
            </div>

            <div v-if=" repositoryDetail.repository_type === 'classifier'">
              <unnnic-dropdown-item @click="showDetailModal(intentModal)">
                <div class="unnnic-card-intelligence__header__buttons__dropdown">
                  <unnnic-icon-svg size="sm" icon="graph-stats-1" />
                  <div>
                    {{
                      $tc("webapp.intelligences_lib.show_intents",
                        this.repositoryDetail.intents.length)
                    }}
                  </div>
                </div>
              </unnnic-dropdown-item>

              <unnnic-dropdown-item @click="showDetailModal(laguagueModal)">
                <div class="unnnic-card-intelligence__header__buttons__dropdown">
                  <unnnic-icon-svg size="sm" icon="translate-1" />
                  <div>
                    {{
                      $tc(
                        "webapp.intelligences_lib.show_languages",
                        this.repositoryDetail.available_languages.length
                      )
                    }}
                  </div>
                </div>
              </unnnic-dropdown-item>

              <unnnic-dropdown-item
                v-if="!repositoryDetail.is_private"
                @click="openCopyConfirm(repositoryDetail.name)"
              >
                <div class="unnnic-card-intelligence__header__buttons__dropdown">
                  <unnnic-icon-svg size="sm" icon="copy-paste-1" />
                  <div>{{ $t("webapp.home.copy-intelligence") }}</div>
                </div>
              </unnnic-dropdown-item>

            </div>

            <div v-else>
              <unnnic-dropdown-item>
                <div class="unnnic-card-intelligence__header__buttons__dropdown">
                  <unnnic-icon-svg size="sm" icon="article" />
                  <div>
                    <!-- {{
                      $tc("webapp.intelligences_lib.show_intents",
                        this.repositoryDetail.intents.length)
                    }} -->
                    Visualizar bases
                  </div>
                </div>
              </unnnic-dropdown-item>

              <unnnic-dropdown-item>
                <div class="unnnic-card-intelligence__header__buttons__dropdown">
                  <unnnic-icon-svg size="sm" icon="delete" scheme="feedback-red"/>
                  <div :style="{color: '#E53E3E'}">
                    <!-- {{
                      $tc(
                        "webapp.intelligences_lib.show_languages",
                        this.repositoryDetail.available_languages.length
                      )
                    }} -->
                    Excluir inteligência
                  </div>
                </div>
              </unnnic-dropdown-item>

            </div>

          </unnnic-dropdown>
        </div>
      </section>

      <section class="unnnic-card-intelligence__description">
        {{ repositoryDetail.description }}
      </section>

      <!-- <section v-if="type === 'repository'" class="unnnic-card-intelligence__type">
        <div class="unnnic-card-intelligence__type__text">
          {{ $t(`webapp.intelligences_lib.repository_type.${repositoryDetail.repository_type}`) }}
        </div>
        <unnnic-tool-tip
          v-if="repositoryDetail.repository_type === 'classifier'"
          :text="$t('webapp.intelligences_lib.intelligence_tooltip')"
          enabled
          side="bottom"
          max-width="17rem"
        >
          <unnnic-icon-svg
            icon="information-circle-4"
            scheme="neutral-soft"
            size="sm"
          />
        </unnnic-tool-tip>
        <unnnic-tool-tip
          v-else-if="repositoryDetail.repository_type === 'content'"
          :text="$t('webapp.intelligences_lib.intelligence_tooltip_content')"
          enabled
          side="bottom"
          max-width="17rem"
        >
          <unnnic-icon-svg
            icon="information-circle-4"
            scheme="neutral-soft"
            size="sm"
          />
        </unnnic-tool-tip>
      </section> -->

      <div class="unnnic-card-intelligence__divider" />

      <section class="unnnic-card-intelligence__detail">
        <div v-if="type === 'repository'" class="unnnic-card-intelligence__detail__content"
          v-show="repositoryDetail.repository_type === 'classifier'">
          <div class="unnnic-card-intelligence__detail__content__data">
            {{ $tc("webapp.intelligences_lib.intent", this.repositoryDetail.intents.length) }}
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <unnnic-avatar-icon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="typing-1"
              scheme="aux-pink"
            />

            <div class="unnnic-card-intelligence__detail__content__data__info__number">
              {{ repositoryDetail.intents.length }}
            </div>
          </div>
        </div>

        <div
          v-if="type === 'repository' && repositoryDetail.repository_type === 'content'"
          class="unnnic-card-intelligence__detail__content"
        >
          <div class="unnnic-card-intelligence__detail__content__data">
            {{
              $tc(
                'webapp.intelligences_lib.knowledge_bases',
                repositoryDetail.count_knowledge_bases
              )
            }}
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <unnnic-avatar-icon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="article"
              scheme="aux-purple"
            />

            <div class="unnnic-card-intelligence__detail__content__data__info__number">
              {{ repositoryDetail.count_knowledge_bases }}
            </div>
          </div>
        </div>

        <div
          v-if="type === 'repository' && repositoryDetail.repository_type === 'classifier'"
          class="unnnic-card-intelligence__detail__content"
        >
          <div class="unnnic-card-intelligence__detail__content__data">
            {{
              $tc(
                "webapp.intelligences_lib.language",
                this.repositoryDetail.available_languages.length
              )
            }}
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <unnnic-avatar-icon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="translate-1"
              scheme="aux-purple"
            />

            <div class="unnnic-card-intelligence__detail__content__data__info__number">
              {{ repositoryDetail.available_languages.length }}
            </div>
          </div>
        </div>

        <div v-if="type === 'repository'" class="unnnic-card-intelligence__detail__content"
          v-show="repositoryDetail.repository_type === 'classifier'">
          <div class="unnnic-card-intelligence__detail__content__data">
            {{ $tc("webapp.intelligences_lib.intelligence_force",
            this.repositoryDetail.intents.length) }}
            <unnnic-tool-tip
              v-if="repositoryDetail.repository_type === 'classifier'"
              :text="$t('webapp.intelligences_lib.intelligence_force_tooltip')"
              enabled
              side="top"
              max-width="17rem"
              class="unnnic-card-intelligence__type__icon"
            >
              <unnnic-icon-svg
                icon="information-circle-4"
                scheme="neutral-soft"
                size="sm"
              />
            </unnnic-tool-tip>
          </div>
          <div class="unnnic-card-intelligence__detail__content__data__info">
            <unnnic-avatar-icon
              class="unnnic-card-intelligence__detail__content__data__info__icon"
              size="xs"
              icon="fitness-biceps-1"
              scheme="feedback-blue"
            />

            <div class="unnnic-card-intelligence__detail__content__data__info__number">
              {{ `${intelligenceForce}%` }}
            </div>
          </div>
        </div>

      </section>
    </div>
      <integration-modal
        :openModal="integrateModal"
        :repository="getCurrentRepository"
        :hasIntegration="hasIntegration"
        @closeIntegratationModal="changeIntegrateModalState(false)"
        @dispatchUpdateIntegration="changeIntegrationValue($event)"
        @dispatchIntegrationNotification="showIntegrationNotification"
      />
      <unnnic-modal
        :showModal="openConfirmModal"
        :text="$t('webapp.intelligences_lib.clone.confirm_modal_title',
          {intelligence: this.selectedIntelligence })"
        scheme="feedback-yellow"
        modal-icon="alert-circle-1"
        @close="openConfirmModal = false"
      >
        <span
          slot="message"
          v-html="$t('webapp.intelligences_lib.clone.confirm_modal_message')"
        />
        <unnnic-button slot="options" type="terciary" @click="openConfirmModal = false">
          {{ $t("webapp.home.cancel") }}
        </unnnic-button>
        <unnnic-button
          slot="options"
          type="secondary"
          @click="copyIntelligence()"
        >
          {{ $t("webapp.intelligences_lib.clone.copy") }}
        </unnnic-button>
      </unnnic-modal>
      <unnnic-modal
        :showModal="openNotificationModal"
        :text="notificationModalTitle"
        :scheme="notificationModalType === 'success' ? 'feedback-green' : 'feedback-red'"
        :modal-icon="notificationModalType === 'success' ? 'check-circle-1-1' : 'alert-circle-1'"
        @close="openNotificationModal = false"
      >
        <span
        slot="message"
        v-html="notificationModalMessage" />
      </unnnic-modal>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import IntegrationModal from '@/components/shared/IntegrationModal';

export default {
  name: 'HomeRepositoryCard',
  components: { IntegrationModal },
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
      selectedIntelligence: ''
    };
  },
  props: {
    type: {
      type: String,
      default: 'repository',
    },

    repositoryDetail: {
      type: [Object, Array],
      default: null
    }
  },
  mounted() {
    this.checkIfHasIntegration();
  },
  computed: {
    ...mapGetters(['getProjectSelected', 'getOrgSelected']),
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
          nick: this.repositoryDetail.name
        }),
        subtitle: this.$tc('webapp.intelligences_lib.intent_modal_subtitle', 10),
        type: 0,
        intents: this.repositoryDetail.intents,
        ownerNickname: this.repositoryDetail.owner__nickname,
        slug: this.repositoryDetail.slug
      };
    },
    laguagueModal() {
      return {
        title: this.$tc('webapp.intelligences_lib.language_modal_title', 1, {
          nick: this.repositoryDetail.name
        }),
        subtitle: this.$t('webapp.intelligences_lib.language_modal_subtitle', 10),
        type: 1,
        languages: this.repositoryDetail.available_languages
      };
    },
    intelligenceForce() {
      const scoreObject = this.repositoryDetail.repository_score;
      const scoreResult = (scoreObject.evaluate_size_score
      + scoreObject.intents_balance_score + scoreObject.intents_size_score) / 3;
      return scoreResult.toFixed(0);
    },
  },
  methods: {
    ...mapActions([
      'setIntegrationRepository',
      'getIntegrationRepository',
      'updateIntegratedProjects',
      'cloneRepository'
    ]),
    async checkIfHasIntegration() {
      try {
        const inProject = JSON.parse(localStorage.getItem('in_project'));

        this.hasIntegration = inProject.some(
          (
            {
              repository_version,
              repository_uuid,
              project_uuid,
              organization
            }
          ) => (
            repository_version === this.repositoryDetail.version_default.id
            && repository_uuid === this.repositoryDetail.uuid
            && project_uuid === this.getProjectSelected
            && organization === this.getOrgSelected
          )
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
      this.notificationModalType = value
      if (value === 'success') {
        this.notificationModalTitle = this.$t('webapp.intelligences_lib.integration_success_title')
        this.notificationModalMessage = this.$t('webapp.intelligences_lib.integration_success_description')
      } else {
        this.notificationModalTitle = this.$t('webapp.intelligences_lib.integration_error_title')
        this.notificationModalMessage = this.$t('webapp.intelligences_lib.integration_error_description')
      }
      this.openNotificationModal = true
    },
    showDetailModal(value) {
      this.$emit('dispatchShowModal', value);
    },
    changeIntegrateModalState(value) {
      this.integrateModal = value;
    },
    repositoryDetailsRouterParams() {
      if (this.type === 'repository') {
        let name;

        if (this.repositoryDetail.repository_type === 'content') {
          name = 'repository-content-bases';
        } else if (this.repositoryDetail.repository_type === 'classifier') {
          name = 'repository-summary';
        }
        this.$router.push({
          name,
          params: {
            ownerNickname: this.repositoryDetail.owner__nickname,
            slug: this.repositoryDetail.slug
          }
        });
      } else if (this.type === 'base') {
        this.$router.push({
          name: 'repository-content-bases-edit',
          params: {
            id: this.repositoryDetail.id,
          }
        });
      }
    },
    async copyIntelligence() {
      try {
        await this.cloneRepository({
          repositoryUUID: this.repositoryDetail.uuid,
          ownerId: +this.getOrgSelected
        })
        this.notificationModalType = 'success'
        this.notificationModalTitle = this.$t('webapp.intelligences_lib.clone.success_modal_title')
        this.notificationModalMessage = this.$t('webapp.intelligences_lib.clone.success_modal_message')
      } catch (error) {
        this.notificationModalType = 'error'
        this.notificationModalTitle = this.$t('webapp.intelligences_lib.clone.error_modal_title')
        this.notificationModalMessage = error.response.data
      } finally {
        this.openConfirmModal = false
        this.openNotificationModal = true
        this.$emit('onCopySuccess')
      }
    },
    openCopyConfirm(intelligence) {
      this.selectedIntelligence = intelligence
      this.openConfirmModal = true
    }
  }
};
</script>

<style lang="scss">
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.unnnic-card-intelligence {
  display: flex;
  flex-direction: column;
  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-inset-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  // margin-bottom: $unnnic-inline-sm;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0.25rem 8px lightgrey;
  }

  &__clickable {
    cursor: pointer;
  }

  &__header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__detail {
      &__title {
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-bold;
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
        color: $unnnic-color-neutral-darkest;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        max-width: 13rem;
      }

      &__subtitle {
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;
        color: $unnnic-color-neutral-cloudy;

        strong {
          color: $unnnic-color-brand-weni;
        }
      }
    }

    &__buttons {
      display: flex;
      align-items: center;

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

        &--reddish{
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
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-lg;
    color: $unnnic-color-neutral-cloudy;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
    margin: $unnnic-spacing-stack-sm 0;
    min-height: 3.125rem;
    padding-top: $unnnic-inline-xs;

    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__type {
    display: flex;
    align-items: center;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-md;
    color: $unnnic-color-neutral-cloudy;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;

    &__text {
      margin-right: 10px;
    }

    &__icon {
      margin-left: 10px;
    }
  }

  &__divider {
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-lightest;
    margin: $unnnic-spacing-stack-xs 0;
  }

  &__detail {
    display: flex;
    align-items: center;

    &__content {
      width: 50%;

      &__data {
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-gt;
        color: $unnnic-color-neutral-dark;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
        padding-right: $unnnic-inline-xs;
        padding-bottom: $unnnic-spacing-stack-nano;

        &__info {
          display: flex;
          align-items: center;

          &__icon {
            margin-right: $unnnic-inline-xs;
          }

          &__number {
            font-family: $unnnic-font-family-secondary;
            font-weight: $unnnic-font-weight-black;
            font-size: $unnnic-font-size-body-gt;
            line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
            color: $unnnic-color-neutral-darkest;
            padding-right: $unnnic-inline-xs;
          }
        }
      }
    }
  }
}
</style>
