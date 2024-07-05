<template>
  <section
    class="preview"
    :style="{ height: `${height}px` }"
  >
    <Tests usePreview />
  </section>
</template>

<script>
import Tests from '../Tests.vue';

export default {
  components: {
    Tests,
  },

  data() {
    return {
      height: 10,
    };
  },

  mounted() {
    document.documentElement.style.overscrollBehavior = 'none';

    this.height = window.visualViewport.height;

    window.addEventListener('resize', () => {
      if (!window.visualViewport) {
        return;
      }

      this.height = window.visualViewport.height;
    });
  },
};
</script>

<style lang="scss" scoped>
.preview {
  display: flex;
  height: 100%;
  overflow: hidden;
  padding: $unnnic-spacing-sm;
}
</style>
