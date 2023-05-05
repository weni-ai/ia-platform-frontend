<!-- eslint-disable max-len -->
<template>
  <div class="settings-loading">
    <div class="settings-loading__modal">
      <unnnic-skeleton-loading tag="div" width="498px" height="220px" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
.settings-loading {
  &__modal {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 65px;
  }
}
</style>
