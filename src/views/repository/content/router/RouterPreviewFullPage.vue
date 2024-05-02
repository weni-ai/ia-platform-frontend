<template>
  <section
    class="preview"
    :style="{ height: `${height}px` }"
  >
    <Tests usePreview />
  </section>
</template>

<script>
import RemoveBulmaMixin from '../../../../utils/RemoveBulmaMixin';
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

  mixins: [RemoveBulmaMixin],

  mounted() {
    document.documentElement.style.overscrollBehavior = 'none';

    this.height = window.visualViewport.height;

    window.addEventListener('resize', () => {
      // For the rare legacy browsers that don't support it
      if (!window.visualViewport) {
        return;
      }

      this.height = window.visualViewport.height;

      console.log(window.visualViewport.height);
    });
  },
};
</script>

<!-- <style>
html { overscroll-behavior: none; }
</style> -->

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.preview {
  display: flex;
  max-width: 100vw;
  overflow: hidden;
  padding: $unnnic-spacing-sm;
}
</style>
