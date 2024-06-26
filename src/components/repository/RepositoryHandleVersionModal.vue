<template>
  <div class="repository-new-version-modal">
    <div class="repository-new-version-modal__container">
      <form @submit.prevent="onSubmit">
        <BField :label="$t('webapp.versions.title')">
          <BInput
            v-model="name"
            :maxlength="maxLength"
            :hasCounter="false"
            @input="onNameChange"
          />
        </BField>
        <BField :label="$t('webapp.versions.version')">
          <BInput
            :placeholder="version.name"
            disabled
          />
        </BField>
        <div class="field repository-new-version-modal__button-container">
          <BButton
            type="is-light"
            @click="onClose()"
            >{{ $t('webapp.versions.cancel') }}</BButton
          >
          <BButton
            :loading="loading"
            :disabled="!canSubmit"
            type="is-primary"
            nativeType="submit"
            >{{ $t('webapp.versions.add_new') }}</BButton
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { formatters } from '@/utils/index';

export default {
  name: 'RepositoryHandleVersionModal',
  props: {
    repository: {
      default: null,
      type: Object,
    },
    version: {
      default: null,
      type: Object,
    },
  },
  data() {
    return {
      maxLength: 40,
      submitting: false,
      name: null,
      loading: false,
    };
  },
  computed: {
    canSubmit() {
      return this.name && this.name.length > 0;
    },
  },
  methods: {
    ...mapActions(['addNewVersion']),
    onClose() {
      this.$emit('close');
    },
    onNameChange(value) {
      this.$nextTick(() => {
        this.name = formatters.versionItemKey()(value);
      });
    },
    async onSubmit() {
      this.loading = true;
      await this.addNewVersion({
        repositoryUUID: this.repository.uuid,
        versionUUID: this.version.id,
        name: this.name,
      })
        .then(() => {
          this.loading = false;
          this.$emit('addedVersion');
        })
        .catch((error) => {
          this.$emit('error', error);
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss">
@import '~@/assets/scss/utilities.scss';

.repository-new-version-modal {
  &__container {
    margin: 0 auto;
    max-width: $max-repository-card-width;
    min-width: 200px;
    padding: 1.75rem;
    border-radius: 8px;
    background-color: white;
  }

  &__button-container {
    margin: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
}
</style>
