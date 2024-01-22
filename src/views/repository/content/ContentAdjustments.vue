<template>
  <page-container
    :title="$t('webapp.home.bases.adjustments')"
    :description="$t('webapp.home.bases.adjustments_subtitle')"
    @back="goToSummary"
  >
    <hr class="divider" />

    <section v-if="repository" class="repository-adjustments">
      <unnnic-skeleton-loading
        v-if="loadingIntelligence"
        class="unnnic-form"
        tag="div"
        width="100%"
        height="76px"
      />

      <unnnic-input
        v-else
        :label="$t('webapp.create_repository.intelligence_name_label')"
        :placeholder="$t('')"
        v-model="intelligence.name"
      />

      <unnnic-skeleton-loading
        v-if="loadingIntelligence"
        class="unnnic-form"
        tag="div"
        width="100%"
        height="76px"
      />

      <unnnic-input
        v-else
        :label="$t('webapp.create_repository.description_label')"
        :placeholder="$t('')"
        v-model="intelligence.description"
      />

      <!-- name and description -->

      <unnnic-skeleton-loading
        v-if="loadingIntelligence"
        class="unnnic-form"
        tag="div"
        width="100%"
        height="76px"
      />

      <section v-else class="repository-adjustments__wrapper__fields">
        <unnnic-label :label="$t('webapp.create_repository.language_label')" />
        <unnnic-select
          class="unnic--clickable"
          size="sm"
          :placeholder="$t('webapp.create_repository.language_placeholder')"
          v-model="intelligence.language"
          search
          :search-placeholder="$t('webapp.create_repository.language_placeholder_search')"
        >
          <option v-for="(language, key) in languages" :value="key" :key="key" size="sm">
            {{ language }}
          </option>
        </unnnic-select>
      </section>

      <section class="repository-adjustments__wrapper__fields">
        <unnnic-label :label="$t('webapp.create_repository.category_label')" />

        <div class="categories-list">
          <template v-if="categoryListLoading || loadingIntelligence">
            <unnnic-skeleton-loading
              v-for="i in 10"
              :key="i" tag="div"
              :width="80 + Math.floor(Math.random() * 40) + 'px'"
              height="32px"
            />
          </template>

          <unnnic-tag
            v-else
            v-for="category in categoryList"
            :key="category.id"
            :text="category.name"
            :disabled="intelligence.categories.includes(category.id)"
            @click.native="
              intelligence.categories =
                intelligence.categories.includes(category.id)
                ? intelligence.categories.filter((id) => id !== category.id)
                : [...intelligence.categories, category.id]
            "
            clickable
            type="brand"
          />
        </div>
      </section>
      <!-- categories -->
      <section class="repository-adjustments__wrapper__buttons">
        <unnnic-button
          type="tertiary"
          size="large"
          :text="$t('webapp.home.bases.adjustments_button_back')"
          class="repository-adjustments__buttons"
          @click="goToSummary"
        >
        </unnnic-button>
        <unnnic-button
          size="large"
          :text="$t('webapp.home.bases.adjustments_button')"
          @click="onSubmit()"
          :loading="submitting"
          :disabled="!hasUpdates"
          class="repository-adjustments__buttons"
        >
        </unnnic-button>
      </section>
    </section>
    <unnnic-alert
      v-if="isAlertOpen"
      :text="$t('webapp.home.bases.adjustments_modal_description')"
      scheme="feedback-green"
      seconds="5"
      @close="isAlertOpen = false"
    />
    <unnnic-modal
      :show-modal="openModal"
      scheme="feedback-yellow"
      modal-icon="alert-circle-1"
      :text="$t('webapp.home.bases.adjustuments_modal_alert_title')"
      :description="$t('webapp.home.bases.adjustments_modal_alert_description')"
      @close="openModal = false"
    >
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="tertiary"
        @click="discardUpdate()"
      >
        {{ $t("webapp.home.bases.adjustments_modal_alert_discard") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="primary"
        scheme="feedback-yellow"
        @click="saveClose()"
        :loading="submitting"
      >
        {{ $t("webapp.home.bases.adjustments_modal_alert_save") }}
      </unnnic-button>
    </unnnic-modal>
  </page-container>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import RepositoryBase from '../Base';
import { mapActions } from 'vuex';
import { LANGUAGES } from '@/utils/index';
import Loading from '@/components/shared/Loading';
import Modal from '@/components/repository/CreateRepository/Modal';
import Repository from '@/models/repository';
import router from '@/router/index';
import LoadRepository from '@/utils/LoadRepository';
import RemoveBulmaMixin from '@/utils/RemoveBulmaMixin';
import PageContainer from '@/components/PageContainer';

export default {
  name: 'RepositoryContentAdjustment',
  data() {
    return {
      intelligence: {
        name: '',
        description: '',
        repository_type: '',
        is_private: true,
        language: '',
        categories: []
      },

      categoryListLoading: false,
      categoryList: [],

      languages: LANGUAGES,
      submitting: false,
      errors: {},
      isAlertOpen: false,
      isDiscardModalOpen: false,
      openModal: false,
      localNext: null
    };
  },
  mixins: [LoadRepository, RemoveBulmaMixin],
  computed: {
    hasUpdates() {
      if (
        ['name', 'description', 'repository_type', 'is_private', 'language'].some(
          key => this.intelligence[key] !== this.repository[key]
        )
      ) {
        return true;
      }

      if (!this.isEqualsArrays(this.intelligence.categories, this.repository.categories)) {
        return true;
      }

      return false;
    }
  },
  components: {
    RepositoryViewBase,
    Loading,
    Modal,
    PageContainer,
  },
  extends: RepositoryBase,
  watch: {
    // eslint-disable-next-line
    "repository.is_private"() {
      this.setRealValues();
    },
    // eslint-disable-next-line
    "repository.name"() {
      this.setRealValues();
    },
    // eslint-disable-next-line
    "repository.description"() {
      this.setRealValues();
    },
    // eslint-disable-next-line
    "repository.repository_type"() {
      this.setRealValues();
    },
    // eslint-disable-next-line
    "repository.language"() {
      this.setRealValues();
    },
    // eslint-disable-next-line
    "repository.categories"() {
      this.setRealValues();
    }
  },
  methods: {
    isEqualsArrays(arrayA, arrayB) {
      const exclusiveItems = [];

      arrayA.forEach(item => {
        if (!arrayB.includes(item)) {
          exclusiveItems.push(item);
        }
      });

      arrayB.forEach(item => {
        if (!arrayA.includes(item)) {
          exclusiveItems.push(item);
        }
      });

      return exclusiveItems.length === 0;
    },

    setRealValues() {
      this.intelligence.is_private = this.repository.is_private;
      this.intelligence.name = this.repository.name;
      this.intelligence.description = this.repository.description;
      this.intelligence.repository_type = this.repository.repository_type;
      this.intelligence.language = this.repository.language;
      this.intelligence.categories = this.repository.categories;
    },

    ...mapActions(['getAllCategories', 'editRepository']),
    selectCategory(category) {
      this.intelligence.categories = category;
    },
    async getCategories() {
      this.categoryListLoading = true;
      try {
        const { data } = await this.getAllCategories();
        const sortedData = data.sort((previous, next) => previous.id - next.id);
        this.categoryList = sortedData;
      } catch (error) {
        this.$buefy.toast.open({
          message: error,
          type: 'is-danger'
        });
      } finally {
        this.categoryListLoading = false;
      }
    },
    async onSubmit() {
      this.submitting = true;
      this.errors = {};

      try {
        const response = await this.editRepository({
          ...this.intelligence,
          repositoryUuid: this.repository.uuid
        });
        this.submitting = false;
        this.isAlertOpen = true;
        this.repository = new Repository({ ...response.data });
        return true;
      } catch (error) {
        const data = error.response && error.response.data;
        if (data) {
          this.errors = data;
        }
        this.submitting = false;
      }

      return false;
    },
    showModal(value) {
      this.openModal = true;
      this.modalInfo = { ...value };
    },
    discardUpdate() {
      this.setRealValues();
      this.openModal = false;

      if (this.localNext) {
        this.localNext();
      }
    },
    async saveClose() {
      await this.onSubmit();
      this.openModal = false;

      if (this.localNext) {
        this.localNext();
      }
    },
    goToSummary() {
      this.$router.push(`/dashboard/${this.$route.params.ownerNickname}/${this.$route.params.slug}/content/bases`)
    }
  },
  mounted() {
    this.getCategories();
    router.beforeEach((to, from, next) => {
      if (this.hasUpdates) {
        this.openModal = true;
        this.localNext = next;
      } else {
        next();
      }
    });
  }
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: $unnnic-spacing-xs;
}

hr.divider {
  border-width: 0;
  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  margin: $unnnic-spacing-stack-lg 0;
  margin-top: $unnnic-spacing-stack-lg - $unnnic-border-width-thinner - $unnnic-spacing-md;
}

.repository-adjustments {
  &__title {
    font-size: 1.75rem;
    display: flex;
    align-items: center;
  }

  &__privacy {
    margin-bottom: $unnnic-inset-lg;

    &__cards {
      display: flex;
      justify-content: space-between;
      &__content {
        width: 48.8%;
      }
    }
  }
  &__wrapper {
    &__fields {
      margin-bottom: $unnnic-spacing-sm;
    }
  }
  &__description {
    &__title {
      display: flex;
      margin-bottom: $unnnic-spacing-sm;
    }

    &__subtitle {
      p {
        font-family: "Lato";
        font-size: 14px;
        color: #4e5666;
      }
    }

    h1 {
      font-family: "Aleo";
      font-size: 20px;
      color: #272b33;
    }

    &__back-button {
      cursor: pointer;
      margin-right: 1rem;
    }
  }
  &__wrapper {
    &__buttons {
      display: flex;
      justify-content: space-between;
      margin-top: $unnnic-inset-lg;
      gap: $unnnic-spacing-sm;
    }
  }
  &__buttons {
    width: 50%;
  }
}
::v-deep {
  .unnnic-select.unnic--clickable {
    width: 100%;
  }

  .input.size-md {
    height: auto;
  }

  .text-input.size--sm .icon-right {
    top: 15px;
  }
  .unnnic-form {
    margin-bottom: $unnnic-spacing-sm;
  }
}
</style>
