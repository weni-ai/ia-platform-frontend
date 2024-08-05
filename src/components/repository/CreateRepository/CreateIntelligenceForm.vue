<template>
  <UnnnicModalDialog
    :modelValue="true"
    class="create-intelligence-modal"
    showCloseIcon
    :title="$t('webapp.create_repository.intelligence')"
    size="md"
    :secondaryButtonProps="{
      text: $t('webapp.create_repository.cancel_create_intelligence_button'),
      'data-test': 'cancel-button',
    }"
    :primaryButtonProps="{
      text: $t('webapp.create_repository.create_intelligence_button'),
      disabled: disabledSubmit,
      loading: submitting,
      'data-test': 'submit-button',
    }"
    @secondary-button-click="tryToClose"
    @primary-button-click="createIntelligence"
    @update:model-value="tryToClose"
  >
    <section class="create-repository__container">
      <IntelligenceTab
        v-model:name="data.name"
        v-model:description="data.description"
        v-model:repositoryType="data.repository_type"
      />

      <ClassificationSpecificAttributes
        v-if="data.repository_type === 'classifier'"
        v-model:language="data.language"
        v-model:isPrivate="data.is_private"
        v-model:categories="data.categories"
        :repositoryType="data.repository_type"
      />

      <section
        v-if="data.repository_type === 'content'"
        class="brain-use-warning"
      >
        <UnnnicIcon
          icon="info"
          size="ant"
          filled
          scheme="aux-yellow-500"
        />

        <header>
          <h3>{{ $t('content_bases.brain_use_warning.title') }}</h3>

          <p>{{ $t('content_bases.brain_use_warning.description') }}</p>

          <RouterLink :to="{ name: 'router' }">
            {{ $t('content_bases.brain_use_warning.take_me_there') }}
          </RouterLink>
        </header>
      </section>
    </section>

    <CreateIntelligenceCancelModal
      v-if="isCancelCreateIntelligenceModalOpen"
      @close="isCancelCreateIntelligenceModalOpen = false"
      @cancel-create-intelligence="close"
    />
  </UnnnicModalDialog>
</template>

<script>
import { mapGetters } from 'vuex';
import IntelligenceTab from '@/components/repository/CreateRepository/IntelligenceTab.vue';
import ClassificationSpecificAttributes from '@/components/repository/CreateRepository/ClassificationSpecificAttributes.vue';
import CreateIntelligenceCancelModal from '@/components/repository/CreateRepository//CreateIntelligenceCancelModal.vue';
import repositoryV2 from '../../../api/v2/repository';
import { get } from 'lodash';

export default {
  name: 'CreateIntelligenceForm',

  components: {
    IntelligenceTab,
    ClassificationSpecificAttributes,
    CreateIntelligenceCancelModal,
  },

  emits: ['close'],

  data() {
    return {
      data: {
        language: '',
        is_private: true,
        categories: [],
        name: '',
        description: '',
        repository_type: 'classifier',
      },
      submitting: false,
      isCancelCreateIntelligenceModalOpen: false,
    };
  },
  computed: {
    ...mapGetters(['getOrgSelected']),

    isChanged() {
      if (this.data.repository_type === 'content') {
        return false;
      }

      const defaultData = {
        language: '',
        is_private: true,
        'categories.length': 0,
        name: '',
        description: '',
      };

      return Object.keys(defaultData).some(
        (attr) => get(defaultData, attr) !== get(this.data, attr),
      );
    },

    disabledSubmit() {
      if (this.data.repository_type === 'content') {
        return true;
      }

      return (
        !this.data.name ||
        !this.data.description ||
        !this.data.repository_type ||
        !this.data.language ||
        !this.data.categories.length
      );
    },
  },

  methods: {
    tryToClose() {
      if (this.isChanged) {
        this.isCancelCreateIntelligenceModalOpen = true;
      } else {
        this.close();
      }
    },

    close() {
      this.$emit('close');
    },

    async createIntelligence() {
      this.submitting = true;

      try {
        const response = await repositoryV2.create({
          organization: this.getOrgSelected,
          name: this.data.name,
          description: this.data.description,
          language: this.data.language,
          repository_type: this.data.repository_type,
          categories: this.data.categories,
          is_private:
            this.data.repository_type === 'classifier'
              ? this.data.is_private
              : true,
        });

        const { owner__nickname, slug } = response.data;

        this.$router.push({
          path: `/dashboard/${owner__nickname}/${slug}/`,
        });
      } catch (error) {
        const detail = get(error, 'response.data.detail', '');

        if (detail) {
          this.$store.state.alert = {
            type: 'error',
            text: detail,
          };
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.create-intelligence-modal {
  :deep(.unnnic-modal-dialog__container__content) {
    padding-bottom: $unnnic-spacing-sm;
  }

  :deep(.unnnic-modal-dialog__container__actions) {
    padding-top: $unnnic-spacing-sm;
  }
}

.create-repository__container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  row-gap: $unnnic-spacing-sm;

  &__indicator {
    width: 18%;
    margin-bottom: 3.2rem;
  }

  &__button {
    background-color: $unnnic-color-feedback-yellow;
  }
}

.brain-use-warning {
  padding: $unnnic-spacing-sm;
  background-color: $unnnic-color-aux-yellow-100;
  border-radius: $unnnic-border-radius-sm;
  display: flex;
  column-gap: $unnnic-spacing-xs;
  align-items: center;

  header {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-nano;

    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;

    h3 {
      margin: 0;

      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    a {
      $underlineOffset: 0.1875 * $unnnic-font-size;

      display: inline-flex;
      color: $unnnic-color-neutral-dark;
      font-weight: $unnnic-font-weight-bold;
      width: fit-content;

      text-decoration: underline;
      text-underline-offset: $underlineOffset;
    }
  }
}
</style>
