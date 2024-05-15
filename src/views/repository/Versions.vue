<template>
  <RepositoryViewBase
    :repository="repository"
    :errorCode="errorCode"
  >
    <SettingsVersionsLoading slot="loader" />

    <div v-if="!authenticated">
      <BNotification
        :closable="false"
        class="is-danger"
      >
        {{ $t('webapp.versions.signin') }}
      </BNotification>
      <LoginForm hideForgotPassword />
    </div>

    <div
      v-else-if="repository"
      class="versions"
    >
      <RepositoryVersionList
        :repository="repository"
        :canEdit="repository.authorization.can_contribute"
      />
    </div>
  </RepositoryViewBase>
</template>

<script>
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import RepositoryVersionList from '@/components/repository/RepositoryVersionList';
import { mapGetters } from 'vuex';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';
import SettingsVersionsLoading from '@/views/repository/loadings/SettingsVersions';

export default {
  name: 'RepositoryVersions',
  components: {
    RepositoryViewBase,
    RepositoryVersionList,
    LoginForm,
    SettingsVersionsLoading,
  },
  extends: RepositoryBase,
  data() {
    return {
      perPage: 5,
    };
  },
  computed: {
    ...mapGetters(['authenticated']),
  },
};
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.title {
  font-size: 1.75rem;
  font-weight: $font-weight-medium;
  color: $color-fake-black;
  margin-bottom: $between-title-subtitle;
}
.description {
  margin-bottom: $between-subtitle-content;
}
:deep(.rpstr-vw-bs__wrapper__content) {
  margin: 0;
}
</style>
