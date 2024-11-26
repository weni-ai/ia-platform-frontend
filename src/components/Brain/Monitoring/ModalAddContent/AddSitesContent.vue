<template>
  <AddContent
    icon="globe"
    :description="$t('content_bases.sites.title')"
    :subDescription="$t('content_bases.sites.description')"
    :textAddContent="$t('content_bases.sites.add_site')"
  />
</template>

<script setup>
import AddContent from './AddContent.vue';
</script>
