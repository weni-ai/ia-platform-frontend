<template>
  <PageContainer
    :title="$t('webapp.home.bases.adjustments')"
    :description="$t('webapp.home.bases.adjustments_subtitle')"
    @back="goToSummary"
  >
    <hr class="divider" />

    <section class="repository-adjustments">
      <UnnnicSkeletonLoading
        v-if="loadingIntelligence"
        class="unnnic-form"
        tag="div"
        width="100%"
        height="76px"
      />

      <UnnnicInput
        v-else
        :label="$t('webapp.create_repository.intelligence_name_label')"
        v-model="name"
      />

      <UnnnicSkeletonLoading
        v-if="loadingIntelligence"
        class="unnnic-form"
        tag="div"
        width="100%"
        height="76px"
      />

      <UnnnicInput
        v-else
        :label="$t('webapp.create_repository.description_label')"
        :placeholder="$t('')"
        v-model="description"
      />

      <section class="repository-adjustments__wrapper__buttons">
        <UnnnicButton
          type="tertiary"
          size="large"
          :text="$t('webapp.home.bases.adjustments_button_back')"
          class="repository-adjustments__buttons"
          @click="goToSummary"
        >
        </UnnnicButton>
        <UnnnicButton
          size="large"
          :text="$t('webapp.home.bases.adjustments_button')"
          @click="onSubmit()"
          :loading="submitting"
          :disabled="!hasUpdates"
          class="repository-adjustments__buttons"
        >
        </UnnnicButton>
      </section>
    </section>
    <UnnnicAlert
      v-if="isAlertOpen"
      :text="$t('webapp.home.bases.adjustments_modal_description')"
      scheme="feedback-green"
      @close="isAlertOpen = false"
    />
    <UnnnicModal
      :showModal="isDiscardModalOpen"
      scheme="feedback-yellow"
      modalIcon="alert-circle-1"
      :text="$t('webapp.home.bases.adjustuments_modal_alert_title')"
      :description="$t('webapp.home.bases.adjustments_modal_alert_description')"
      @close="isDiscardModalOpen = false"
    >
      <UnnnicButton
        slot="options"
        class="create-repository__container__button"
        type="tertiary"
        @click="discardUpdate()"
      >
        {{ $t('webapp.home.bases.adjustments_modal_alert_discard') }}
      </UnnnicButton>
      <UnnnicButton
        slot="options"
        class="create-repository__container__button"
        type="primary"
        scheme="feedback-yellow"
        @click="saveClose()"
        :loading="submitting"
      >
        {{ $t('webapp.home.bases.adjustments_modal_alert_save') }}
      </UnnnicButton>
    </UnnnicModal>
  </PageContainer>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import { mapActions } from 'vuex';
import Loading from '@/components/shared/Loading';
import Modal from '@/components/repository/CreateRepository/Modal';
import Repository from '@/models/repository';
import router from '@/router/index';
import RemoveBulmaMixin from '@/utils/RemoveBulmaMixin';
import PageContainer from '@/components/PageContainer';
import nexusaiAPI from '../../../api/nexusaiAPI';

export default {
  name: 'RepositoryContentAdjustment',
  data() {
    return {
      loadingIntelligence: false,

      name: '',
      description: '',

      intelligence: {
        name: '',
        description: '',
      },

      submitting: false,
      errors: {},
      isAlertOpen: false,
      isDiscardModalOpen: false,
      localNext: null,

      removePageExitAdvisor: null,
    };
  },
  mixins: [RemoveBulmaMixin],
  computed: {
    hasUpdates() {
      if (
        ['name', 'description'].some(
          (key) => this.intelligence[key] !== this[key],
        )
      ) {
        return true;
      }

      return false;
    },
  },
  components: {
    RepositoryViewBase,
    Loading,
    Modal,
    PageContainer,
  },

  mounted() {
    this.removePageExitAdvisor = router.beforeEach((to, from, next) => {
      if (this.hasUpdates) {
        this.isDiscardModalOpen = true;
        this.localNext = next;
      } else {
        next();
      }
    });
  },

  beforeDestroy() {
    this.removePageExitAdvisor();
  },

  watch: {
    '$route.params.intelligenceUuid': {
      immediate: true,

      handler() {
        this.loadingIntelligence = true;

        nexusaiAPI
          .readIntelligence({
            orgUuid: this.$store.state.Auth.connectOrgUuid,
            intelligenceUuid: this.$route.params.intelligenceUuid,
          })
          .then(({ data }) => {
            /*
              uuid
              content_bases_count: Number
              description: String
              name: String
            */

            this.$store.state.Repository.current = data;

            this.intelligence = data;

            this.name = data.name;
            this.description = data.description;
          })
          .finally(() => {
            this.loadingIntelligence = false;
          });
      },
    },
  },
  methods: {
    isEqualsArrays(arrayA, arrayB) {
      const exclusiveItems = [];

      arrayA.forEach((item) => {
        if (!arrayB.includes(item)) {
          exclusiveItems.push(item);
        }
      });

      arrayB.forEach((item) => {
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
    async onSubmit() {
      this.errors = {};

      try {
        this.submitting = true;

        const { data } = await nexusaiAPI.updateIntelligence({
          orgUuid: this.$store.state.Auth.connectOrgUuid,
          intelligenceUuid: this.$route.params.intelligenceUuid,
          name: this.name,
          description: this.description,
        });

        this.$store.state.Repository.current = data;

        this.intelligence.name = data.name;
        this.intelligence.description = data.description;

        this.submitting = false;
        this.isAlertOpen = true;
        return true;
      } catch (error) {
        const data = error.response && error.response.data;
        if (data) {
          this.errors = data;
        }
      } finally {
        this.submitting = false;
      }

      return false;
    },
    showModal(value) {
      this.isDiscardModalOpen = true;
      this.modalInfo = { ...value };
    },
    discardUpdate() {
      this.isDiscardModalOpen = false;

      if (this.localNext) {
        this.localNext();
      }
    },
    async saveClose() {
      await this.onSubmit();
      this.isDiscardModalOpen = false;

      if (this.localNext) {
        this.localNext();
      }
    },
    goToSummary() {
      this.$router.push(
        `/intelligences/${this.$route.params.intelligenceUuid}`,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: $unnnic-spacing-xs;
}

hr.divider {
  border-width: 0;
  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  margin: $unnnic-spacing-stack-lg 0;
  margin-top: $unnnic-spacing-stack-lg - $unnnic-border-width-thinner -
    $unnnic-spacing-md;
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
        font-family: 'Lato';
        font-size: 14px;
        color: #4e5666;
      }
    }

    h1 {
      font-family: 'Aleo';
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
