<template>
  <div>
    <unnnic-table :items="list.items">
      <template v-slot:header>
        <unnnic-table-row :headers="table.headers">
        </unnnic-table-row>
      </template>
      <template v-slot:item="{ item }">
        <unnnic-table-row :headers="table.headers">
          <template v-slot:version>
            {{ item.name }}
            <unnnic-button
              :class="item.is_default ? 'button-green' : 'button-disabled'">
              {{ $t('webapp.versions.main') }}
            </unnnic-button>
          </template>
          <template v-slot:date>
            {{ item.created_at | moment('from') }}
          </template>
          <template v-slot:modification>
            {{ item.last_update | moment('from') }}
          </template>
          <template v-slot:created>
            {{ item.created_by }}
          </template>
          <template v-if="repository.authorization.can_contribute" v-slot:edit>
            <div :style="{ textAlign: 'center' }">
              <unnnic-button
                size="small"
                type="secondary"
                iconCenter="pencil-write-1"
                @click.prevent.stop="editVersionAccordion(item)"
              />
            </div>
          </template>
          <template v-if="repository.authorization.can_contribute" v-slot:duplicate>
            <div :style="{ textAlign: 'center' }">
              <unnnic-button
                size="small"
                type="secondary"
                iconCenter="copy-paste-1"
                @click.prevent.stop="duplicateThisVersion(item.id, item.name)"
              />
            </div>
          </template>
          <template v-if="repository.authorization.can_contribute" v-slot:delete>
            <div :style="{ textAlign: 'center' }">
              <unnnic-button
                size="small"
                type="secondary"
                iconCenter="delete-1-1"
                @click.prevent.stop="deleteThisVersion(item.id, item.name, item.is_default)"
              />
            </div>
          </template>
        </unnnic-table-row>
        <edit-example-version
          v-if="item.id === selectedItem"
          :edit-example="true"
          :text-to-edit="item.name"
          :version-id="item.id"
          :is-default="item.is_default"
          @save="saveVersion"
          @cancel="selectedItem=null"
        />
      </template>
    </unnnic-table>
    <unnnic-modal-next
      type="alert"
      icon="alert-circle-1"
      scheme="feedback-yellow"
      v-if="openEditModal"
      :actionPrimaryLabel="$t('webapp.versions.edit_confirm_button')"
      :actionSecondaryLabel="$t('webapp.home.cancel')"
      @click-action-secondary="openEditModal = false"
      :title="$t('webapp.versions.edit_title_modal', { name: versionName })"
    >
      <template slot="description">
        {{ $t('webapp.versions.edit_phrase_modal') }}
      </template>
    </unnnic-modal-next>
    <unnnic-modal-next
      v-if="openDeleteModal"
      type="alert"
      icon="alert-circle-1"
      :title="$t('webapp.versions.delete_title_modal')"
      scheme="feedback-red"
      modal-icon="alert-circle-1"
      @close="openDeleteModal = false"
      :actionPrimaryLabel="$t('webapp.versions.delete_title_modal')"
      :actionSecondaryLabel="$t('webapp.home.cancel')"
      @click-action-secondary="openDeleteModal = false"
      @click-action-primary="confirmDelete"
      actionPrimaryButtonType="secondary"
    >
      <span
      slot="description"
      v-html="$t('webapp.versions.delete_phrase_modal', { name: versionName })"></span>
    </unnnic-modal-next>

    <unnnic-modal-next
      type="alert"
      icon="alert-circle-1"
      scheme="feedback-yellow"
      v-if="openDuplicateModal"
      :actionPrimaryLabel="$t('webapp.versions.duplicate_confirm_button')"
      :actionSecondaryLabel="$t('webapp.home.cancel')"
      @click-action-secondary="openDuplicateModal = false"
      @click-action-primary="confirmDuplicate"
      actionPrimaryButtonType="secondary"
      :title="$t('webapp.versions.duplicate_title_modal', { name: versionName })"
    >
      <template slot="description">
        {{ $t('webapp.versions.duplicate_phrase_modal') }}
        <unnnic-input-next
          :label="$t('webapp.versions.duplicate_input_label')"
          :placeholder="$t('webapp.versions.duplicate_input_placeholder')"
          class="input-duplicate-version"
          v-model="newVersion"
        >
        </unnnic-input-next>
      </template>
    </unnnic-modal-next>
    <unnnic-modal
      :showModal="openSuccessModal"
      :text="$t(successModalTitle)"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
      slot="message"
      v-html="$t(successModalMessage)"></span>
    </unnnic-modal>
  </div>
  </template>

<script>
import { mapState, mapActions } from 'vuex';
import EditExampleVersion from '@/components/shared/accordion/EditExampleVersion';
import { unnnicCallAlert } from '@weni/unnnic-system';

