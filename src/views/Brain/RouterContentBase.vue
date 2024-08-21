<template>
  <section class="content-base__scrollable">
    <section :style="{ height: 0 }">
      <section
        :class="[
          'content-base__content-tab',
          `content-base__content-tab--shape-${contentStyle}`,
        ]"
      >
        <section>
          <UnnnicIntelligenceText
            tag="p"
            family="secondary"
            size="body-gt"
            marginBottom="sm"
            weight="400"
          >
            {{ $t('content_bases.description') }}
          </UnnnicIntelligenceText>
        </section>
        <section>
          <UnnnicTab
            :tabs="routerTabs.map((e) => e.page)"
            :activeTab="activeTab"
            @change="onTabChange"
          >
            <template
              v-for="tab in routerTabs"
              :key="tab.page"
              #[`tab-head-${tab.page}`]
            >
              {{ $t(`content_bases.tabs.${tab.title}`) }}
            </template>
          </UnnnicTab>
        </section>
        <section class="search-container">
          <UnnnicInput
            :modelValue="filterName"
            size="md"
            :iconLeftClickable="true"
            iconLeft="search-1"
            :placeholder="$t('router.content.fields.search_placeholder')"
            @update:model-value="updateFilterName"
          />
        </section>
        <UnnnicSkeletonLoading
          v-if="
            files.status === 'loading' &&
            files.data.length === 0 &&
            contentStyle !== 'accordion'
          "
          tag="div"
          height="100%"
          class="repository-base-edit__wrapper__card-content"
        />
        <BasesFormFiles
          v-if="activeTab === 'files'"
          :files="files"
          :filterText="filterName"
          shape="accordion"
        />
        <BasesFormSites
          v-if="activeTab === 'sites'"
          :items="sites"
          :filterText="filterName"
          shape="accordion"
        />
        <section v-if="activeTab === 'text'">
          <BasesFormGenericListHeader
            v-model:open="text.open"
            :shape="contentStyle"
            :title="$t('content_bases.tabs.text')"
            data-test="content-base-text"
          />

          <BasesFormText
            v-if="text.open"
            v-model="$store.state.Brain.contentText.current"
            dontShowSaveButton
            :item="text"
            class="content-base__content-tab__text"
            data-test="content-base-text-area"
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
  emits: ['update:filterName', 'update:files'],
  setup(props, { emit }) {
    const { filterNameProp, filesProp, sitesProp, textProp } = toRefs(props);
    const contentStyle = ref('accordion');

    const routerTabs = ref([
      { title: 'files', page: 'files' },
      { title: 'sites', page: 'sites' },
      { title: 'text', page: 'text' },
    ]);

    const activeTab = ref(routerTabs.value[0].page);

    const updateFilterName = (value) => {
      emit('update:filterName', value);
    };

    const onTabChange = (newTab) => {
      activeTab.value = newTab;
    };

    return {
      filterName: filterNameProp,
      files: filesProp,
      sites: sitesProp,
      text: textProp,
      contentStyle,
      routerTabs,
      activeTab,
      updateFilterName,
      onTabChange,
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
