<template>
  <section class="tunings__container">
    <UnnnicIntelligenceText v-bind="titleProps">
      {{ $t('router.tunings.model') }}
    </UnnnicIntelligenceText>

    <template v-for="(field, index) in fields">
      <header
        v-if="field.type === 'radio' && !loadingData"
        :key="`label-${index}`"
        class="tunings__form-element__label"
      >
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          v-bind="labelProps"
        >
          {{ $t(`router.tunings.fields.${field.name}`) }}
        </UnnnicIntelligenceText>
      </header>
      <UnnnicIntelligenceText
        v-if="isRenderlabelVersion(field)"
        :key="index"
        v-bind="titleProps"
      >
        {{ $t(`router.tunings.fields.${field.name}`) }}
      </UnnnicIntelligenceText>
      <section
        v-if="field.type === 'radio' && !loadingData"
        :key="index"
        class="tunings__form-element__radio"
      >
        <UnnnicRadio
          v-for="option in field.options"
          :key="option"
          :modelValue="option"
          :value="field.value"
          size="md"
          @update:model-value="updateField(field.name, option)"
        >
          {{ handleModelOptionName(option) }}
        </UnnnicRadio>
      </section>

      <LoadingFormElement
        v-if="field.type === 'radio' && loadingData"
        :key="index"
        label
        elementHeight="32px"
        elementWidth="280px"
        marginTop="8px"
      />

      <UnnnicSelectSmart
        v-if="
          field.type === 'select' && !isOneOptionOwnModel(field) && !loadingData
        "
        :key="index"
        class="tunings__container_fields-element"
        :modelValue="useSelectSmart(field).value"
        :options="useSelectSmart(field).options"
        orderedByIndex
        @update:model-value="handleUpdateSelect(field.name, $event[0])"
      />

      <UnnnicIntelligenceText
        v-if="
          field.type === 'select' && isOneOptionOwnModel(field) && !loadingData
        "
        :key="index"
        color="neutral-cloudy"
        v-bind="labelProps"
      >
        {{ field.default.name || '-' }}
      </UnnnicIntelligenceText>

      <LoadingFormElement
        v-if="field.type === 'select' && loadingData"
        :key="index"
        label
        marginTop="16px"
      />

      <header
        v-if="['token'].includes(field.name)"
        :key="`label-${index}`"
        class="tunings__form-element__label"
      >
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          v-bind="labelProps"
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
        :modelValue="field.value"
        :type="hasValidate ? 'error' : 'normal'"
        :message="hasValidate ? $t('customization.invalid_field') : ''"
        :nativeType="field.type"
        @update:model-value="updateField(field.name, $event)"
      />
    </template>

    <RouterTuningsAdvanced
      v-model:brainOn="data.brainOn"
      class="tunings__advanced"
    >
      <template
        v-for="(field, index) in isDisableAdvancedOptions ? [] : fields"
      >
        <UnnnicIntelligenceText
          v-if="field.type === 'naf-header'"
          :key="index"
          color="neutral-dark"
          weight="bold"
          marginTop="md"
          v-bind="labelProps"
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
            v-bind="labelProps"
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
          class="tunings__form-element__slider"
          @value-change="updateField(field.name, Number($event))"
        />
        <UnnnicSkeletonLoading
          v-if="field.type === 'slider' && loadingData"
          :key="index"
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
    </footer>
  </section>
</template>

<script>
import nexusaiAPI from '../../api/nexusaiAPI';
import LoadingFormElement from '../../components/LoadingFormElement.vue';
import RouterTuningsAdvanced from './RouterTuningsAdvanced.vue';

export default {
  components: {
    RouterTuningsAdvanced,
    LoadingFormElement,
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
      required: false,
    },
  },

  data() {
    return {
      restoring: false,
      isDisableAdvancedOptions: true,
      titleProps: {
        color: 'neutral-dark',
        family: 'secondary',
        weight: 'bold',
        size: 'body-gt',
        marginTop: 'xs',
        tag: 'p',
      },
      labelProps: {
        family: 'secondary',
        size: 'body-gt',
        tag: 'p',
      },
    };
  },

  computed: {
    loadingData() {
      return this.$store.state.Brain.tuningsStatus === 'loading';
    },

    fields() {
      return this.$store.getters.brainTuningsFields;
    },

    hasValidate() {
      return !!this.fields.find((field) => {
        return field.type === 'text' && field.value === undefined;
      });
    },
  },

  mounted() {
    this.$store.dispatch('loadBrainTunings');
  },

  methods: {
    isOneOptionOwnModel(field) {
      return field?.options && field?.options?.length === 1;
    },

    isRenderlabelVersion(field) {
      if (this.isOwnModel(field.name))
        return (
          field.type === 'select' &&
          this.isOneOptionOwnModel(field) &&
          !this.loadingData
        );
      return field.type === 'select' && !this.loadingData;
    },

    updateField(name, value) {
      const validFields = this.fields.map((field) => field.name);
      if (validFields.includes(name)) {
        this.$store.commit('updateTuning', { name, value });
      }
    },

    handleUpdateSelect(name, obj) {
      if (this.isOwnModel()) return this.updateField(name, obj);
      return this.updateField(name, obj.value);
    },

    handleModelOptionName(option) {
      return option === 'WeniGPT'
        ? this.$t('router.tunings.model_name')
        : option;
    },

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

    async restoreDefault() {
      try {
        this.$store.state.modalWarn.loading = true;

        const { data } = await nexusaiAPI.router.tunings.restoreDefault({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
        });

        this.$store.commit('setBrainTuningsInitialValues', data);

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('router.tunings.default_restored'),
        };
      } finally {
        this.$store.state.modalWarn = null;
      }
    },

    useSelectSmart(field) {
      const handleLabel = (v) => {
        if (this.isOwnModel(field.name)) return v.name;

        return v;
      };

      const options = field.options.map((option) => ({
        value: this.isOwnModel(field.name) ? option.name : option,
        label: handleLabel(option),
        description: this.isOwnModel(field.name)
          ? this.$t(option.description)
          : null,
      }));
      const conditionValue = (value) =>
        typeof field.value === 'string'
          ? value === field.value
          : value === field.value.name;
      const value = [options.find(({ value }) => conditionValue(value))];

      return {
        value,
        options,
      };
    },

    isOwnModel(name = '') {
      return name === 'version';
    },
  },
};
</script>

<style lang="scss" scoped>
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
