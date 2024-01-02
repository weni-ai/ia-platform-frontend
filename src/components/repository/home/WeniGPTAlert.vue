<template>
  <div>
    <div
      v-if="canShow"
      class="warning-bar"
      :style="{
        display: canShow ? null : 'none',
      }"
    >
      <div class="warning-bar__content is-flex is-align-items-center mx-auto">
        <img
          class="doris-face"
          src="~@/assets/imgs/doris.png"
          width="50px"
        />

          <span>
            {{ $t('announcements.new_artificial_intelligence_module_is_here') }}
          </span>
      </div>

      <unnnic-icon-svg icon="close-1" size="sm" clickable @click="canShow = false" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeniGPTAlert',

  data() {
    return {
      canShow: this.$route.name === 'home',
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.warning-bar {
  position: relative;
  background-color: $unnnic-color-aux-blue-100;
  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-lg;
  line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  padding: $unnnic-spacing-sm;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $unnnic-spacing-xs;
  min-height: $unnnic-font-size * 3.5;
  box-shadow: $unnnic-shadow-level-near;

  &__content {
    padding-left: 50px + $unnnic-spacing-xs;

    .doris-face {
      position: absolute;
      margin-left: -50px - $unnnic-spacing-xs;
    }
  }

}
</style>
