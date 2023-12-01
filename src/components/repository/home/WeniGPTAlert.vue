<template>
  <div>
    <div
      v-if="canShow"
      class="warning-bar"
      :style="{
        display: canShow ? null : 'none',
      }"
    >
      <div class="is-flex is-align-items-center mx-auto">
          <img
            src="~@/assets/imgs/doris.png"
            width="50px"
            class="mr-2"
          />

          <span>
            Chegou o novo módulo de Inteligência Artificial!
            Explore as novidades e saiba como criar chatbots ainda mais incríveis!
          </span>
      </div>
      <div>
          <unnnic-icon-svg icon="close-1" size="sm" clickable @click="canShow = false" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'WeniGPTAlert',

  data() {
    return {
    };
  },

  computed: {
    canShow() {
      return this.$route.name === 'home';
    },
  },

};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.warning-bar {
  background-color: $unnnic-color-aux-blue-100;
  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-lg;
  padding: $unnnic-spacing-sm;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  line-height: 0;
  height: 56px;
}
</style>
