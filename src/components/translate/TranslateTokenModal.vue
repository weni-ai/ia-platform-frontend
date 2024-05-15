<template>
  <UnnnicModal
    :text="$t('webapp.translate.share_title')"
    :showModal="open"
    :closeIcon="false"
  >
    <span
      slot="message"
      v-html="$t('webapp.translate.share_subtitle')"
    />
    <div slot="message">
      <div class="token-modal">
        <div class="token-modal__content">
          <PaginatedList
            :urlGenerator="urlGenerator"
            :itemComponent="itemComponent"
            :list="list"
            :perPage="4"
            class="token-modal__content__pagination"
            @deleted="onDelete"
          />
          <div class="token-modal__create">
            <p @click="createToken()">
              {{ $t('webapp.translate.create_new_token') }}
            </p>
          </div>
        </div>
        <UnnnicButton
          :text="$t('webapp.translate.ok')"
          class="token-modal__footer__button"
          type="secondary"
          @click="onClose()"
        />
      </div>
    </div>
  </UnnnicModal>
</template>

<script>
import PaginatedList from '@/components/shared/PaginatedList';
import TranslateTokenListItem from '@/components/translate/TranslateTokenListItem';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'TokenModal',
  components: {
    PaginatedList,
  },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    repositoryUuid: {
      type: String,
      required: true,
    },
    urlGenerator: {
      type: Function,
      default: (token) => token,
    },
    language: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      list: null,
      itemComponent: TranslateTokenListItem,
      loading: false,
    };
  },
  computed: {
    ...mapGetters(['getSelectedVersion']),
  },
  watch: {
    open() {
      if (!this.list && this.open) this.loadTokens();
    },
  },
  methods: {
    ...mapActions([
      'getExternalTokens',
      'createExternalToken',
      'deleteExternalToken',
    ]),
    onClose() {
      this.$emit('update:open', false);
    },
    async onDelete(uuid) {
      await this.deleteExternalToken({ uuid });
      this.loadTokens();
    },
    async loadTokens() {
      this.list = await this.getExternalTokens({
        repositoryUuid: this.repositoryUuid,
        limit: 4,
      });
    },
    async createToken() {
      this.loading = true;
      try {
        await this.createExternalToken({
          repositoryVersion: this.getSelectedVersion,
          language: this.language,
        });
        this.loadTokens();
      } catch (e) {
        this.$buefy.toast.open({
          message: this.$t('webapp.trainings.default_error'),
          type: 'is-danger',
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.token-modal {
  // overflow: hidden;
  border-radius: $radius-medium;
  font-family: $font-family;

  &__content {
    padding: 0.5rem 0.5rem;
    max-height: 500px;
    overflow-y: auto;

    &__pagination {
      padding: 0 2rem;
    }
  }

  &__subtitle {
    font-size: 1rem;
    text-align: center;
    margin: auto;
    margin-bottom: $between-subtitle-content;
    width: 60%;
  }

  &__header {
    font-size: 1.5rem;
    font-weight: $font-weight-medium;
    color: $color-fake-black;
    margin-bottom: $between-title-subtitle;
  }

  &__header,
  &__footer {
    display: flex;
    justify-content: center;
    background-color: $color-grey-light;
    padding: 1.5rem 2rem;
    border: 1px solid $color-grey;

    &__button {
      width: 100%;
    }
  }

  &__create {
    display: flex;
    justify-content: center;
    margin: 0.5rem 0;
    font-weight: $font-weight-bolder;
    text-decoration: underline;
    cursor: pointer;
  }
  &__create:hover {
    color: $color-fake-black;
  }
}
</style>
