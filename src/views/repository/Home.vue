<template>
  <repository-view-base :repository="repository" :error-code="errorCode">
    <div v-if="repository" class="repository-home">
      <div class="repository-home__description">
        <div>


        <div class="repository-home__title">
          <unnnic-card
            type="title"
            :title="$t('webapp.home.description')"
            :hasInformationIcon="false"
            icon="paginate-filter-text-1"
            scheme="aux-orange"
          />
        </div>
        <div class="repository-home__description__header">
          <div>
            <vue-markdown
              :source="repository.description"
              :show="show"
              :html="html"
              :breaks="breaks"
              :linkify="linkify"
              :emoji="emoji"
              :typographer="typographer"
              :toc="toc"
              toc-id="toc"
              class="repository-home__description__text markdown-body"
            />
            <p
              v-if="repository.description"
              class="repository-home__description__text"
            />
            <p v-else>
              <i class="text-color-grey-dark">{{
                $t("webapp.home.no_description")
              }}</i>
            </p>
          </div>
          <div class="repository-home__description__tags-wrapper">
            <div>
              <unnnic-tag
                v-for="(category, index) in getAllCategories"
                :key="index"
                :text="category"
                disabled
                scheme="background-sky"
                class="repository-home__header__tag"
              />
            </div>
          </div>
        </div>
                </div>
        <div>
          <unnnic-button
            v-if="hasIntegration && !hasIntegrationCheckError"
            type="secondary"
            :loading="hasIntegration && !hasIntegrationCheckError"
            @click="changeIntegrateModalState(true)"
            :class="{
              'repository-home__description__header__remove-integrate':
                hasIntegrationDefined,
            }"
          >
            {{ $t("webapp.summary.remove_integrate") }}
          </unnnic-button>
          <unnnic-button
            v-else-if="!hasIntegrationCheckError"
            type="secondary"
            :loading="!hasIntegrationDefined"
            @click="changeIntegrateModalState(true)"
            :class="{
              'repository-home__description__header__integrate':
                hasIntegrationDefined,
            }"
          >
            {{ $t("webapp.summary.integrate") }}
          </unnnic-button>
        </div>
      </div>

      <div class="repository-home__divider"></div>

      <summary-information />

      <unnnic-tab
        class="repository-home__tabs"
        initialTab="first"
        :tabs="['first', 'second']"
      >
        <template slot="tab-head-first">
          {{ $t("webapp.home.intents_list") }}
          <unnnic-tool-tip
            side="right"
            :text="$t('webapp.summary.intents_list_info')"
            enabled
          >
            <unnnic-icon
              class="info"
              icon="information-circle-4"
              size="sm"
              scheme="neutral-soft"
            />
          </unnnic-tool-tip>
        </template>
        <template slot="tab-panel-first">
          <div id="intent-container" v-if="hasIntents">
            <badges-intents :list="repository.intents" />
          </div>
        </template>
        <template slot="tab-head-second">
          {{ $t("webapp.home.entities_list") }}
          <unnnic-tool-tip
            side="right"
            :text="$t('webapp.summary.entity_groups_info')"
            enabled
          >
            <unnnic-icon
              class="info"
              icon="information-circle-4"
              size="sm"
              scheme="neutral-soft"
            />
          </unnnic-tool-tip>
        </template>
        <template slot="tab-panel-second">
          <entity-edit
            id="entity-container"
            :groups="repository.groups || []"
            :can-edit="repository.authorization.can_contribute"
            :ungrouped="unlabeled"
            :newGroup="newGroup"
            :repository-uuid="repository.uuid"
            @updateGroup="updatedGroup"
            @updateUngrouped="updateUngrouped"
            @updateNewGroup="updateNewGroup"
            @removeGroup="removeGroup"
            @removeEntity="removeEntity"
            @createdGroup="addedGroup"
            @onEditGroups="editGroups"
          />
        </template>
      </unnnic-tab>
    </div>
    <integration-modal
      :openModal="integrateModal"
      :repository="getCurrentRepository"
      :hasIntegration="hasIntegration"
      @closeIntegratationModal="changeIntegrateModalState(false)"
      @dispatchUpdateIntegration="changeIntegrationValue()"
    />
    <unnnic-modal
      :showModal="openModal"
      :text="$t('webapp.home.create_group_modal_title')"
      scheme="feedback-yellow"
      modal-icon="alert-circle-1"
      @close="openModal = false"
    >
      <span
        slot="message"
        v-html="$t('webapp.home.create_group_modal_subtitle')"
      />
      <div slot="message" class="modal-header">
        <unnnic-input
          :placeholder="$t('webapp.home.create_group_field_label')"
          v-model="newGroupName"
        >
          <span
            slot="label"
            v-html="$t('webapp.home.create_group_field_title')"
          />
        </unnnic-input>
      </div>
      <unnnic-button slot="options" type="terciary" @click="openModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="primary"
        scheme="feedback-yellow"
        @click="createGroup()"
      >
        {{ $t("webapp.home.save_changes") }}
      </unnnic-button>
    </unnnic-modal>
    <b-loading :is-full-page="false" :active="loading" />
  </repository-view-base>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import BadgesIntents from '@/components/repository/BadgesIntents';
