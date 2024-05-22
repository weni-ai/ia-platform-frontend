<template>
  <section class="tunings__container">
    <UnnnicIntelligenceText
      color="neutral-dark"
      family="secondary"
      weight="bold"
      size="body-gt"
      marginTop="xs"
      tag="p"
    >
      {{ $t('router.tunings.model') }}
    </UnnnicIntelligenceText>

    <template v-for="(field, index) in fields">
      <UnnnicIntelligenceText
        :key="`language-${index}`"
        v-if="field.name === 'language'"
        color="neutral-dark"
        family="secondary"
        weight="bold"
        marginTop="md"
        size="body-gt"
        tag="p"
      >
        {{ $t('router.tunings.fields.select-language') }}
      </UnnnicIntelligenceText>
      <header
        v-if="['radio', 'select'].includes(field.type)"
        :key="`label-${index}`"
        class="tunings__form-element__label"
      >
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-gt"
          tag="p"
        >
          {{ $t(`router.tunings.fields.${field.name}`) }}
        </UnnnicIntelligenceText>
      </header>
      <section
        :key="index"
        v-if="field.type === 'radio' && !loadingData"
        class="tunings__form-element__radio"
      >
        <UnnnicRadio
          v-for="option in field.options"
          :key="option"
          :value="option"
          :globalValue="field.value"
          size="md"
          @change="$set(values, field.name, option)"
        >
          {{ option }}
        </UnnnicRadio>
      </section>
      <UnnnicSkeletonLoading
        :key="index"
        v-if="field.type === 'radio' && loadingData"
        tag="div"
        height="32px"
        width="280px"
      />
      <UnnnicSelectSmart
        class="tunings__container_fields-element"
        v-if="field.type === 'select' && !loadingData"
        :key="index"
        :value="handleSelectValue(field)"
        @input="$set(values, field.name, $event[0].value)"
        :options="handleSelectOptions(field)"
        orderedByIndex
      />
      <UnnnicSkeletonLoading
        :key="index"
        v-if="field.type === 'select' && loadingData"
        tag="div"
        height="46px"
      />
      <header
        v-if="['token'].includes(field.name)"
        :key="`label-${index}`"
        class="tunings__form-element__label"
      >
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-gt"
          tag="p"
        >
          {{ $t(`router.tunings.fields.${field.name}`) }}
        </UnnnicIntelligenceText>

        <UnnnicToolTip
          v-if="['token'].includes(field.name)"
          side="right"
          :text="$t(`router.tunings.fields.token_info`)"
          enabled
          maxWidth="29rem"
          class="tunings__form-element__label__tooltip"
        >
          <UnnnicIcon
            icon="info"
            size="sm"
            scheme="neutral-cleanest"
            filled
          />
        </UnnnicToolTip>
      </header>
      <UnnnicInput
        v-if="['token'].includes(field.name)"
        :key="index"
        :value="field.value"
        @input="$set(values, field.name, $event)"
        :type="hasValidate ? 'error' : 'normal'"
        :message="hasValidate ? $t('customization.invalid_field') : ''"
        :nativeType="field.type"
      />
    </template>

    <RouterTuningsAdvanced
      class="tunings__advanced"
      :brainOn.sync="data.brainOn"
    >
      <template v-for="(field, index) in fields">
        <UnnnicIntelligenceText
          :key="index"
          v-if="field.type === 'naf-header'"
          color="neutral-dark"
          family="secondary"
          weight="bold"
          size="body-gt"
          marginTop="md"
          tag="p"
        >
          {{ $t(`router.tunings.fields.${field.name}`) }}
        </UnnnicIntelligenceText>
        <header
          v-if="['slider'].includes(field.type)"
          :key="`label-${index}`"
          class="tunings__form-element__label"
        >
          <UnnnicIntelligenceText
            color="neutral-cloudy"
            family="secondary"
            size="body-gt"
            tag="p"
          >
            {{ $t(`router.tunings.fields.${field.name}`) }}
          </UnnnicIntelligenceText>

          <UnnnicToolTip
            v-if="['temperature', 'top_p', 'top_k'].includes(field.name)"
            side="top"
            :text="$t(`router.tunings.fields.${field.name}_info`)"
            enabled
            maxWidth="13rem"
            class="tunings__form-element__label__tooltip"
          >
            <UnnnicIcon
              icon="info"
              size="sm"
              scheme="neutral-cleanest"
              filled
            />
          </UnnnicToolTip>
        </header>
        <UnnnicSlider
          v-if="field.type === 'slider' && !loadingData"
          :key="index + ':' + field.value"
          :minValue="field.min"
          :maxValue="field.max"
          :minLabel="field.min?.toString()"
          :maxLabel="field.max?.toString()"
          :step="field.step"
          :initialValue="field.value"
          @valueChange="$set(values, field.name, Number($event))"
          class="tunings__form-element__slider"
        />
        <UnnnicSkeletonLoading
          :key="index"
          v-if="field.type === 'slider' && loadingData"
          tag="div"
          height="36px"
          width="384px"
        />
      </template>
    </RouterTuningsAdvanced>

    <UnnnicDivider ySpacing="md" />

    <footer class="tunings__actions">
      <UnnnicButton
        type="secondary"
        @click="openRestoreDefaultModal"
      >
        {{ $t('router.tunings.restore_default') }}
      </UnnnicButton>

      <UnnnicButton
        :disabled="!hasChanged || hasValidate"
        :loading="saving"
        @click="save"
      >
        {{ $t('router.tunings.save_changes') }}
      </UnnnicButton>
    </footer>
  </section>
