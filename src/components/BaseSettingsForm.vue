<template>
  <modal-next
    :title="type === 'create' ? $t('bases.create.title') : $t('webapp.home.bases.adjustments')"
    max-width="600px"
  >
    <unnnic-form-element
      :label="$t('bases.create.form.name.label')"
      class="create-base__form-element"
    >
      <unnnic-input
        v-model="title"
        maxlength="25"
        :placeholder="$t('bases.create.form.name.placeholder')"
      />
    </unnnic-form-element>

    <unnnic-form-element
      :label="$t('bases.create.form.language.label')"
      class="create-base__form-element"
    >
      <unnnic-select-smart
        :value="[languages.find(({ value }) => value === language)]"
        @input="language = $event[0].value"
        :options="languages"
        ordered-by-index
      />
    </unnnic-form-element>

    <unnnic-form-element
      :label="$t('bases.create.form.description.label')"
      class="create-base__form-element"
    >
      <unnnic-text-area
        v-model="description"
        :max-length="80"
        class="create-base__description-textarea"
        :placeholder="$t('bases.create.form.description.placeholder')"
      />
    </unnnic-form-element>

    <div class="create-base__actions">
      <unnnic-button
        size="large"
        :text="$t('webapp.home.cancel')"
        type="tertiary"
        @click.prevent.stop="$emit('close')"
      />

      <unnnic-button
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
  </modal-next>
</template>

<script>
import nexusaiAPI from '../api/nexusaiAPI';
import ModalNext from './ModalNext';
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

      languages: [{
        value: 'pt-br',
        label: 'PT-BR',
      }, {
        value: 'en-us',
        label: 'EN-US',
      }, {
        value: 'es',
        label: 'ES',
      }],

      creatingNewBase: false,
    };
  },

  mounted() {
    const userLanguage = get(this.$store.state.User, 'me.language', '').toLowerCase();

    this.language = ['pt-br', 'en-us', 'es'].includes(userLanguage)
      ? userLanguage
      : 'pt-br';

    if (this.preFilledValues) {
      Object.keys(this.preFilledValues).forEach(name => {
        this.$set(this, name, this.preFilledValues[name]);
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
        this.type === 'edit'
        && Object.keys(this.preFilledValues)
          .every(name => this.preFilledValues[name] === this[name])
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
          const { data: contentBaseData } = await nexusaiAPI
            .createIntelligenceContentBase({
              intelligenceUuid: this.intelligenceUuid,
              title: this.title,
              language: this.language,
              description: this.description,
            });

          data = contentBaseData;
        } else {
          const { data: contentBaseData } = await nexusaiAPI
            .patchIntelligenceContentBase({
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
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.create-base__form-element + .create-base__form-element {
  margin-top: $unnnic-spacing-sm;
}

.create-base__description-textarea ::v-deep textarea {
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