import VueMarkdown from 'vue-markdown';
import EntityEdit from '@/components/repository/EntityEdit';
import SummaryInformation from '@/components/repository/SummaryInformation';
import IntegrationModal from '@/components/shared/IntegrationModal';
import RepositoryBase from './Base';

export default {
  name: 'RepositoryHome',
  components: {
    RepositoryViewBase,
    BadgesIntents,
    VueMarkdown,
    EntityEdit,
    SummaryInformation,
    IntegrationModal,
  },
  extends: RepositoryBase,
  data() {
    return {
      initialTab: 0,
      currentLanguage: '',
      links: ['Sentences', 'Results', 'Versions'],
      languages: [],
      evaluating: false,
      error: {},
      source: '',
      show: true,
      html: true,
      breaks: false,
      linkify: false,
      emoji: true,
      typographer: true,
      toc: true,
      edit: false,
      creating: false,
      newLabels: [],
      integrateModal: false,
      hasIntegration: null,
      integrationError: null,
      openModal: false,
      newGroupName: '',
      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      'getCurrentRepository',
      'getProjectSelected',
      'getOrgSelected',
      'getSelectedVersion',
      'getSelectedVersionRepository',
    ]),
    unlabeled() {
      if (!this.repository || !this.repository.other_group) return [];
      return this.repository.other_group.entities;
    },
    newGroup() {
      if (!this.repository || !this.repository.new_group) return [];
      return this.repository.new_group.entities;
    },
    hasIntegrationDefined() {
      return this.hasIntegration !== null;
    },
    hasIntegrationCheckError() {
      return this.integrationError !== null;
    },
    hasIntents() {
      return this.repository.intents_list.length > 0;
    },
    repositoryIcon() {
      return (
        (this.repository.categories[0] && this.repository.categories[0].icon)
        || 'botinho'
      );
    },
    getAllCategories() {
      const categories = this.repository.categories_list.map(
        (category) => category.name
      );
      return categories;
    },
  },
  watch: {
    edit() {
      if (!this.edit) this.creating = false;
    },
    getCurrentRepository() {
      if (this.getCurrentRepository) {
        this.checkIfHasIntegration();
      }
    },
  },
  methods: {
    ...mapActions(['getIntegrationRepository', 'addGroup', 'editEntity']),
    async checkIfHasIntegration() {
      try {
        const { data } = await this.getIntegrationRepository({
          repository_version: this.getCurrentRepository.repository_version_id,
          repository_uuid: this.getCurrentRepository.uuid,
          project_uuid: this.getProjectSelected,
          organization: this.getOrgSelected,
        });
        this.hasIntegration = data.in_project;
      } catch (err) {
        this.integrationError = err.response && err.response.data;
      }
    },
    changeIntegrationValue() {
      this.hasIntegration = null;
    },
    updatedGroup({ groupId, entities }) {
      const groupIndex = this.getGroupIndex(groupId);
      if (groupIndex >= 0) { this.repository.groups[groupIndex].entities = entities; }
    },
    updateUngrouped({ entities }) {
      this.repository.other_group.entities = entities;
    },
    updateNewGroup({ entities }) {
      this.repository.new_group.entities = entities;
    },
    changeIntegrateModalState(value) {
      if (this.integrationError !== null && value) {
        this.$buefy.toast.open({
          message: this.integrationError.detail,
          type: 'is-danger',
        });
        return;
      }
      this.integrateModal = value;
    },
    removeEntity({ entity, groupId }) {
      if (groupId != null) {
        const groupIndex = this.getGroupIndex(groupId);

        if (groupIndex < 0) return;

        const removeIndex = this.repository.groups[
          groupIndex
        ].entities.findIndex(
          (listEntity) => listEntity.entity_id === entity.entity_id
        );

        if (removeIndex < 0) return;

        this.repository.groups[groupIndex].entities.splice(removeIndex, 1);
      } else {
        const removeIndex = this.repository.other_group.entities.findIndex(
          (listEntity) => listEntity.entity_id === entity.entity_id
        );
        if (removeIndex < 0) return;
        this.repository.other_group.entities.splice(removeIndex, 1);
      }
    },
    removeGroup(groupId) {
      const groupIndex = this.getGroupIndex(groupId);
      if (groupIndex < 0) return;
      this.repository.other_group.entities = this.repository.other_group.entities.concat(
        this.repository.groups[groupIndex].entities
      );
      this.repository.groups.splice(groupIndex, 1);
    },
    addedGroup(group) {
      this.repository.groups.push(group);
    },
    getGroupIndex(groupId) {
      return this.repository.groups.findIndex(
        (group) => group.group_id === groupId
      );
    },
    editGroups() {
      if (this.repository.new_group.entities.length > 0) {
        this.openModal = true;
      }
    },
    async createGroup() {
      if (!this.newGroupName || this.newGroupName.length === 0) return;
      this.loading = true;
      try {
        const newGroup = await this.addGroup({
          name: this.newGroupName,
          repositoryId: this.getSelectedVersionRepository,
          version: this.getSelectedVersion,
        });
        this.addedGroup({
          ...newGroup.data,
          entities: this.repository.new_group.entities,
          group_id: newGroup.data.id,
        });
        this.repository.new_group.entities.forEach((entity) => {
          this.editEntity({
            entityId: entity.entity_id,
            name: entity.value,
            repositoryVersion: this.getSelectedVersion,
            repositoryId: this.repositoryUuid,
            groupId: newGroup.data.id,
          });
        });
        this.openModal = false;
        this.repository.new_group.entities = [];
      } catch (e) {
        this.showError(e);
      } finally {
        this.loading = false;
      }
    },
    showError(error) {
      let message = this.$t('webapp.home.default_error');

      if (
        error.response
        && error.response.data
        && error.response.data.non_field_errors
        && error.response.data.non_field_errors.length > 0
      ) {
        message = error.response.data.non_field_errors.join(', ');
      }

      this.$buefy.toast.open({
        message,
        type: 'is-danger',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.repository-home {
  &__title {
    font-size: 1.75rem;
    font-weight: $font-weight-medium;
    display: flex;
    align-items: center;
    font-family: $font-family;
    color: $color-fake-black;

    div {
      margin: 0 0 0.2rem 0.2rem;
    }
  }

  &__header {
    display: flex;
    margin-bottom: 1rem;

    &__tag {
      margin: 0.5rem 2rem 1rem 0;
      font-size: 12px;
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-cloudy;
      background: $unnnic-color-neutral-lightest;
      display: inline-flex;
    }
  }

  &__description {
    padding: 0 0.5rem;
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-stack-xgiant;

    .unnnic-button {
      min-width: 245px;
    }

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-direction: column;

      &__integrate {
        background-color: $unnnic-color-brand-weni-soft;
        margin-left: auto;
      }
      &__remove-integrate {
        border: 1px solid $unnnic-color-feedback-red;
        color: $unnnic-color-feedback-red;
        background-color: $color-white;
        transition: 0.1s;
        margin-left: auto;

        &:hover {
          border: 1px solid $unnnic-color-feedback-red;
          background-color: $unnnic-color-feedback-red;
          color: $unnnic-color-background-snow;
        }
      }
    }

    &__text {
      margin: $unnnic-spacing-stack-sm 0;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-dark;
      ul li {
        list-style-type: disc;
      }
    }

    &__tags-wrapper {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
  }

  &__intents-list {
    margin-top: 2rem;
    padding: 1rem 0.5rem;
    &__header {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      align-items: center;
    }
  }

  &__divider {
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0;
  }

  &__tabs {
    margin-top: $unnnic-spacing-stack-lg;
  }
}
.tooltipStyle::after {
  font-size: 12px;
  line-height: 13px;
  padding: 1rem 0.5rem;
  font-family: $font-family;
}
.markdown-body {
  a {
    color: $color-primary;
    text-decoration: none;
  }

  hr {
    background: $color-primary;
    height: 2px;
  }

  h1,
  h2 {
    border-bottom: 1px solid $color-primary;
  }
}
.modal-header {
  text-align: left;
  margin-top: 2rem;
}
/deep/ .tab-head > .unnnic-tooltip {
  margin-left: 10px;

  & > .unnnic-tooltip-label {
    max-width: 360px;
  }
}
/deep/ .tab-head > .unnnic-tooltip-label {
  max-width: 360px;
}
</style>
