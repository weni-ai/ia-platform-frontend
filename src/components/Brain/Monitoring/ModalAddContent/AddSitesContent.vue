<template>
  <StartAddContent
    icon="globe"
    :description="$t('content_bases.sites.title')"
    :subDescription="$t('content_bases.sites.description')"
    :textAddContent="$t('content_bases.sites.add_site')"
  />
</template>

<script setup>
import StartAddContent from './StartAddContent.vue';
</script>
