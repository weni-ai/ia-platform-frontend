<template>
  <div class="migrate-intelligence-modal">
    <div class="modal-card migrate-intelligence-modal__modal-style">
      <section class="modal-card-body">
        <div class="migrate-intelligence-modal__fields text-left">
          <BField class="migrate-intelligence-modal__fields__inputs mb-1">
            <UnnnicInput
              v-model="authToken"
              :label="$t('webapp.migrate_intelligence.token_input')"
            />
          </BField>
          <BField class="migrate-intelligence-modal__fields__inputs">
            <UnnnicSelect
              v-model="languageSelect"
              :label="$t('webapp.migrate_intelligence.language')"
            >
              <option
                v-for="[language, label] in languages"
                :value="language"
                :key="language"
              >
                {{ label }}
              </option>
            </UnnnicSelect>
          </BField>
        </div>
      </section>
      <footer class="modal-card-foot mt-1 px-0">
        <div class="migrate-intelligence-modal__modal-style__style-button">
          <UnnnicButton
            size="large"
            type="tertiary"
            @click="dispatchCloseMigrateModal()"
          >
            {{ $t('webapp.migrate_intelligence.cancel') }}
          </UnnnicButton>
          <UnnnicButton
            size="large"
            :loading="isButtonLoading"
            :disabled="checkInputs"
            type="secondary"
            @click="dispatchMigrate()"
          >
            {{ $t('webapp.migrate_intelligence.migrate') }}
          </UnnnicButton>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { LANGUAGES } from '@/utils';

export default {
  name: 'ImportWitModal',
  props: {
    isModalVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      authToken: '',
      languageSelect: null,
      isButtonLoading: false,
    };
  },
  computed: {
    ...mapGetters(['authenticated', 'getSelectedVersion']),
    checkInputs() {
      if (this.authToken === '' || this.languageSelect === null) {
        return true;
      }

      return false;
    },
    languages() {
      return Object.keys(LANGUAGES).map((lang) => [lang, LANGUAGES[lang]]);
    },
  },
  methods: {
    ...mapActions(['setMigrateIntelligence']),
    async dispatchMigrate() {
      try {
        this.isButtonLoading = true;
        await this.setMigrateIntelligence({
          repositoryVersion: this.getSelectedVersion,
          AuthToken: this.authToken,
          Language: this.languageSelect,
          Classifier: 'wit',
        });
        this.$emit('dispatchMigrateNotification', {
          type: 'success',
          title: this.$t(
            'webapp.import_dataset.import_sentences_success_title',
          ),
          message: this.$t(
            'webapp.import_dataset.import_sentences_success_message',
          ),
        });
        this.dispatchCloseMigrateModal();
      } catch (error) {
        const errorMessage = error.response && error.response.data;
        const filterMessage = `${Object.keys(errorMessage)} - ${Object.values(
          errorMessage,
        )}`;
        // this.$emit('dispatchMigrateNotification', { type: 'is-danger', message: filterMessage });
        this.$emit('dispatchMigrateNotification', {
          type: 'error',
          title: this.$t('webapp.import_dataset.import_sentences_error_title'),
          message: this.$t(
            'webapp.import_dataset.import_sentences_error_message',
          ),
        });
      } finally {
        this.isButtonLoading = false;
      }
    },
    dispatchCloseMigrateModal() {
      this.authToken = '';
      this.languageSelect = null;
      this.$emit('dispatchCloseModal');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.migrate-intelligence-modal {
  &__modal-style {
    width: 100%;
    @media (max-width: $mobile-width) {
      padding-left: 5rem;
    }
    &__header {
      p {
        font-size: 1.5rem;
      }
    }

    &__style-button {
      width: 100%;
      display: grid;
      grid-gap: 2rem;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    }
  }
  &__fields {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__inputs {
      width: 100%;
    }
  }
}
.modal-card-foot,
.modal-card-body {
  background: #f9f9f9;
  border-top: none;
}

.modal-card-body {
  padding: 0;
}
:deep(.dropdown) {
  display: block;
}
</style>