</template>

<script>
import nexusaiAPI from '../../../../api/nexusaiAPI';
import RouterTuningsAdvanced from './RouterTuningsAdvanced.vue';
import { WENIGPT_OPTIONS } from '@/utils';
import { pick } from 'lodash';

export default {
  props: {
    data: Object,
  },

  components: {
    RouterTuningsAdvanced,
  },

  data() {
    return {
      restoring: false,
      saving: false,
      loadingData: false,

      oldValues: {
        model: null,
      },

      values: {
        model: null,
      },

      language_options: {
        por: this.$t('router.tunings.fields.languages.pt_br'),
        eng: this.$t('router.tunings.fields.languages.en'),
        spa: this.$t('router.tunings.fields.languages.es'),
      },

      models: [
        {
          name: 'WeniGPT',
          fields: [
            {
              type: 'select',
              name: 'version',
              default: Object.keys(WENIGPT_OPTIONS)[0],
              options: Object.keys(WENIGPT_OPTIONS),
            },
            {
              type: 'naf-header',
              name: 'parameter',
            },
            {
              type: 'slider',
              name: 'temperature',
              default: 0.1,
              step: 0.05,
              min: 0,
              max: 1,
            },
            {
              type: 'slider',
              name: 'top_p',
              default: 0.95,
              step: 0.05,
              min: 0,
              max: 1,
            },
            {
              type: 'slider',
              name: 'top_k',
              default: 10,
              step: 1,
              min: 1,
              max: 100,
            },
          ],
        },
        {
          name: 'ChatGPT',
          fields: [
            {
              type: 'select',
              name: 'version-gpt',
              default: 'gpt-4o',
              options: ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'],
            },
            {
              type: 'password',
              name: 'token',
            },
            {
              type: 'select',
              name: 'language',
              default: 'por',
              options: ['por', 'eng', 'spa'],
            },
            {
              type: 'naf-header',
              name: 'parameter',
            },
            {
              type: 'slider',
              name: 'temperature',
              default: 0.1,
              step: 0.05,
              min: 0,
              max: 1,
            },
            {
              type: 'slider',
              name: 'top_p',
              default: 0.95,
              step: 0.05,
              min: 0,
              max: 1,
            },
          ],
        },
      ],
    };
  },

  computed: {
    fields() {
      return [
        {
          type: 'radio',
          name: 'model',
          value: this.values.model,
          options: this.models.map(({ name }) => name),
        },
        ...this.models
          .find(({ name }) => name === this.values.model)
          .fields.map((field) => ({
            ...field,
            value: this.values[field.name] || field.default,
          })),
      ];
    },

    fieldsChangeds() {
      return this.fields
        .filter((field) => {
          return field.value !== this.oldValues[field.name];
        })
        .map((field) => ({ ...field, oldValue: this.oldValues[field.name] }));
    },

    hasChanged() {
      return !!this.fieldsChangeds.length;
    },

    hasValidate() {
      return !!this.fields.find((field) => {
        return field.type === 'text' && field.value === undefined;
      });
    },
  },

  async created() {
    try {
      this.loadingData = true;
      if (!this.values.model) {
        this.values.model = this.models[0].name;
      }

      const { data } = await nexusaiAPI.router.tunings.read({
        projectUuid: this.$store.state.Auth.connectProjectUuid,
      });

      this.setInitialValues(data);
    } finally {
      this.loadingData = false;
    }
  },

  methods: {
    openRestoreDefaultModal() {
      this.$store.state.modalWarn = {
        title: this.$t('router.tunings.restore_default_modal.title'),
        description: this.$t(
          'router.tunings.restore_default_modal.description',
        ),
        closeText: this.$t('router.tunings.restore_default_modal.cancel'),
        actionText: this.$t('router.tunings.restore_default_modal.restore'),
        loading: false,
        action: this.restoreDefault,
      };
    },

    setInitialValues(data) {
      this.$set(this.oldValues, 'model', data.model || this.values.model);
      this.$set(this.values, 'model', data.model || this.values.model);

      const handleName = (name) =>
        name === 'version' && data.model === 'ChatGPT' ? 'version-gpt' : name;
      const getValue = (name) => {
        const specialValues = ['temperature', 'top_p', 'top_k'];

        if (specialValues.includes(name)) {
          return Number(data.setup[name]);
        }

        if (name === 'version' && data.model === 'WeniGPT') {
          const option = Object.entries(WENIGPT_OPTIONS).find(
            ([_, value]) => value === data.setup[name],
          );
          return option ? option[0] : '';
        }

        return data.setup[name];
      };

      Object.keys(data.setup).forEach((name) => {
        this.$set(this.oldValues, handleName(name), getValue(name));
        this.$set(this.values, handleName(name), getValue(name));
      });
    },

    async restoreDefault() {
      try {
        this.$store.state.modalWarn.loading = true;

        const { data } = await nexusaiAPI.router.tunings.restoreDefault({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
        });

        this.setInitialValues(data);

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('router.tunings.default_restored'),
        };
      } finally {
        this.$store.state.modalWarn = null;
      }
    },

    handleSelectValue(field) {
      const label = this.isLanguage(field.name)
        ? this.language_options[field.value]
        : field.value;
      return [{ value: field.value, label }];
    },

    isLanguage(name = '') {
      return name === 'language';
    },

    handleSelectOptions(field) {
      const handleLabel = (v) =>
        this.isLanguage(field.name) ? this.language_options[v] : v;
      return field.options.map((option) => ({
        value: option,
        label: handleLabel(option),
      }));
    },

    async save() {
      try {
        this.saving = true;
        const handleFieldName = (name) =>
          name === 'version-gpt' ? 'version' : name;
        const handleFieldValue = (name, value) =>
          name === 'version' ? WENIGPT_OPTIONS[value] : value;
        const { data } = await nexusaiAPI.router.tunings.edit({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
          values: this.fields.reduce(
            (values, field) => ({
              ...values,
              [handleFieldName(field.name)]: handleFieldValue(
                field.name,
                field.value,
              ),
            }),
            {},
          ),
        });

        const fieldsChangeds = this.fieldsChangeds.map((field) =>
          pick(field, ['name', 'value', 'type']),
        );

        this.setInitialValues(data);

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('router.tunings.changes_saved'),
        };

        if (window.brainPreviewAddMessage) {
          fieldsChangeds.forEach((field) => {
            const name =
              {
                model: 'router.tunings.model',
              }[field.name] || `router.tunings.fields.${field.name}`;

            window.brainPreviewAddMessage({
              type: 'change',
              name,
              value:
                field.type === 'password'
                  ? field.value.replace(/./g, '•')
                  : field.value,
            });
          });
        }
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.tunings__form-element__label {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;
  margin-top: $unnnic-spacing-sm;
  margin-bottom: $unnnic-spacing-nano;

  &__tooltip {
    display: flex;
  }
}

.tunings__form-element__radio {
  display: flex;
  flex-wrap: wrap;
  gap: $unnnic-spacing-sm;
}

.tunings__form-element__slider {
  max-width: 24 * $unnnic-font-size;
}

.tunings__advanced {
  margin-top: $unnnic-spacing-md;
}

.tunings__actions {
  display: flex;
  column-gap: $unnnic-spacing-md;

  > * {
    flex: 1;
  }
}

.tunings__container_fields {
  display: flex;
  align-items: flex-start;
  gap: $unnnic-spacing-sm;
  align-self: stretch;

  &-element {
    width: 100%;
  }
}
</style>
