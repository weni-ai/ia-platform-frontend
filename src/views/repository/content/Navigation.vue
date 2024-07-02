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

<style lang="scss" scoped></style>
