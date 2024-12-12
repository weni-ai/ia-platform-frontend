<template>
  <div
    :class="['sidebar', { collapsed: isCollapsed }]"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <UnnnicButton
      v-if="isCollapsed || isHoveringSidebar"
      class="floating-button"
      :iconCenter="isCollapsed ? 'arrow_forward_ios' : 'arrow_back_ios_new'"
      type="secondary"
      data-test="floating-btn"
      @click="handleButtonClick"
    />

    <section v-if="isSideBarVisible">
      <SidebarMenu data-test="side-bar-menu">
        <SideBarItem
          v-for="nav in brainRoutes"
          :key="nav.page"
          :text="$t(`router.tabs.${nav.title}`)"
          :icon="nav.icon"
          :active="nav.page === activeNav"
          :iconFilled="nav.page === activeNav"
          :tag="nav.tag"
          data-test="nav-router"
          @click="onNavChange(nav.page)"
        />
      </SidebarMenu>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useBrainRoutes from '@/composables/useBrainRoutes';
import SideBarItem from '../Sidebar/SideBarItem.vue';
import SidebarMenu from '../Sidebar/SidebarMenu.vue';

const route = useRoute();
const router = useRouter();
const brainRoutes = useBrainRoutes();

const activeNav = computed(() => {
  return brainRoutes.value.find((e) => e.page === route.name)?.page;
});

const isCollapsed = ref(false);
const isSideBarVisible = ref(true);
const isHoveringSidebar = ref(false);

const onNavChange = (pageName) => {
  if (route.name !== pageName) {
    router.push({ name: pageName });
  }
};

const handleButtonClick = () => {
  if (isCollapsed.value) {
    isCollapsed.value = false;
    setTimeout(() => {
      isSideBarVisible.value = true;
    }, 300);
    return;
  }

  isCollapsed.value = true;
  isSideBarVisible.value = false;
};

const handleMouseOver = () => {
  if (!isCollapsed.value) {
    isHoveringSidebar.value = true;
  }
};

const handleMouseLeave = () => {
  isHoveringSidebar.value = false;
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
  transition:
    width 0.5s ease,
    padding 0.5s ease;

  &.collapsed {
    padding-left: 18px;
    padding-right: 0;
    width: 0;
  }

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
    transition: opacity 0.3s ease;

    &:hover:enabled {
      background: none;
    }
  }

  .unnnic-side-bar {
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
    transform-origin: left center;
    opacity: 1;
    transform: translateX(0);
  }

  &.collapsed .unnnic-side-bar {
    opacity: 0;
    transform: translateX(-100%);
    pointer-events: none;
  }

  :deep(.unnnic-side-bar-menu__title) {
    margin: 0 0 $unnnic-spacing-nano;
  }

  :deep(.unnnic-button--icon-on-center.unnnic-button--size-large) {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1px solid $unnnic-color-neutral-clean;
  }

  :deep(.material-symbols-rounded.unnnic-icon-size--md) {
    font-size: 10px;
    color: $unnnic-color-neutral-clean;
  }

  :deep(.unnnic-side-bar-item) {
    color: $unnnic-color-neutral-cloudy;

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

  :deep(.unnnic-icon-size--sm) {
    font-size: $unnnic-font-size-title-sm;
  }
}
</style>
