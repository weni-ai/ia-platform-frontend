<template>
  <div class="sidebar">
    <UnnnicButton
      class="floating-button"
      iconCenter="arrow_back_ios_new"
      type="secondary"
      @click="handleButtonClick"
    />
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

const handleButtonClick = () => {
  console.log('Floating button clicked');
};
</script>

<style lang="scss" scoped>
.sidebar {
  border-style: solid;
  border-color: $unnnic-color-neutral-soft;
  border-width: 0 0 0 $unnnic-border-width-thinner;
  padding: $unnnic-spacing-sm;
  width: 182px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;

  .floating-button {
    position: absolute;
    top: 27px;
    left: 100%;
    transform: translateX(-50%);
    border-radius: $unnnic-border-radius-pill;
    background: $unnnic-color-neutral-white;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 0;
    opacity: 0;
    transition: opacity 0.3s ease;

    &:hover {
      background-color: darken(blue, 10%);
    }
  }

  &:hover .floating-button {
    opacity: 1;
  }

  :deep(.unnnic-button--icon-on-center.unnnic-button--size-large) {
    width: 18px;
    height: 18px;
    padding: 0;
    border: 1px solid $unnnic-color-neutral-clean;
  }

  :deep(.material-symbols-rounded.unnnic-icon-size--md) {
    font-size: 10px;
    color: $unnnic-color-neutral-clean;
  }

  :deep(.unnnic-side-bar-item) {
    &:hover {
      background-color: $unnnic-color-background-sky;
    }

    div {
      display: flex;
      align-items: center;
    }
  }

  :deep(.unnnic-side-bar-item--active) {
    background-color: $unnnic-color-background-sky;
  }
}
</style>
