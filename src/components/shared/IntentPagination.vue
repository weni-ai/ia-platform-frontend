<template>
  <div v-if="list && !list.empty">
    <component
      v-show="!isLoading"
      :key="itemKey && item[itemKey] ? item[itemKey] : index"
      :is="itemComponent"
      :list="list"
      v-bind="addAttrs(item)"
      @deleted="onItemDeleted(item.id)"
      @updateList="onSaveUpdate"
      @dispatchEvent="onDispatchEvent($event)" />
    <loading v-show="isLoading" class="pagination__message" />
    <div v-if="!loadAll" class="pagination__bottom">
      <p v-show="!isLoading" class="text-center">
        {{ listStatusErrorCode | statusCodeVerbose }}
      </p>
      <div class="pagination__bottom__divider" />
      <div class="pagination__bottom__controls">
        <div
          v-if="list && list.total > 0"
          class="pagination__bottom__controls__message"
        >
          {{ $t('webapp.layout.items_total',
            { initialItem: initialItem, lastItem: lastItem, total: list.total }) }}
        </div>
        <unnnic-pagination v-model="page" :max="maxPages" :show="5" />
      </div>
    </div>
  </div>
  <div v-else-if="list && list.empty">
    <p class="pagination__message">{{ emptyMessage }}</p>
  </div>
</template>

<script>
import Loading from '@/components/shared/Loading';

const components = {
  Loading,
};

export default {
  name: 'IntentPagination',
  components,
  props: {
    itemComponent: {
      type: [Object, Function],
      required: true,
    },
    list: {
      type: Object,
      default: null,
    },
    perPage: {
      type: Number,
      default: 10,
    },
    addAttributes: {
      type: Object,
      default: () => {},
    },
    emptyMessage: {
      type: String,
      default: null,
    },
    loadAll: {
      type: Boolean,
      default: false,
    },
    itemKey: {
      type: String,
      default: null,
    },
    isSearching: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      listStatusErrorCode: null,
      error: null,
      page: 1,
      data: false,
    };
  },
  computed: {
    isLoading() {
      return this.list && this.list.loading;
    },
    params() {
      if (!this.list) return null;
      return this.list.params;
    },
    initialItem() {
      if (this.lastItem === this.list.total) {
        return ((this.page * this.perPage) - this.perPage) + 1
      }
      return (this.lastItem - this.perPage) + 1
    },
    lastItem() {
      if ((this.list.total / (this.list.total / this.perPage)) * this.page > this.list.total) {
        return this.list.total
      }
      return (this.list.total / (this.list.total / this.perPage)) * this.page
    },
    maxPages() {
      if (Number.isInteger(this.list.total / this.perPage)) {
        return this.list.total / this.perPage
      }
      return (this.list.total / this.perPage) + 1
    }
  },
  watch: {
    list() {
      if (this.isSearching) {
        this.page = 1;
      }
      this.fetch();
    },
    isLoading() {
      this.$emit('update:loading', this.isLoading);
    },
    page() {
      this.$emit('pageChanged', this.page);
      if (this.loadAll) return;
      this.fetch();
    },
    params() {
      this.fetch();
    },
  },
  mounted() {
    this.fetch();
  },
  methods: {
    async fetch() {
      if (!(this.list && this.list.updateItems)) return false;
      try {
        if (this.loadAll) {
          await this.list.getAllItems();
          this.$emit('updated');
          return true;
        }
        await this.list.updateItems(this.page);
        this.$emit('updated');
        return true;
      } catch (e) {
        this.error = e;
        this.listStatusErrorCode = e.request ? e.request.status : '';
        this.$emit('error', this.error);
      }
      return false;
    },
    shouldShow(index) {
      if (!this.loadAll) return true;

      const offset = (this.page - 1) * this.perPage;

      return index >= offset && index < offset + this.perPage;
    },
    onDispatchEvent(arg) {
      const [event, value] = arg instanceof Object ? [arg.event, arg.value] : [arg, null];

      this.$emit(event, value);
    },
    addAttrs(obj) {
      return {
        data: this.data,
        ...this.addAttributes,
        ...obj,
        ...this.$attrs,
      };
    },
    onItemDeleted(id) {
      this.$emit('itemDeleted', id);
    },
    onSaveUpdate() {
      this.$emit('itemSave');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
.pagination {
  &__bottom {
    min-width: 100%;
    display: block;
    margin: 1rem auto;
    max-width: 600px;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;

    &__controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      width: 100%;
      align-items: center;

      &__message {
        padding: 1rem 1rem 1rem 0;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        color: $unnnic-color-neutral-dark;
      }
    }

    &__divider {
      border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      margin: 1rem 0;
    }
  }

  & &__message {
    text-align: center;
    width: 100%;
  }

  &__message {
    text-align: center;
    width: 100%;
  }
}
</style>
