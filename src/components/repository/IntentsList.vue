<template>
  <div class="intent-list">
    <div class="intent-list__content">
      <div class="intent-list__content__descriptions">
        <div @click="goToSummary" class="intent-list__content__back-button">
          <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
        </div>
        <h1>
          {{ $t("webapp.intent.title") }}
          <span> "{{ intentSelected }}" </span>
        </h1>
      </div>
      <div class="intent-list__buttons-wrapper">
        <unnnic-button
          ref="editIntentEvent"
          @click="editOptionsIntent()"
          class="mr-2"
          type="secondary"
          size="large"
          :text="$t('webapp.intent.edit_button')"
        />
        <unnnic-button
          @click="openDeleteModal = true"
          type="secondary"
          size="large"
          :text="`Excluir selecionados (${sentencesCounter})`"
          :disabled="sentencesCounter.length === 0"
        />
      </div>
    </div>
    <div class="intent-list__subtitle">
      <p>{{ $tc("webapp.intent.description", totalSentences) }}</p>
    </div>
    <unnnic-modal
      :showModal="openModal"
      :text="$t('webapp.intent.edit_intent_modal_title')"
      scheme="feedback-yellow"
      modal-icon="alert-circle-1"
      @close="openModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.intent.edit_intent_modal_subtitle', { intent: intentSelected })" />
      <div slot="message" class="text-left">
        <unnnic-input
          :placeholder="$t('webapp.intent.edit_intent_field_label')"
          v-model="newIntentName"
        >
          <span
            slot="label"
            v-html="$t('webapp.intent.edit_intent_field_title')"
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
        @click="saveEdition()"
      >
        {{ $t("webapp.intent.edit_intent_button_label") }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-modal
      :showModal="openSuccessModal"
      :text="$t('webapp.intent.success_modal_title')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.intent.success_modal_subtitle')" />
    </unnnic-modal>
    <unnnic-modal
      :showModal="openDeleteModal"
      :text="$t('webapp.trainings.delete_title')"
      scheme="feedback-red"
      modal-icon="alert-circle-1"
      @close="openDeleteModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.trainings.delete_phrase_modal')" />
      <unnnic-button slot="options" type="terciary" @click="openDeleteModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="deleteSelectedItems"
      >
        {{ $t("webapp.trainings.delete_title") }}
      </unnnic-button>
    </unnnic-modal>
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
      newIntentName: ''
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
        return this.selectedItems.length
      }
      return 0
    }
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
      this.openModal = true
    },
    async getSelectedIntent() {
      const intent = await this.repository.intents.find(
        (intentValue) => intentValue.id === Number(this.intentId)
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
        this.intentSelected = this.newIntentName
        this.openModal = false
        this.openSuccessModal = true
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
      });
    },
    goToSummary() {
      this.$router.push(`/dashboard/${this.$route.params.ownerNickname}/${this.$route.params.slug}/`)
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
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
      font-family: "Lato";
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
      font-family: "Aleo";
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
