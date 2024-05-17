<template>
  <div class="intent-list">
    <div class="intent-list__content">
      <div class="intent-list__content__descriptions">
        <div
          @click="goToSummary"
          class="intent-list__content__back-button"
        >
          <UnnnicIconSvg
            icon="keyboard-arrow-left-1"
            size="md"
          />
        </div>
        <h1>
          {{ $t('webapp.intent.title') }}
          <span> "{{ intentSelected }}" </span>
        </h1>
      </div>
      <div
        v-if="repository.authorization.can_contribute"
        class="intent-list__buttons-wrapper"
      >
        <UnnnicButton
          ref="editIntentEvent"
          @click="editOptionsIntent()"
          class="mr-2"
          type="secondary"
          size="large"
          :text="$t('webapp.intent.edit_button')"
          iconLeft="pencil-write-1"
        />
        <UnnnicButton
          @click="openDeleteModal = true"
          type="secondary"
          size="large"
          :text="$tc('webapp.intent.delete_selected', sentencesCounter)"
          :disabled="sentencesCounter === 0"
          iconLeft="delete-1-1"
        />
      </div>
    </div>
    <div class="intent-list__subtitle">
      <p v-html="$tc('webapp.intent.description', totalSentences)" />
    </div>
    <UnnnicModal
      :showModal="openModal"
      :text="$t('webapp.intent.edit_intent_modal_title')"
      scheme="feedback-yellow"
      modalIcon="alert-circle-1"
      @close="openModal = false"
    >
      <span
        slot="message"
        v-html="
          $t('webapp.intent.edit_intent_modal_subtitle', {
            intent: intentSelected,
          })
        "
      />
      <div
        slot="message"
        class="text-left"
      >
        <UnnnicInput
          :placeholder="$t('webapp.intent.edit_intent_field_label')"
          v-model="newIntentName"
        >
          <span
            slot="label"
            v-html="$t('webapp.intent.edit_intent_field_title')"
          />
        </UnnnicInput>
      </div>
      <UnnnicButton
        slot="options"
        type="tertiary"
        @click="openModal = false"
      >
        {{ $t('webapp.home.cancel') }}
      </UnnnicButton>
      <UnnnicButton
        slot="options"
        class="create-repository__container__button"
        type="primary"
        scheme="feedback-yellow"
        @click="saveEdition()"
      >
        {{ $t('webapp.intent.edit_intent_button_label') }}
      </UnnnicButton>
    </UnnnicModal>
    <UnnnicModal
      :showModal="openSuccessModal"
      :text="successModalTitle"
      scheme="feedback-green"
      modalIcon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
        slot="message"
        v-html="successModalSubtitle"
      />
    </UnnnicModal>
    <UnnnicModal
      :showModal="openDeleteModal"
      :text="$t('webapp.trainings.delete_title')"
      scheme="feedback-red"
      modalIcon="alert-circle-1"
      @close="openDeleteModal = false"
    >
      <span
        slot="message"
        v-html="$t('webapp.trainings.delete_phrase_modal')"
      />
      <UnnnicButton
        slot="options"
        type="tertiary"
        @click="openDeleteModal = false"
      >
        {{ $t('webapp.home.cancel') }}
      </UnnnicButton>
      <UnnnicButton
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="deleteSelectedItems"
      >
        {{ $t('webapp.trainings.delete_title') }}
      </UnnnicButton>
    </UnnnicModal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { formatters } from '@/utils';

