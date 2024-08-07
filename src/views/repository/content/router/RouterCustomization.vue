<template>
  <section class="customization__container">
    <div class="customization__container__persona">
      <section>
        <p class="customization-title">{{ $t('customization.title') }}</p>
        <p class="customization-sub_title">
          {{ $t('customization.sub_title') }}
        </p>
      </section>
      <div class="customization__form">
        <UnnnicFormElement
          :label="$t('customization.fields.name')"
          class="customization__form-element"
        >
          <UnnnicInput
            v-model="brain.agent.name.current"
            :placeholder="$t('customization.placeholders.name')"
          />
        </UnnnicFormElement>
      </div>
      <div class="customization__form">
        <UnnnicFormElement
          :label="$t('customization.fields.occupation')"
          class="customization__form-element"
        >
          <UnnnicInput
            v-model="brain.agent.role.current"
            :placeholder="$t('customization.placeholders.occupation')"
          />
        </UnnnicFormElement>
        <UnnnicFormElement
          :label="$t('customization.fields.personality')"
          class="customization__form-element"
        >
          <UnnnicSelectSmart
            :value="handlePersonalityValue(brain.agent.personality.current)"
            @input="brain.agent.personality.current = $event[0].value"
            :options="personalities"
            orderedByIndex
          />
        </UnnnicFormElement>
      </div>
      <div class="customization__container__persona">
        <UnnnicTextArea
          v-bind="$props"
          v-model="brain.agent.goal.current"
          :label="$t('customization.fields.goal')"
          :placeholder="$t('customization.placeholders.goal')"
        />
      </div>
    </div>

    <div class="customization__container__instructions">
      <section>
        <p class="customization-title">
          {{ $t('customization.instructions.title') }}
        </p>
        <p class="customization-sub_title">
          {{ $t('customization.instructions.sub_title') }}
        </p>
      </section>
      <section
        class="customization__instructions"
        v-for="(instruction, index) in brain.instructions.current"
        :key="index"
      >
        <UnnnicFormElement
          :label="$t('customization.fields.instruction')"
          class="customization__instructions-element"
        >
          <section class="customization__instructions__form_group">
            <UnnnicInput
              v-model="instruction.instruction"
              :placeholder="$t('customization.placeholders.instruction')"
            />
            <UnnnicButtonIcon
              v-bind="$props"
              icon="delete-1-1"
              class="btn-color"
              size="small"
              @click="handleShowRemoveModal(index)"
            />
          </section>
        </UnnnicFormElement>
      </section>

      <UnnnicButton
        @click="addInstruction"
        size="large"
        :text="$t('customization.instructions.add_instruction_btn')"
        type="tertiary"
        iconLeft="add-1"
        :disabled="false"
      />
    </div>
    <UnnnicModalNext
      type="alert"
      icon="error"
      scheme="feedback-red"
      :title="$t('customization.instructions.modals.title')"
      :description="$t('customization.instructions.modals.description')"
      :actionPrimaryLabel="$t('customization.instructions.modals.remove_btn')"
      :actionSecondaryLabel="$t('customization.instructions.modals.back_btn')"
      v-show="showRemoveModal"
      @close="showRemoveModal = false"
      @click-action-primary="removeInstruction"
      :actionPrimaryLoading="removing"
    />
  </section>
</template>

<script>
import nexusaiAPI from '../../../../api/nexusaiAPI';

export default {
  data() {
    return {
      currentInstruction: 0,
      showRemoveModal: false,
      saving: false,
      removing: false,
      personalities: [
        {
          label: this.$t('customization.fields.personalities.friendly'),
          value: 'Amigável',
        },
        {
          label: this.$t('customization.fields.personalities.cooperative'),
          value: 'Cooperativo',
        },
        {
          label: this.$t('customization.fields.personalities.extrovert'),
          value: 'Extrovertido',
        },
        {
          label: this.$t('customization.fields.personalities.generous'),
          value: 'Generoso',
        },
        {
          label: this.$t('customization.fields.personalities.relaxed'),
          value: 'Relaxado',
        },
        {
          label: this.$t('customization.fields.personalities.organized'),
          value: 'Organizado',
        },
        {
          label: this.$t('customization.fields.personalities.systematic'),
          value: 'Sistemático',
        },
        {
          label: this.$t('customization.fields.personalities.innovative'),
          value: 'Inovador',
        },
        {
          label: this.$t('customization.fields.personalities.creative'),
          value: 'Criativo',
        },
        {
          label: this.$t('customization.fields.personalities.intellectual'),
          value: 'Intelectual',
        },
      ],
    };
  },

  computed: {
    brain() {
      return this.$store.state.Brain;
    },
  },

  mounted() {
    this.$store.dispatch('loadBrainCustomization');
  },

  methods: {
    addInstruction() {
      this.brain.instructions.current.push({
        instruction: '',
      });
    },
    handleShowRemoveModal(index) {
      this.showRemoveModal = true;
      this.currentInstruction = index;
    },
    handlePersonalityValue(value) {
      if (!value) {
        return [this.personalities[0]];
      }

      const personality = this.personalities.find((e) => value === e.value);

      return [personality];
    },
    async removeInstruction() {
      try {
        this.removing = true;
        if (this.brain.instructions.current[this.currentInstruction].id) {
          await nexusaiAPI.router.customization.delete({
            projectUuid: this.$store.state.Auth.connectProjectUuid,
            id: this.brain.instructions.current[this.currentInstruction].id,
          });
        }
        this.brain.instructions.current.splice(this.currentInstruction, 1);

        this.showRemoveModal = false;
        this.currentInstruction = null;

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('customization.instructions.modals.success_message'),
        };

        if (this.brain.instructions.current.length === 0) {
          this.addInstruction();
        }
      } catch (e) {
        this.$store.state.alert = {
          type: 'error',
          text: this.$t('customization.instructions.modals.error_message'),
        };
      } finally {
        this.removing = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.customization {
  &-title {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-line-height-md;
    padding-bottom: $unnnic-spacing-xs;
  }

  &-sub_title {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-line-height-md;
  }

  &__container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    gap: $unnnic-spacing-md;

    &__persona {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-sm;

      &__label {
        margin-bottom: $unnnic-spacing-nano;
      }
    }

    &__instructions {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: $unnnic-spacing-sm;
      align-self: stretch;

      button {
        width: 100%;
      }
    }
  }

  &__form {
    display: flex;
    align-items: flex-start;
    gap: $unnnic-spacing-sm;
    align-self: stretch;

    &-element {
      width: 100%;
    }
  }

  &__personality {
    display: flex;
    flex-wrap: wrap;
    gap: $unnnic-spacing-xs;

    &__item {
      display: flex;
      padding: $unnnic-spacing-xs $unnnic-spacing-ant;
      border-radius: $unnnic-border-radius-sm;
      border: 1px solid $unnnic-color-neutral-cleanest;
      background-color: $unnnic-color-neutral-lightest;
      flex-direction: column;
      align-items: flex-start;
      cursor: pointer;

      p {
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        font-weight: $unnnic-font-weight-regular;
        line-height: $unnnic-line-height-md;
      }
    }

    &-selected,
    :hover {
      border-color: $unnnic-color-weni-300;
      background-color: $unnnic-color-weni-100;
    }
  }

  &__instructions {
    width: 100%;

    &__form_group {
      display: grid;
      grid-template-columns: 11.6fr 0.4fr;
      gap: $unnnic-spacing-nano;

      button {
        background-color: $unnnic-color-neutral-white !important;
      }
    }

    &-element {
      width: 100%;
    }
  }
}
</style>
