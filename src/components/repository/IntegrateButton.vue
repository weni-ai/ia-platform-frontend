<template>
  <UnnnicToolTip
    side="top"
    :text="$t('webapp.home.integrate')"
    enabled
  >
    <UnnnicButton
      iconCenter="add_circle"
      size="small"
      icon="add-1"
      class="mr-2"
      type="alternative"
      @click.prevent.stop="$emit('click')"
    />
  </UnnnicToolTip>
</template>

<script setup>
defineEmits(['click']);
</script>