export default {
  name: 'RepositoryVersionTable',
  components: {
    EditExampleVersion
  },
  props: {
    list: {
      type: Object,
      default: () => {},
    },
    textToEdit: {
      type: String
    }
  },
  data() {
    return {
      open: false,
      editing: false,
      table: {
        headers: [
          {
            id: 'version',
            text: this.$t('webapp.versions.version'),
            flex: 1,
          },
          {
            id: 'date',
            text: this.$t('webapp.versions.date_created'),
            flex: 1,
          },
          {
            id: 'modification',
            text: this.$t('webapp.versions.last_modified'),
            flex: 1,
          },
          {
            id: 'created',
            text: this.$t('webapp.versions.created_by'),
            flex: 1,
          },
        ],
      },
      selectedItem: null,
      openDeleteModal: false,
      openDuplicateModal: false,
      openEditModal: false,
      openSuccessModal: false,
      versionId: null,
      isVersionActive: false,
      versionName: '',
      newVersion: '',
      successModalTitle: '',
      successModalMessage: '',
    };
  },
  created(){
    this.newVersion = this.textToEdit;
  },
  computed: {
    ...mapState({
      repository: (state) => state.Repository.selectedRepository,
    }),
    repositoryUUID() {
      if (!this.repository || this.repository.uuid === 'null') { return null; }
      return this.repository.uuid;
    },
    selectedItems() {
      return this.list.items.filter((item) => item.selected === true)
    },
  },
  watch: {
    selectedItems() {
      this.$emit('dispatchEvent', { event: 'onUpdateSelected', value: this.selectedItems });
    },
    version(value) {
      if (value) {
        const { id } = value
        this.$refs[id].active = this.isVersionActive
      }
    }
  },
  mounted() {
    if (this.repository.authorization.can_contribute) {
      this.table.headers
        .push({
          id: 'edit',
          text: this.$t('webapp.versions.table_edit'),
          width: '58px',
        },
        {
          id: 'duplicate',
          text: this.$t('webapp.versions.table_duplicate'),
          width: '58px',
        },
        {
          id: 'delete',
          text: this.$t('webapp.versions.table_delete'),
          width: '58px',
        })
    }
  },
  methods: {
    ...mapActions([
      'deleteVersion',
      'setDefaultVersion',
      'editVersion',
      'addNewVersion'
    ]),
    deleteThisVersion(id, versionName, isDefaultVersion) {
      if (isDefaultVersion) {
        unnnicCallAlert({
          props: {
            title: this.$t('webapp.versions.delete_alert_text'),
            icon: 'alert-circle-1',
            scheme: 'feedback-red',
            position: 'top-right',
            closeText: this.$t('close'),
          },
          seconds: 5,
        });
      } else {
        this.openDeleteModal = true;
        this.versionId = id;
        this.versionName = versionName;
      }
    },
    async confirmDelete() {
      try {
        await this.deleteVersion(this.versionId);
        this.$emit('dispatchEvent', { event: 'deletedVersion', value: this.selectedItems });
        this.openDeleteModal = false;
        this.openSuccessModal = true;
        this.successModalTitle = 'webapp.versions.delete_success_title_modal';
        this.successModalMessage = 'webapp.versions.delete_success_phrase_modal';
      } catch {
        this.$emit('dispatchEvent', { event: 'error' });
      }
    },
    duplicateThisVersion(id, versionName) {
      this.openDuplicateModal = true;
      this.versionId = id;
      this.versionName = versionName;
    },
    async confirmDuplicate() {
      await this.addNewVersion({
        repositoryUUID: this.repositoryUUID,
        versionUUID: this.versionId,
        name: this.newVersion,
      })
        .then(() => {
          this.openDuplicateModal = false;
          this.$emit('dispatchEvent', { event: 'addedVersion', value: this.selectedItems });
          this.openSuccessModal = true;
          this.successModalTitle = 'webapp.versions.duplicate_success_title_modal';
          this.successModalMessage = 'webapp.versions.duplicate_success_phrase_modal';
        })
        .catch((error) => {
          this.$emit('error', error);
        });
    },
    async saveVersion({ versionName, isDefaultVersion }) {
      if (isDefaultVersion) {
        await this.setDefaultVersion({
          repositoryUuid: this.repositoryUUID,
          id: this.selectedItem,
          name: versionName,
        })
          .then(() => {
            this.openSuccessModal = true;
            this.successModalTitle = 'webapp.versions.edit_success_title_modal';
            this.successModalMessage = 'webapp.versions.edit_success_phrase_modal';
            this.$emit('dispatchEvent', { event: 'itemSave' });
          })
          .catch((error) => {
            this.$emit('error', error);
          });
      }
      if (versionName !== this.item.name) {
        await this.editVersion({
          repositoryUuid: this.repositoryUUID,
          id: this.selectedItem,
          name: versionName,
        })
          .then(() => {
            this.openSuccessModal = true;
            this.successModalTitle = 'webapp.versions.edit_success_title_modal';
            this.successModalMessage = 'webapp.versions.edit_success_phrase_modal';
            this.$emit('dispatchEvent', { event: 'itemSave' });
          })
          .catch((error) => {
            this.$emit('error', error);
          });
      }
      this.selectedItem = null
    },
    cancelEditVersion() {
      this.open = !this.open;
      this.editing = false;
      this.$refs[this.selectedItem].active = false
      this.selectedItem = null;
    },
    editVersionAccordion(item) {
      this.selectedItem = item.id
      this.open = true;
      this.editing = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.button-green {
  background: rgba(0, 158, 150, 0.16);
  padding: 2px 6px;
  font-size: $unnnic-font-size-body-sm;
  color: $unnnic-color-brand-weni-soft;
  font-weight: $unnnic-font-weight-bold;
  line-height: 16px;
  text-transform: uppercase;
  margin-left: 16px;
}
.button-disabled {
  display: none;
}

.input-duplicate-version {
  text-align: left;
  margin-top: $unnnic-spacing-stack-lg,
}

.unnnic-modal {
  /deep/ .icon {
    width: 100%;
    margin-top: 10px;
  }
}

/deep/ .unnnic-modal.type-alert .title{
  padding-bottom: 0px
}
</style>
