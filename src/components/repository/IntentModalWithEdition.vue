<template>
  <!-- <section
    id="tour-inbox-step-4"
    :is-previous-disabled="true"
    :is-finish-disabled="true"
    class="modalStyle">
    <div
      class="modal-card modalStyle__content">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ titleHeader }}</p>
      </header>
      <section class="modal-card-body modalStyle__content__container">
        <edit-example-accordion
          ref="accordion"
          :pending-example="true"
          :entities="getLogData.entities"
          :intent-to-edit="info.intent.name"
          :text-to-edit="getLogData.text"
          :sentence-id="logData.id"
          :language-edit="getLogData.language"
          :get-all-entities="allEntities"
          :custom="true"
          :open="false"
          align="top"
          edit-example
          @cancel="editing = false"
          @saveList="onSaveList"
          @textInput="inputValues.text = $event"
          @entitiesInput="inputValues.entities = $event"
          @intentInput="inputValues.intent = $event"
        />
      </section>
      <footer class="modal-card-foot modalStyle__content__footer">
        <button
          class="button"
          type="button"
          @click="closeModal">{{ $t('webapp.inbox.add_log.close') }}</button>
        <button
          :disabled="checkInputs"
          class="button is-primary"
          @click="addIntent"> {{ $t('webapp.inbox.add_log.add') }}</button>
      </footer>
    </div>
  </section> -->
  <unnnic-modal
    :showModal="true"
    :text="titleHeader"
    @close="closeModal()"
  >
    <div slot="message">
      <edit-example-accordion
          ref="accordion"
          :pending-example="true"
          :entities="getLogData.entities"
          :intent-to-edit="info.intent.name"
          :text-to-edit="getLogData.text"
          :sentence-id="logData.id"
          :language-edit="getLogData.language"
          :get-all-entities="allEntities"
          :custom="true"
          :open="false"
          align="top"
          edit-example
          @cancel="editing = false"
          @saveList="onSaveList"
          @textInput="inputValues.text = $event"
          @entitiesInput="inputValues.entities = $event"
          @intentInput="inputValues.intent = $event"
        />
      </div>
      <unnnic-button slot="options" type="tertiary" @click.prevent.stop="closeModal()">
        {{ $t("webapp.inbox.add_log.close") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="secondary"
        @click.prevent.stop="addIntent"
        :disabled="checkInputs"
        :text="buttonLabel"
      />
  </unnnic-modal>
</template>

<script>

import EditExampleAccordion from '@/components/shared/accordion/EditExampleAccordion';

export default {
  name: 'IntentModalWithEdition',
  components: {
    EditExampleAccordion,
  },
  props: {
    repository: {
      type: Object,
      default: null,
    },
    info: {
      type: Object,
      required: true,
    },
    titleHeader: {
      type: String,
      default: '',
    },
    confidenceVerify: {
      type: Boolean,
      default: false,
    },
    logData: {
      type: Object,
      default: null,
      required: true,
    },
    buttonLabel: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      inputValues: {
        text: '',
        intent: '',
        entities: [],
      },
    };
  },
  computed: {
    allEntities() {
      return this.repository.entities.map(
        entityValue => entityValue.value,
      );
    },
    getLogData() {
      const { data } = this.logData;
      return data;
    },
    checkInputs() {
      if (this.inputValues.text !== '' && this.inputValues.intent !== '') return false;
      return true;
    },
  },
  mounted() {
    this.initInputValues();
  },
  methods: {
    initInputValues() {
      this.inputValues.text = this.getLogData.text;
      this.inputValues.intent = this.info.intent.name;
      this.inputValues.entities = this.getLogData.entities;
    },
    addIntent() {
      this.$emit('addedIntent', this.inputValues, this.titleHeader);
      this.$parent.close();
    },
    onSaveList() {
      this.$emit('updateList');
    },
    closeModal() {
      this.$emit('closeModal');
      this.$parent.close();
    },
  },
};
</script>
<style lang="scss" scoped>
 @import '~@/assets/scss/utilities.scss';

.modalStyle{
  display: flex;
  justify-content: center;
  align-items: center;

  &__content{
    min-width: $size-large + 50rem;
    min-height: $size-large + 23rem;

    &__container{
      display: flex;
      justify-content: center;
      align-items: center;
    }

      &__footer{
      display: flex;
      justify-content: flex-end;
      align-items: center;

      }
  }
}

.button{
    font-weight: bold;
}
p {
    font-weight: 600;
}

::v-deep  {
  .unnnic-modal-container-background-body-alert_icon,
  .unnnic-modal-container-background-body-close_icon {
    display: none;
  }
  .unnnic-modal-container-background-body-title {
    padding-top: 3rem;
  }
  .unnnic-modal-container-background-button {
    padding-top: 0
  }
  .unnnic-modal-container-background-body-description {
    padding-bottom: 1.5rem;
  }
  .unnnic-modal-container-background-body {
    min-height: 13.5rem;
  }
}
</style>
