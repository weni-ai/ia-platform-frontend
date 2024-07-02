<template>
  <ModalNext
    :title="
      type === 'create'
        ? $t('bases.create.title')
        : $t('webapp.home.bases.adjustments')
    "
    maxWidth="600px"
  >
    <UnnnicFormElement
      :label="$t('bases.create.form.name.label')"
      class="create-base__form-element"
    >
      <UnnnicInput
        v-model="title"
        maxlength="25"
        :placeholder="$t('bases.create.form.name.placeholder')"
      />
    </UnnnicFormElement>

    <UnnnicFormElement
      :label="$t('bases.create.form.language.label')"
      class="create-base__form-element"
    >
      <UnnnicSelectSmart
        :modelValue="[languages.find(({ value }) => value === language)]"
        @update:model-value="language = $event[0].value"
        :options="languages"
        orderedByIndex
      />
    </UnnnicFormElement>

    <UnnnicFormElement
      :label="$t('bases.create.form.description.label')"
      class="create-base__form-element"
    >
      <UnnnicTextArea
        v-model="description"
        :maxLength="80"
        class="create-base__description-textarea"
        :placeholder="$t('bases.create.form.description.placeholder')"
      />
    </UnnnicFormElement>

    <div class="create-base__actions">
      <UnnnicButton
        size="large"
        :text="$t('webapp.home.cancel')"
        type="tertiary"
        @click.prevent.stop="$emit('close')"
      />

      <UnnnicButton
        size="large"
        :text="
          type === 'create'
            ? $t('webapp.home.bases.new_knowledge_base')
            : $t('webapp.home.bases.adjustments_button')
        "
        type="primary"
        @click="createNewBase"
        :disabled="disabledSave"
        :loading="creatingNewBase"
      />
    </div>
  </ModalNext>
</template>

<script>
import nexusaiAPI from '../api/nexusaiAPI';
import ModalNext from './ModalNext.vue';
import { get } from 'lodash';

export default {
  props: {
    intelligenceUuid: String,
    contentBaseUuid: String,
    preFilledValues: Object,
  },

  components: {
    ModalNext,
  },

  data() {
    return {
      title: '',
      language: 'pt-br',
      description: '',

      languages: [
        {
          value: 'pt-br',
          label: 'PT-BR',
        },
        {
          value: 'en-us',
          label: 'EN-US',
        },
        {
          value: 'es',
          label: 'ES',
        },
      ],

      creatingNewBase: false,
    };
  },

  mounted() {
    const userLanguage = get(
      this.$store.state.User,
      'me.language',
      '',
    ).toLowerCase();

    this.language = ['pt-br', 'en-us', 'es'].includes(userLanguage)
      ? userLanguage
      : 'pt-br';

    if (this.preFilledValues) {
      Object.keys(this.preFilledValues).forEach((name) => {
        this.name = this.preFilledValues[name];
      });
    }
  },

  computed: {
    type() {
      if (this.contentBaseUuid) {
        return 'edit';
      }

      return 'create';
    },

    disabledSave() {
      if (!this.title || !this.description) {
        return true;
      }

      if (
        this.type === 'edit' &&
        Object.keys(this.preFilledValues).every(
          (name) => this.preFilledValues[name] === this[name],
        )
      ) {
        return true;
      }

      return false;
    },
  },

  methods: {
    async createNewBase() {
      try {
        this.creatingNewBase = true;

        let data;

        if (this.type === 'create') {
          const { data: contentBaseData } =
            await nexusaiAPI.createIntelligenceContentBase({
              intelligenceUuid: this.intelligenceUuid,
              title: this.title,
              language: this.language,
              description: this.description,
            });

          data = contentBaseData;
        } else {
          const { data: contentBaseData } =
            await nexusaiAPI.patchIntelligenceContentBase({
              intelligenceUuid: this.intelligenceUuid,
              contentBaseUuid: this.contentBaseUuid,
              title: this.title,
              language: this.language,
              description: this.description,
            });

          data = contentBaseData;
        }

        this.$emit('close');
        this.$emit('success', data);
      } finally {
        this.creatingNewBase = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.create-base__form-element + .create-base__form-element {
  margin-top: $unnnic-spacing-sm;
}

.create-base__description-textarea :deep(textarea) {
  display: block;
  min-height: 4.6875 * $unnnic-font-size;
  outline-style: solid;
  outline-color: $unnnic-color-neutral-soft;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;
  color: $unnnic-color-neutral-dark;
  caret-color: $unnnic-color-neutral-clean;

  &::placeholder {
    color: $unnnic-color-neutral-cleanest;
    opacity: 1; /* Firefox */
  }

  &:focus {
    outline-color: $unnnic-color-neutral-clean;
  }
}

.create-base__actions {
  display: flex;
  margin-top: $unnnic-spacing-lg;
  column-gap: $unnnic-spacing-sm;

  & > * {
    flex: 1;
  }
}
</style>
