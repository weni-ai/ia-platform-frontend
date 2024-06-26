<template>
  <div>
    <IntentPagination
      v-if="translateList"
      :list="translateList"
      :itemComponent="sentencesTable"
      :showIntents="tab === 'not_translated'"
      :perPage="perPage"
      :translateTo="to"
      :emptyMessage="$t('webapp.translate.no_examples', { language: to })"
      :addAttributes="{ repositoryUuid, editing, initialData: editCache }"
      :externalToken="externalToken"
      itemKey="id"
      @onUpdateSelected="updateSelected"
      @onChange="updateCache($event)"
      @translated="onTranslated()"
      @eventStep="dispatchStep()"
      @dispatchStep="dispatchStep()"
      @pageChanged="selectAll = false"
      @update:loading="onLoading($event)"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PaginatedList from '@/components/shared/PaginatedList';
import TranslateExampleItem from './NewTranslateExampleItem';
import IntentPagination from '@/components/shared/IntentPagination';
import TranslateExampleTable from './TranslateExampleTable';

export default {
  name: 'TranslateList',
  components: {
    PaginatedList,
    IntentPagination,
    TranslateExampleTable,
  },
  props: {
    repositoryUuid: {
      type: String,
      default: null,
    },
    from: {
      type: String,
      default: null,
    },
    to: {
      type: String,
      default: null,
    },
    perPage: {
      type: Number,
      default: 50,
    },
    query: {
      type: Object,
      default: null,
    },
    update: {
      type: Boolean,
      default: false,
    },
    externalToken: {
      type: String,
      default: null,
    },
    tab: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      translateList: null,
      translateExampleItem: TranslateExampleItem,
      selectAll: false,
      editing: false,
      editCache: {},
      sentencesTable: TranslateExampleTable,
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
    }),
  },
  watch: {
    async from() {
      await this.updateList();
    },
    async to() {
      await this.updateList();
    },
    query() {
      this.updateList();
    },
    update() {
      this.updateList();
    },
    selectAll() {
      this.$root.$emit('selectAll', this.selectAll);
    },
  },
  async mounted() {
    await this.updateList();
  },
  methods: {
    ...mapActions(['searchExamples', 'searchExamplesExternal']),
    updateCache({ id, data }) {
      if (!this.editCache[id] && !data) return;
      if (this.editCache[id] && !data) delete this.editCache[id];
      else this.editCache[id] = data;
    },
    saveAll() {
      this.$root.$emit('saveAll');
      this.editing = false;
      this.selectAll = false;
    },
    deleteAll() {
      this.$buefy.dialog.alert({
        title: this.$t('webapp.translate.delete_all'),
        message: this.$t('webapp.translate.delete_confirm'),
        confirmText: this.$t('webapp.home.delete'),
        cancelText: this.$t('webapp.home.cancel'),
        canCancel: true,
        closeOnConfirm: true,
        type: 'is-danger',
        onConfirm: async () => {
          this.$root.$emit('deleteAll');
        },
      });
    },
    async updateList() {
      if (this.externalToken) {
        await this.$nextTick();
        const list = await this.searchExamplesExternal({
          token: this.externalToken,
          query: { ...this.query },
          limit: this.perPage,
        });
        if (this.translateList) this.translateList.updateList(list);
        else this.translateList = list;
        this.$emit('listPhrase', this.translateList);
        return;
      }

      if (!!this.from && !!this.to) {
        await this.$nextTick();
        const list = await this.searchExamples({
          query: { language: this.from, ...this.query },
          repositoryUuid: this.repositoryUuid,
          version: this.repositoryVersion,
          limit: this.perPage,
        });
        if (this.translateList) this.translateList.updateList(list);
        else this.translateList = list;
      }
      this.$emit('listPhrase', this.translateList);
    },
    onLoading(value) {
      this.$emit('isLoadingContent', value);
    },
    async onTranslated() {
      /* istanbul ignore next */
      this.$emit('translated');
      /* istanbul ignore next */
    },
    dispatchStep() {
      this.$emit('eventStep');
    },
    updateSelected(params) {
      this.$emit('onUpdateSelected', params);
    },
  },
};
</script>
<style lang="scss" scoped>
.repository-translate {
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';

  &__list {
    margin-left: 0.5rem;

    &__options {
      padding: 0 1rem 0 0.5rem;
      margin-bottom: 2.1rem;
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-family: $font-family;

      &__buttons {
        display: flex;
        > * {
          margin-left: 0.5rem;
        }
      }

      &__check {
        margin-left: 1rem;
        display: flex;
        align-items: center;
        font-weight: bold;
        color: $color-grey-dark;
      }
    }
  }
}
</style>
