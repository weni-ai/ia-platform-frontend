<template>
  <section class="content-base__scrollable">
    <section :style="{ height: 0 }">
      <section
        :class="[
          'content-base__content-tab',
          `content-base__content-tab--shape-${contentStyle}`,
        ]"
      >
        <section class="search-container">
          <UnnnicInput
            :modelValue="filterName"
            size="md"
            :iconLeftClickable="true"
            iconLeft="search-1"
            :placeholder="$t('router.content.fields.search_placeholder')"
            @update:modelValue="updateFilterName"
          />
        </section>
        <UnnnicSkeletonLoading
          v-if="
            filesProp.status === 'loading' &&
            filesProp.data.length === 0 &&
            contentStyle !== 'accordion'
          "
          tag="div"
          height="100%"
          class="repository-base-edit__wrapper__card-content"
        />
        <BasesFormFiles
          :files="filesProp"
          :filterText="filterName"
          shape="accordion"
          @load-more="loadFiles"
          @removed="removedFile"
          @update:items="updateFiles"
        />
        <BasesFormSites
          :items="sitesProp"
          :filterText="filterName"
          shape="accordion"
          @load-more="loadSites"
          @removed="removedSite"
          @update:items="updateSites"
        />
        <section>
          <BasesFormGenericListHeader
            v-model:open="textProp.open"
            :shape="contentStyle"
            :title="$t('content_bases.tabs.text')"
          />
          <BasesFormText
            v-if="textProp.open"
            useBrain
            dontShowSaveButton
            :item="textProp"
            class="content-base__content-tab__text"
          />
        </section>
      </section>
    </section>
  </section>
</template>

<script>
import { defineComponent, ref, toRefs } from 'vue';
import BasesFormFiles from '../repository/content/BasesFormFiles.vue';
import BasesFormSites from '../repository/content/BasesFormSites.vue';
import BasesFormGenericListHeader from '../repository/content/BasesFormGenericListHeader.vue';
import BasesFormText from '../repository/content/BasesFormText.vue';

export default defineComponent({
  name: 'RouterContentBase',
  components: {
    BasesFormFiles,
    BasesFormSites,
    BasesFormGenericListHeader,
    BasesFormText,
  },
  props: {
    filterNameProp: {
      type: String,
      default: '',
    },
    filesProp: {
      type: Object,
      required: true,
    },
    sitesProp: {
      type: Object,
      required: true,
    },
    textProp: {
      type: Object,
      required: true,
    },
  },
  emits: [
    'load-files',
    'load-sites',
    'removed-file',
    'removed-site',
    'update:filterName',
    'update:files',
    'update:sites',
  ],
  setup(props, { emit }) {
    const { filterNameProp, filesProp, sitesProp, textProp } = toRefs(props);
    const contentStyle = ref('accordion');

    const updateFilterName = (value) => {
      emit('update:filterName', value);
    };

    const loadFiles = () => {
      emit('load-files');
    };

    const loadSites = () => {
      emit('load-sites');
    };

    const removedFile = (fileUuid) => {
      emit('removed-file', fileUuid);
    };

    const removedSite = (siteUuid) => {
      emit('removed-site', siteUuid);
    };

    const updateFiles = (updatedItems) => {
      emit('update:files', updatedItems);
    };

    const updateSites = (updatedItems) => {
      emit('update:sites', updatedItems);
    };

    return {
      filterName: filterNameProp,
      files: filesProp,
      sites: sitesProp,
      text: textProp,
      contentStyle,
      updateFilterName,
      loadFiles,
      loadSites,
      removedFile,
      removedSite,
      updateFiles,
      updateSites,
    };
  },
});
</script>

<style lang="scss" scoped>
.content-base {
  &__container {
    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-sm;

    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__scrollable {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;

    overflow: overlay;

    $scroll-size: $unnnic-inline-nano;

    padding-right: $unnnic-inline-nano + $scroll-size;
    margin-right: -($unnnic-inline-nano + $scroll-size);

    &::-webkit-scrollbar {
      width: $scroll-size;
    }

    &::-webkit-scrollbar-thumb {
      background: $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    &::-webkit-scrollbar-track {
      background: $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-pill;
    }
  }

  &__content-tab {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-md;

    &--shape-normal {
      height: 100%;
    }

    &__text {
      margin-top: $unnnic-spacing-sm;
    }
  }
}
.search-container {
  margin-top: $unnnic-spacing-xs;
}
</style>
