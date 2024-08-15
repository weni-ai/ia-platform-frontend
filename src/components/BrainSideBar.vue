<template>
  <div class="sidebar">
    <UnnnicSideBar expanded>
      <UnnnicSidebarMenu>
        <UnnnicSidebarItem
          v-for="tab in brainRoutes"
          :key="tab.page"
          :text="$t(`router.tabs.${tab.title}`)"
          :icon="tab.icon"
          :active="tab.page === activeTab"
          @click="onTabChange(tab.page)"
        />
      </UnnnicSidebarMenu>
    </UnnnicSideBar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const brainRoutes = ref([
  { title: 'personalization', page: 'router-personalization', icon: 'person' },
  { title: 'content', page: 'router-content', icon: 'article' },
  { title: 'actions', page: 'router-actions', icon: 'bolt' },
  { title: 'tunings', page: 'router-tunings', icon: 'settings' },
]);

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => {
  return brainRoutes.value.find((e) => e.page === route.name)?.page;
});

const onTabChange = (pageName) => {
  if (route.name !== pageName) {
    router.push({ name: pageName });
  }
};
</script>

<style lang="scss" scoped>
.sidebar {
  border-style: solid;
  border-color: $unnnic-color-neutral-soft;
  border-width: $unnnic-border-width-thinner 0 0 $unnnic-border-width-thinner;
  padding: $unnnic-spacing-sm;
  width: 182px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
</style>
