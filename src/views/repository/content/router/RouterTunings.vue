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
        v-if="['radio', 'select', 'slider'].includes(field.type)"
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

      <section
        :key="index"
        v-if="field.type === 'radio'"
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

      <UnnnicSlider
        v-if="field.type === 'slider'"
        :key="index"
        :minValue="field.min"
        :maxValue="field.max"
        :step="field.step"
        :initialValue="field.value"
        @valueChange="$set(values, field.name, Number($event))"
        class="tunings__form-element__slider"
      />

      <UnnnicSelectSmart
        v-if="field.type === 'select'"
        :key="index"
        :value="[{ value: field.value, label: field.value }]"
        @input="$set(values, field.name, $event[0].value)"
        :options="
          field.options.map((option) => ({ value: option, label: option }))
        "
        orderedByIndex
      />
    </template>

    <UnnnicDivider ySpacing="md" />

    <footer class="tunings__actions">
      <UnnnicButton type="secondary">
        {{ $t('router.tunings.restore_default') }}
      </UnnnicButton>

      <UnnnicButton :disabled="!hasChanged">
        {{ $t('router.tunings.save_changes') }}
      </UnnnicButton>
    </footer>
  </section>
</template>

<script>
import nexusaiAPI from '../../../../api/nexusaiAPI';

export default {
  data() {
    return {
      oldValues: {
        model: null,
        version: 'wenigpt-1',
      },

      values: {
        model: null,
      },

      models: [
        {
          name: 'WeniGPT',
          fields: [
            {
              type: 'select',
              name: 'version',
              default: 'wenigpt-1',
              options: ['wenigpt-1'],
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
          fields: [],
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

    hasChanged() {
      return this.fields.some((field) => {
        return field.value !== this.oldValues[field.name];
      });
    },
  },

  async created() {
    if (!this.values.model) {
      this.values.model = this.models[0].name;
    }

    const { data } = await nexusaiAPI.router.tunings.read({
      projectUuid: this.$store.state.Auth.connectProjectUuid,
    });

    this.$set(this.oldValues, 'model', data.model);
    this.$set(this.values, 'model', data.model);

    Object.keys(data.setup).forEach((name) => {
      const value = ['temperature', 'top_p', 'top_k'].includes(name)
        ? Number(data.setup[name])
        : data.setup[name];

      this.$set(this.oldValues, name, value);
      this.$set(this.values, name, value);
    });
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

.tunings__actions {
  display: flex;
  column-gap: $unnnic-spacing-md;

  > * {
    flex: 1;
  }
}
</style>
