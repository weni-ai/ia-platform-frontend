<template>
  <UnnnicButton
    @click.native="
      $router.push({
        name: 'intelligence-edit',
        params: {
          intelligenceUuid: $route.params.intelligenceUuid,
        },
      })
    "
    iconCenter="settings"
    type="secondary"
  />
</template>
<script>
export default {
  name: 'RepositoryContentNavigation',
  components: {},
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';
</style>