export default {
  name: 'IntentsList',
  props: {
    IntentsList: {
      type: Object,
      default: null,
    },
    repository: {
      type: Object,
      default: () => {},
    },
    selectedItems: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      editSentences: false,
      intentId: this.$route.params.intent,
      errors: {},
      intentSelected: '',
      deleteDialog: null,
      openModal: false,
      openSuccessModal: false,
      openDeleteModal: false,
      newIntentName: '',
      successModalTitle: '',
      successModalSubtitle: '',
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      repositoryList: 'getCurrentRepository',
    }),
    totalSentences() {
      if (this.IntentsList !== null) {
        return this.IntentsList.total;
      }
      return 0;
    },
    sentencesCounter() {
      if (this.selectedItems !== null) {
        return this.selectedItems.length;
      }
      return 0;
    },
  },
  watch: {
    intentSelected() {
      this.intentSelected = formatters.bothubItemKey()(this.intentSelected);
    },
  },
  mounted() {
    this.getSelectedIntent();
  },
  methods: {
    ...mapActions(['editIntentName', 'setUpdateRepository', 'deleteExample']),
    editOptionsIntent() {
      // this.editSentences = !this.editSentences;
      this.openModal = true;
    },
    async getSelectedIntent() {
      const intent = await this.repository.intents.find(
        (intentValue) => intentValue.id === Number(this.intentId),
      );
      this.intentSelected = intent.value;
    },
    async saveEdition() {
      try {
        await this.editIntentName({
          intentId: this.intentId,
          text: this.newIntentName,
          repositoryVersion: this.repositoryVersion,
        });
        this.$emit('saveEdition');
        this.intentSelected = this.newIntentName;
        this.openModal = false;
        this.openSuccessModal = true;
        this.successModalTitle = this.$t('webapp.intent.success_modal_title');
        this.successModalSubtitle = this.$t(
          'webapp.intent.success_modal_subtitle',
        );
      } catch (error) {
        this.$buefy.toast.open({
          message: this.$t('webapp.intent.error_intent'),
          type: 'is-danger',
        });
      }
      this.$emit('setAllEntities', this.allEntities);
    },
    deleteSelectedItems() {
      this.selectedItems.forEach((item) => {
        this.deleteExample({ id: item.id });
        this.$emit('itemDeleted');
        this.openDeleteModal = false;
        this.openSuccessModal = true;
        this.successModalTitle = this.$t('webapp.intent.delete_success_title');
        this.successModalSubtitle = this.$t(
          'webapp.intent.delete_success_subtitle',
        );
      });
    },
    goToSummary() {
      this.$router.push(
        `/dashboard/${this.$route.params.ownerNickname}/${this.$route.params.slug}/`,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
.intent-list {
  margin: 0.4rem;
  margin-left: 2.8rem;
  margin-bottom: 2rem;
  &__options {
    p {
      font-size: $font-size;
    }
  }

  &__subtitle {
    p {
      font-family: 'Lato';
      font-size: 14px;
      color: #4e5666;
    }
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__descriptions {
      display: flex;

      p {
        font-size: 20px;
        margin-left: 1rem;
        margin-top: -0.01rem;
        strong {
          font-size: 25px;
        }
      }

      &__tag {
        margin: 0.2rem 0.5rem;
        border-radius: 1rem;
        padding: 0 1.1rem;

        div {
          font-size: 1.12rem;
          font-family: $font-family;
          margin-bottom: 0.1rem;
        }
      }
      @media screen and (max-width: 40em) {
        display: flex;
        flex-direction: column;
      }

      &__edit-intent {
        margin: 0.2rem 0.5rem;
        width: 10rem;
      }
    }

    h1 {
      font-family: 'Aleo';
      font-size: 20px;
      color: #272b33;
    }

    &__back-button {
      cursor: pointer;
      margin-left: -2.5rem;
      margin-right: 1rem;
    }

    // &__button-edit{
    //   width: 9.9rem;
    //   margin-bottom:0.5rem;
    //   background-color: $color-primary;
    //   color: #FFFFFF;
    // }
    // &__button-save{
    //   width: 9.9rem;
    //   margin-bottom:0.5rem;
    //   background-color: $color-secondary-light;
    //   color: #FFFFFF;
    // }
  }

  &__notification {
    margin: 0.5rem;

    @media screen and (max-width: 50em) {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
  }

  &__buttons-wrapper {
    position: relative;
    top: 16px;
  }
}
</style>
