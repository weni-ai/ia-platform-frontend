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
        v-if="['radio', 'select'].includes(field.type) && !loadingData"
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
          @change="updateField(field.name, option)"
        >
          {{ option }}
        </UnnnicRadio>
      </section>

      <LoadingFormElement
        :key="index"
        v-if="field.type === 'radio' && loadingData"
        label
        elementHeight="32px"
        elementWidth="280px"
        marginTop="8px"
      />

      <UnnnicSelectSmart
        class="tunings__container_fields-element"
        v-if="field.type === 'select' && !loadingData"
        :key="index"
        :value="useSelectSmart(field).value"
        :options="useSelectSmart(field).options"
        @input="updateField(field.name, $event[0].value)"
        orderedByIndex
      />

      <LoadingFormElement
        :key="index"
        v-if="field.type === 'select' && loadingData"
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
        @input="updateField(field.name, $event)"
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
          @valueChange="updateField(field.name, Number($event))"
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
    </footer>
  </section>
</template>

<script>
import nexusaiAPI from '../../../../api/nexusaiAPI';
import LoadingFormElement from '../../../../components/LoadingFormElement.vue';
import RouterTuningsAdvanced from './RouterTuningsAdvanced.vue';

export default {
  props: {
    data: Object,
  },

  components: {
    RouterTuningsAdvanced,
    LoadingFormElement,
  },

  data() {
    return {
      restoring: false,
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
    updateField(name, value) {
      this.$set(this.$store.state.Brain.tunings, name, value);
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
      const languageOptions = {
        por: this.$t('router.tunings.fields.languages.pt_br'),
        eng: this.$t('router.tunings.fields.languages.en'),
        spa: this.$t('router.tunings.fields.languages.es'),
      };

      const handleLabel = (v) =>
        this.isLanguage(field.name) ? languageOptions[v] : v;

      const options = field.options.map((option) => ({
        value: option,
        label: handleLabel(option),
      }));

      const value = [options.find(({ value }) => value === field.value)];

      return {
        value,
        options,
      };
    },

    isLanguage(name = '') {
      return name === 'language';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
