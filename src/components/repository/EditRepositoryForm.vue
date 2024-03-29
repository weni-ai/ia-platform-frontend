<template>
  <form @submit.prevent="onSubmit()">
    <settings-tab-loading v-if="!formSchema" slot="loader" />
    <form-generator
      v-if="formSchema"
      :settings="true"
      :schema="formSchema"
      v-model="data"
      :errors="errors"
      :initial-data="initialData" />
    <div class="text-center">
        <unnnic-button
          v-if="formSchema"
          :disabled="submitting"
          native-type="submit"
          class="button--full"
          type="secondary"
          size="large"
        >
          {{ $t('webapp.settings.save') }}
        </unnnic-button>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'vuex';
import FormGenerator from '@/components/form-generator/FormGenerator';
import Loading from '@/components/shared/Loading';
import SettingsTabLoading from '@/views/repository/loadings/SettingsTab';


const components = {
  FormGenerator,
  Loading,
  SettingsTabLoading,
};

export default {
  name: 'EditRepositoryForm',
  components,
  props: {
    ownerNickname: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    initialData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      formSchema: null,
      data: {},
      submitting: false,
      errors: {},
    };
  },
  mounted() {
    this.initiateForms()
  },
  methods: {
    ...mapActions([
      'getEditRepositorySchema',
      'editRepository',
    ]),
    async initiateForms() {
      this.formSchema = await this.getEditRepositorySchema({
        repositoryUuid: this.$store.state.Repository.selectedRepository.uuid,
        repositoryVersion: this.$store.state.Repository.repositoryVersion,
      });
      delete this.formSchema.available_languages
      delete this.formSchema.repository_type
    },
    async onSubmit() {
      this.submitting = true;
      this.errors = {};

      try {
        const response = await this.editRepository({
          ...this.data,
          ownerNickname: this.ownerNickname,
          repositorySlug: this.slug,
          repositoryUuid: this.$store.state.Repository.selectedRepository.uuid,
        });
        this.$emit('edited', response.data);
        this.submitting = false;
        return true;
      } catch (error) {
        const data = error.response && error.response.data;
        if (data) {
          this.errors = data;
        }
        this.submitting = false;
      }

      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
.button--full {
  width: 100%;
}
</style>
