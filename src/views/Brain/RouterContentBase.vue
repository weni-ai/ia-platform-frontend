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
        <ContentFiles
          v-if="activeTab === 'files'"
          :files="files"
          shape="accordion"
        />
        <ContentSites
          v-if="activeTab === 'sites'"
          :items="sites"
          shape="accordion"
        />
        <section v-if="activeTab === 'text'">
          <ContentText
            v-model="$store.state.Brain.contentText.current"
            :isLoading="item?.status === 'loading'"
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
import ContentFiles from '@/components/Brain/ContentFiles.vue';
import ContentSites from '@/components/Brain/ContentSites.vue';
import ContentText from '@/components/Brain/ContentText.vue';

export default defineComponent({
  name: 'RouterContentBase',
  components: {
    ContentFiles,
    ContentSites,
    ContentText,
  },
  props: {
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
  emits: ['update:files'],
  setup(props, { emit }) {
    const { filesProp, sitesProp, textProp } = toRefs(props);
    const contentStyle = ref('accordion');

    const routerTabs = ref([
      { title: 'files', page: 'files' },
      { title: 'sites', page: 'sites' },
      { title: 'text', page: 'text' },
    ]);

    const activeTab = ref(routerTabs.value[0].page);

    const onTabChange = (newTab) => {
      activeTab.value = newTab;
    };

    return {
      files: filesProp,
      sites: sitesProp,
      text: textProp,
      contentStyle,
      routerTabs,
      activeTab,
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

    :deep(.tab-header) {
      margin-bottom: 0;
    }
  }
}
.search-container {
  margin-top: $unnnic-spacing-xs;
}
</style>
