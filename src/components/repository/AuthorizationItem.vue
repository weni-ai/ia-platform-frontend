<template>
  <div class="authorization-item columns is-vcentered">
    <div class="column authorization-item__info">
      <UserAvatar
        :profile="getProfile(user__nickname)"
        :clickable="false"
        :isOrganization="user__is_organization"
        class="authorization-item__avatar"
      />
      <p>
        <strong>
          {{ getProfile(user__nickname).name || user__nickname }} ({{
            user__nickname
          }})
        </strong>
      </p>
      <RoleSelect
        :editable="editable"
        v-model="newRole"
        size="is-small"
      />
    </div>
    <div class="column is-2 authorization-item__icon__container">
      <BIcon
        v-show="!submitting"
        icon="delete"
        size="is-small"
        class="authorization-item__icon authorization-item__icon--button"
        @click.native="remove()"
      />
      <BIcon
        v-show="!submitting"
        icon="pencil"
        size="is-small"
        class="authorization-item__icon authorization-item__icon--button"
        @click.native="editable = !editable"
      />
      <BIcon
        v-show="submitting"
        size="is-small"
        class="authorization-item__icon icon-spin"
        icon="refresh"
      />
      <BIcon
        v-show="submitted"
        size="is-small"
        class="text-color-primary"
        icon="check"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import UserAvatar from '@/components/user/UserAvatar';
import RoleSelect from '@/components/inputs/RoleSelect';
import { ROLES } from '@/utils';

export default {
  name: 'AuthorizationItem',
  components: {
    UserAvatar,
    RoleSelect,
  },
  props: {
    id_request_authorizations: {
      type: Number,
      default: null,
    },
    uuid: {
      type: String,
      required: true,
    },
    user__nickname: {
      type: String,
      required: true,
    },
    repository: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      required: true,
    },
    can_read: {
      type: Boolean,
      required: true,
    },
    can_contribute: {
      type: Boolean,
      required: true,
    },
    can_write: {
      type: Boolean,
      required: true,
    },
    user__is_organization: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      newRole: this.role,
      submitting: false,
      submitted: false,
      removeDialog: null,
      editable: false,
      roles: ROLES,
    };
  },
  computed: {
    ...mapGetters(['getProfile']),
    roleLabel() {
      if (this.newRole === null) {
        return null;
      }

      return this.$t(
        `webapp.roles.${this.roles[Number(this.newRole)].toLowerCase()}`,
      );
    },
  },
  watch: {
    newRole() {
      this.updateRole();
    },
  },
  mounted() {
    this.updateUserProfile();
  },
  methods: {
    ...mapActions([
      'updateProfile',
      'repositoryUpdateAuthorizationRole',
      'approveRequestAuthorization',
      'removeAuthorization',
    ]),
    async remove() {
      return new Promise((resolve, reject) => {
        this.removeDialog = this.$buefy.dialog.confirm({
          message: this.$t('webapp.settings.remove_user_confirm', {
            user: this.user__nickname,
            role: this.roleLabel,
          }),
          confirmText: this.$t('webapp.settings.remove'),
          cancelText: this.$t('webapp.settings.cancel'),
          type: 'is-danger',
          onConfirm: async () => {
            this.submitting = true;
            try {
              await this.removeAuthorization({
                id: this.id_request_authorizations,
                repositoryUuid:
                  this.$store.state.Repository.selectedRepository.uuid,
              });
              this.$emit('deleted');
            } catch (error) {
              this.handlerError(error);
            }
            this.submitting = false;
            resolve();
          },
          onCancel: () => {
            reject();
          },
        });
      });
    },
    updateUserProfile() {
      this.updateProfile({
        nickname: this.user__nickname,
        isOrg: this.user__is_organization,
      });
    },
    async updateRole() {
      this.submitting = true;
      this.submitted = false;
      try {
        await this.repositoryUpdateAuthorizationRole({
          repositoryUuid: this.repository,
          userNickname: this.user__nickname,
          newRole: this.newRole,
        });
        this.submitted = true;
        this.$emit('updateList');
      } catch (error) {
        this.handlerError(error);
      }
      this.submitting = false;
    },
    handlerError(error) {
      this.newRole = this.role;
      const { response } = error;

      if (!response) {
        throw error;
      }

      const { data } = response;

      this.$buefy.toast.open({
        message: data.detail || this.$t('webapp.settings.default_error'),
        type: 'is-danger',
      });

      if (!data.detail) {
        throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.authorization-item {
  padding: 0 1rem;
  background-color: $color-white;
  border: 1px solid $color-border;
  margin: 0.625rem 0;
  border-radius: 5px;

  &__info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    > * {
      margin: 0.5rem 1rem 0.5rem 0;
    }
  }

  &__avatar {
    box-shadow: 0px 3px 6px #00000029;
  }

  &__icon {
    color: $color-grey-dark;

    &--button {
      cursor: pointer;
    }

    &__container {
      display: flex;
      flex-direction: row-reverse;

      > * {
        margin: 0 0 0.5rem 1rem;
      }
    }
  }
}
</style>
