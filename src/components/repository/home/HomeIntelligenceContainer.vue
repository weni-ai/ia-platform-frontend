<template>
  <div class="home-intelligences-container">
    <slot />
  </div>
</template>
<script>
export default {
  name: 'HomeIntelligenceContainer',
};
</script>

<style lang="scss" scoped>


.home-intelligences-container {
  height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: $unnnic-inline-md;
  background-color: $unnnic-color-background-snow;
  padding: 0 $unnnic-inline-nano;
}
</style>
