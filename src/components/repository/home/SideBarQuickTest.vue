<template>
  <RightSidebar
    :title="$t('content_bases.sidebar_quick_test_title', { name })"
    :description="$t('content_bases.sidebar_quick_test_description')"
    @close="$emit('close')"
  >
    <div class="content-bases-list">
      <Tests
        :contentBaseUuid="repositoryUuid"
        :contentBaseLanguage="repositoryLanguage"
      />
    </div>
  </RightSidebar>
</template>

<script>
import { mapActions } from 'vuex';
import Tests from '../../../views/repository/content/Tests';
import RightSidebar from '../../RightSidebar.vue';

export default {
  props: {
    name: String,
    repositoryUuid: String,
    repositoryLanguage: String,
    id: Number,
  },

  components: {
    Tests,
    RightSidebar,
  },

  data() {
    return {
      loading: false,
      configTest: '',
    };
  },

  methods: {
    ...mapActions(['getQATexts']),
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.content-bases-list {
  margin-top: $unnnic-spacing-sm;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;
  height: 100%;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-soft;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;
  border-radius: $unnnic-border-radius-md;
  padding: $unnnic-spacing-sm;
}
</style>
