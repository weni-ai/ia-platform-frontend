<template>
  <BNotification
    :closable="false"
    type="is-warning"
  >
    <RequestAuthorizationModal
      v-if="repositoryUuid"
      :open.sync="requestAuthorizationModalOpen"
      :repositoryUuid="repositoryUuid"
      :available="available"
      @requestDispatched="onAuthorizationRequested()"
    />
    <div class="level">
      <p class="level-left">{{ $t('webapp.evaluate.you_can_not_edit') }}</p>
      <a
        class="level-right request-authorization"
        @click="openRequestAuthorizationModal"
      >
        {{ $t('webapp.layout.request_authorization') }}
      </a>
    </div></BNotification
  >
</template>

<script>
import RequestAuthorizationModal from '@/components/repository/RequestAuthorizationModal';

export default {
  name: 'AuthorizationRequestNotification',
  components: {
    RequestAuthorizationModal,
  },
  props: {
    repositoryUuid: {
      type: String,
      default: null,
    },
    available: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      requestAuthorizationModalOpen: false,
    };
  },
  methods: {
    openRequestAuthorizationModal() {
      this.requestAuthorizationModalOpen = true;
    },
    onAuthorizationRequested() {
      this.requestAuthorizationModalOpen = false;
      this.$buefy.toast.open({
        message: this.$t('webapp.layout.authorization_success'),
        type: 'is-success',
      });
      this.$emit('onAuthorizationRequested');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.request-authorization {
  color: $color-fake-black;
  font-weight: $font-weight-medium;
  text-align: center;
}

a {
  color: $color-grey-dark;
  font-weight: $font-weight-medium;
  text-align: center;
}
</style>
