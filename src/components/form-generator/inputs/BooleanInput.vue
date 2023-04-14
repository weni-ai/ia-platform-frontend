<template>
    <section v-if="name === 'is_private'"
      class="intelligence-privacy"
    >
      <unnnic-label class="mt-0" :label="label" />
      <div class="intelligence-privacy__cards">
        <unnnic-card
          clickable
          :title="$t('webapp.create_repository.privacy_type_public_title')"
          :description="$t('webapp.create_repository.privacy_type_public_description')"
          type="content"
          icon="lock-unlock-1-1"
          class="intelligence-privacy__cards__content mr-4"
          :enabled="!value"
          @click.native="value = false"
        />

        <unnnic-card
          clickable
          :title="$t('webapp.create_repository.privacy_type_private_title')"
          :description="$t('webapp.create_repository.privacy_type_private_description')"
          type="content"
          icon="lock-2-1"
          class="intelligence-privacy__cards__content"
          :enabled="value"
          @click.native="value = true"
        />
      </div>
    </section>
    <div v-else class="is-flex">
      <unnnic-switch v-if="compact" textRight="Default" v-model="value" />
      <unnnic-switch v-else :textRight="label" v-model="value">
      </unnnic-switch>
      <unnnic-tool-tip
        side="top"
        :text="helpText"
        enabled
      >
        <unnnic-icon
          class="mt-1"
          icon="information-circle-4"
          size="sm"
          scheme="neutral-soft"
        />
      </unnnic-tool-tip>
    </div>
</template>

<script>

export default {
  props: {
    initialData: {
      type: Boolean,
      default: false,
    },
    compact: {
      type: Boolean,
      default: null,
    },
    label: {
      type: String,
      default: '',
    },
    helpText: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      value: this.initialData,
    };
  },
  computed: {
    verboseValue() {
      return this.value ? this.$t('webapp.layout.yes') : this.$t('webapp.layout.no');
    },
  },
  mounted() {
    this.update();
  },
  methods: {
    update() {
      this.$emit('input', this.value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

  .intelligence-privacy {
    margin-bottom: 2rem;

    &__cards {
      display: flex;
      justify-content: space-between;
      &__content {
        width: 50%;
      }
    }
  }
</style>
