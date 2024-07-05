<template>
  <UnnnicButton
    iconCenter="settings"
    type="secondary"
    @click="
      $router.push({
        name: 'intelligence-edit',
        params: {
          intelligenceUuid: $route.params.intelligenceUuid,
        },
      })
    "
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
