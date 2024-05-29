<template>
  <section :class="['files-list__container', `files-list--shape-${shape}`]">
    <BasesFormGenericListHeader
      :shape="shape"
      :open.sync="open"
      :title="title"
      :counter="hideCounter ? undefined : counter"
      :addText="addText"
      :hideToggle="hideToggle"
      @add="$emit('add')"
    />

    <section v-show="open">
      <UnnnicIntelligenceText
        v-if="shape === 'accordion'"
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        marginTop="xs"
        tag="p"
      >
        {{ description }}
      </UnnnicIntelligenceText>

      <section
        :class="['files-list__content', `files-list__content--shape-${shape}`]"
      >
        <BasesFormFilesItem
          v-for="file in itemsFiltered"
          :key="file.uuid"
          :file="file"
          :compressed="shape === 'accordion'"
          :class="[{ 'files-list__item--can-edit': canEditItem }]"
          @remove="$emit('remove', file)"
          @click.native="$emit('edit', file)"
        />

        <template v-if="items.status === 'loading'">
          <UnnnicSkeletonLoading
            v-for="i in 3"
            :key="i"
            tag="div"
            :height="shape === 'accordion' ? '46px' : '56px'"
          />
        </template>

        <UnnnicButton
          v-if="shape === 'accordion'"
          @click="$emit('add')"
          type="secondary"
          iconLeft="add-1"
        >
          {{ addText }}
        </UnnnicButton>

        <div
          v-show="!['loading', 'complete'].includes(items.status)"
          ref="end-of-list-element"
        ></div>
      </section>
    </section>
  </section>
</template>

<script>
import BasesFormFilesItem from './BasesFormFilesItem.vue';
import BasesFormGenericListHeader from './BasesFormGenericListHeader.vue';

export default {
  props: {
    title: String,
    description: String,
    addText: String,
    items: Object,
    canEditItem: Boolean,
    hideCounter: Boolean,
    hideToggle: Boolean,
    filterItem: Function,

    shape: {
      type: String,
      default: 'normal',
      validator(value) {
        return ['normal', 'accordion'].includes(value);
      },
    },
  },

  components: {
    BasesFormFilesItem,
    BasesFormGenericListHeader,
  },

  data() {
    return {
      open: true,
      isShowingEndOfList: false,
      intersectionObserver: null,
    };
  },

  computed: {
    counter() {
      return String(
        this.items.next
          ? `${this.itemsFiltered.length}+`
          : this.itemsFiltered.length,
      );
    },

    itemsFiltered() {
      if (this.filterItem) {
        return this.items.data.filter(this.filterItem);
      }

      return this.items.data;
    },
  },

  watch: {
    isShowingEndOfList() {
      if (this.isShowingEndOfList && this.items.status === null) {
        this.$emit('load-more');
      }
    },
  },

  mounted() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isShowingEndOfList = entry.isIntersecting;
      });
    });

    this.intersectionObserver.observe(this.$refs['end-of-list-element']);
  },

  beforeDestroy() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  methods: {
    toggleAccordionOpen() {
      if (this.shape !== 'accordion') {
        return;
      }

      this.open = !this.open;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.files-list {
  &__container {
    height: 0;
  }

  &--shape-accordion.files-list__container {
    height: auto;
  }

  &__content {
    margin-top: $unnnic-spacing-sm;
    display: grid;
    gap: $unnnic-spacing-sm;
    grid-template-columns: repeat(
      auto-fill,
      minmax(16 * $unnnic-font-size, 1fr)
    );

    &--shape-accordion {
      column-gap: $unnnic-spacing-ant;
      row-gap: $unnnic-spacing-xs;
    }
  }

  &__item {
    &--can-edit {
      cursor: pointer;
    }
  }
}
</style>
