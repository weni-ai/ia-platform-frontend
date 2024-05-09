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
      if (!window.visualViewport) {
        return;
      }

      this.height = window.visualViewport.height;
    });
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.preview {
  display: flex;
  height: 100%;
  overflow: hidden;
  padding: $unnnic-spacing-sm;
}
</style>
