<template>
  <unnnic-modal :showModal="open" :can-cancel="false" width="650px" @close="onClose()">
    <div class="token-modal">
      <h2 class="token-modal__header has-text-centered">
        {{ $t("webapp.translate.share_title") }}
      </h2>
      <div class="token-modal__content">
        <p class="token-modal__subtitle has-text-centered">
          {{ $t("webapp.translate.share_subtitle") }}
        </p>
        <paginated-list
          :url-generator="urlGenerator"
          :item-component="itemComponent"
          :list="list"
          :per-page="4"
          class="token-modal__content__pagination"
          @deleted="onDelete"
        />
        <div class="token-modal__create">
          <p @click="createToken()">{{ $t("webapp.translate.create_new_token") }}</p>
        </div>
      </div>
      <div class="token-modal__footer">
        <unnnic-button
          :text="$t('webapp.translate.ok')"
          class="token-modal__footer__button"
          @click="onClose()"
        />
      </div>
    </div>
  </unnnic-modal>
</template>

<script>
import PaginatedList from '@/components/shared/PaginatedList';
import TranslateTokenListItem from '@/components/translate/TranslateTokenListItem';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'TokenModal',
  components: {
    PaginatedList
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    repositoryUuid: {
      type: String,
      required: true
    },
    urlGenerator: {
      type: Function,
      default: token => token
    },
    language: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      list: null,
      itemComponent: TranslateTokenListItem,
      loading: false
    };
  },
  computed: {
    ...mapGetters(['getSelectedVersion'])
  },
  watch: {
    open() {
      if (!this.list && this.open) this.loadTokens();
    }
  },
  methods: {
    ...mapActions(['getExternalTokens', 'createExternalToken', 'deleteExternalToken']),
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
        limit: 4
      });
    },
    async createToken() {
      this.loading = true;
      try {
        await this.createExternalToken({
          repositoryVersion: this.getSelectedVersion,
          language: this.language
        });
        this.loadTokens();
      } catch (e) {
        this.$buefy.toast.open({
          message: this.$t('webapp.trainings.default_error'),
          type: 'is-danger'
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";

.token-modal {
  overflow: hidden;
  background-color: white;
  border-radius: .75rem;
  font-family: $unnnic-font-family-secondary;

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
    margin-bottom: 2.188rem;
    width: 60%;
  }

  &__header {
    font-size: 1.5rem;
    font-weight: 600;
    color: $color-fake-black;
    margin-bottom: 0.938rem;
  }

  &__header,
  &__footer {
    display: flex;
    justify-content: center;
    background-color: $color-grey-light;
    padding: 1.5rem 2rem;
    border: 1px solid $color-grey;

    &__button {
      box-shadow: 0px 3px 6px #00000029;
      border-radius: 6px;
      width: 159px;
      height: 40px;
      font-weight: 600;
    }
  }

  &__create {
    display: flex;
    justify-content: center;
    margin: 0.5rem 0;
    font-weight: $unnnic-font-weight-bold;
    text-decoration: underline;
    cursor: pointer;
  }
  &__create:hover {
    color: $color-fake-black;
  }
}
</style>
