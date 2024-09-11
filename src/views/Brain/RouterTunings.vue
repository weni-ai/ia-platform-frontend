<template>
  <section class="tunings__container">
    <header class="tunings__container_header">
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="body-gt"
      >
        Gerencie as configurações e acompanhe as alterações realizadas.
      </UnnnicIntelligenceText>
    </header>
    <section class="tunings__container_tabs">
      <UnnnicTab
        :tabs="tabs.map((e) => e.page)"
        :activeTab="activeTab"
        @change="onTabChange"
      >
        <template
          v-for="tab in tabs"
          :key="tab.page"
          #[`tab-head-${tab.page}`]
        >
          {{ tab.title }}
        </template>
      </UnnnicTab>
    </section>
    <section>
      <Settings v-if="activeTab === 'config'" />
      <ChangesHistory v-if="activeTab === 'hist'" />
    </section>
  </section>
</template>

<script setup>
import ChangesHistory from '@/components/Brain/Tunings/ChangesHistory.vue';
import Settings from '@/components/Brain/Tunings/Settings.vue';
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const tabs = ref([
  { title: 'Configurações', page: 'config' },
  { title: 'Histórico de alterações', page: 'hist' },
]);

const activeTab = ref('config');

onMounted(() => {
  store.dispatch('loadBrainTunings');
});

const onTabChange = (newTab) => {
  activeTab.value = newTab;
};
</script>

<style lang="scss" scoped>
.tunings__container {
  &_header {
    display: flex;
    flex-direction: column;
  }

  &_tabs {
    display: flex;
    margin: $unnnic-spacing-md 0 0 0;
  }
}
</style>
