<template>
  <section
    v-if="sites.length"
    class="add-sites-content__sites"
  >
    <ul class="sites__list">
      <li
        v-for="(site, index) of sites"
        :key="index"
      >
        <UnnnicFormElement
          :label="$t('content_bases.sites.modal.fields.link.label')"
        >
          <UnnnicInput
            :ref="(el) => (siteRefs[index] = el)"
            v-model="sites[index]"
            :type="!site || validURL(site) ? 'normal' : 'error'"
            :placeholder="
              $t('content_bases.sites.sidebar_add.fields.link.placeholder')
            "
            @input="onSiteInput($event, index)"
          />
        </UnnnicFormElement>
      </li>
    </ul>
    <UnnnicButton
      type="secondary"
      iconLeft="add"
      :disabled="!validURL(sites.at(-1))"
      @click="addEmptySite"
    >
      {{ $t('router.monitoring.modal_add_content.add_another_site') }}
    </UnnnicButton>
  </section>

  <StartAddContent
    v-else
    icon="globe"
    :description="$t('content_bases.sites.title')"
    :subDescription="$t('content_bases.sites.description')"
    :textAddContent="$t('content_bases.sites.add_site')"
    @add="addEmptySite"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { validURL } from '@/utils/sites';

import StartAddContent from './StartAddContent.vue';

const emit = defineEmits(['update:model-value']);

const sites = ref([]);
const siteRefs = ref([]);

const onSiteInput = (event, index) => {
  const siteWithoutSpaces = event.target.value.trim().split(/\s+/).join('');
  sites.value[index] = siteWithoutSpaces;
};

function addEmptySite() {
  sites.value.push('');
}

const validSites = computed(() => sites.value.filter((site) => validURL(site)));

watch(validSites, (newSites) => {
  emit('update:model-value', newSites);
});
</script>

<style scoped lang="scss">
.add-sites-content {
  &__sites {
    height: 100%;

    display: grid;
    grid-template-rows: auto 1fr;
    gap: $unnnic-spacing-xs;

    .sites__list {
      margin: 0;
      padding: 0;
      list-style: none;

      display: grid;
      gap: $unnnic-spacing-xs;
    }
  }
}
</style>
