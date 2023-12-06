<template>
  <unnnic-button
    @click.native="routerHandle('repository-content-adjustments')"
    iconCenter="settings"
    type="secondary"
  />
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'RepositoryContentNavigation',
  components: {},
  data() {
    return {

    };
  },
  methods: {
    routerHandle(path, opts = {}) {
      this.$router.push({
        name: `${path}`,
        ...opts,
      });
    },
  }
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

</style>
