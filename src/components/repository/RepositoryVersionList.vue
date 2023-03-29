<template>
  <div>
    <intent-pagination
      v-if="versionsList"
      :item-component="versionTable"
      :list="versionsList"
      :repository="repository"
      :per-page="perPage"
      @deletedVersion="onDeletedVersion"
      @itemSave="saveVersion"
      @onEditVersion="editVersion"
      @addedVersion="onAddedVersion"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PaginatedList from '@/components/shared/PaginatedList';
import { formatters } from '@/utils/index';
import IntentPagination from '../shared/IntentPagination';
import RepositoryVersionTable from '@/components/repository/RepositoryVersionTable';

export default {
  name: 'RepositoryVersionList',
  components: {
    PaginatedList,
    IntentPagination
  },
  props: {
    repository: {
      type: Object,
      required: true,
    },
    perPage: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      maxEditLength: 40,
      versionsList: null,
      asc: false,
      isEdit: {},
      currentPage: 1,
      isNewVersionModalActive: false,
      selectedVersion: null,
      loadingEdit: false,
      loadingList: false,
      currentEditVersion: null,
      pageWasChanged: false,
      versionTable: RepositoryVersionTable
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      /* repository: 'getCurrentRepository', */
    }),
    repositoryUUID() {
      if (!this.repository || this.repository.uuid === 'null') { return null; }
      return this.repository.uuid;
    },
    query() {
      return {
        repository: this.repositoryUUID,
        ordering: `${this.asc ? '+' : '-'}${this.orderField}`,
      };
    },
  },
  watch: {
    query() {
      this.updateParams();
    },
    currentPage() {
      this.updateVersions();
    },
    repositoryUUID() {
      this.updateParams();
    },
  },
  mounted() {
    this.updateParams();
  },
  methods: {
    ...mapActions([
      'getVersions',
      'setDefaultVersion',
      'deleteVersion',
      'editVersion',
      'setRepositoryVersion',
      'setUpdateVersionsState',
      'setRequirements',
    ]),
    /* onCancelEdit() {
      this.$nextTick(() => { this.isEdit.edit = false; });
    }, */
    sort(orderField, asc) {
      this.orderField = orderField;
      this.asc = asc === 'asc';
      this.updateVersions();
    },
    onEditNameChange(value) {
      this.$nextTick(() => {
        this.isEdit.name = formatters.versionItemKey()(value);
      });
    },
    async updateParams() {
      if (!this.repositoryUUID) { return; }
      const response = await this.getVersions({
        limit: this.perPage,
        query: this.query,
      });
      this.versionsList = response;
      this.updateVersions();
    },
    async updateVersions() {
      this.loadingList = true;
      try {
        await this.versionsList.updateItems(this.currentPage);
        this.loadingList = false;
      } catch (e) {
        this.loadingList = false;
        this.showError(e);
      }
    },
    /* handleDefaultVersion(id, name) {
      this.$buefy.dialog.confirm({
        title: this.$t('webapp.versions.change_default_version'),
        message: this.$t('webapp.versions.message_change_default_version', { name }),
        confirmText: this.$t('webapp.versions.confirm_change_default_version'),
        type: 'is-warning',
        hasIcon: true,
        onConfirm: () => this.setDefaultVersion({
          repositoryUuid: this.repositoryUUID,
          id,
          name,
        }).then(() => this.updateVersions()),
      });
    }, */
    onEditVersion(version) {
      const { id, name } = version;
      this.isEdit = {
        edit: true,
        id,
        name,
      };
    },
    /* handleEditVersion(name, id) {
      if (!name || !(name.length > 0)) {
        this.isEdit = false;
        return;
      }
      this.editVersion({
        repositoryUuid: this.repositoryUUID,
        id,
        name,
      }).then(() => {
        this.setUpdateVersionsState(true);
        this.$buefy.toast.open({
          message: this.$t('webapp.versions.version_has_edited'),
          type: 'is-success',
        });
        this.isEdit = false;
        this.updateVersions();
      }).catch(() => {
        this.$buefy.toast.open({
          message: this.$t('webapp.versions.something_wrong'),
          type: 'is-danger',
        });
      });
    }, */
    handleVersion(id, name) {
      const version = {
        id,
        name,
      };
      this.setRepositoryVersion({
        version,
        repositoryUUID: this.repositoryUUID,
      });
    },
    copyVersion(version) {
      this.selectedVersion = version;
      this.isNewVersionModalActive = true;
    },
    onAddedVersion() {
      this.setUpdateVersionsState(true);
      this.updateVersions();
    },
    /* onDeleteVersion(id, isDefault) {
      if (isDefault) {
        this.$buefy.toast.open({
          duration: 5000,
          message: this.$t('webapp.versions.you_cannot_delete_main_branch'),
          position: 'is-top',
          type: 'is-danger',
        });
      } else {
        this.$buefy.dialog.confirm({
          title: this.$t('webapp.versions.deleting_version'),
          message: this.$t('webapp.versions.message_deleting_version'),
          confirmText: this.$t('webapp.versions.confirm_deleting_version'),
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => this.onDeleteVersionConfirm(id),
        });
      }
    }, */
    async onDeleteVersionConfirm(id) {
      try {
        this.loadingList = true;
        await this.deleteVersion(id);
        this.setUpdateVersionsState(true);
        this.updateVersions();
      } catch (e) {
        this.showError(e);
      } finally {
        this.loadingList = false;
      }
    },
    showError(error) {
      // TODO: Treat errors
      this.$buefy.toast.open({
        message: error.response.data,
        type: 'is-danger',
      });
    },
    saveVersion() {
      this.setUpdateVersionsState(true);
      this.updateVersions();
    },
    pageChanged() {
      this.pageWasChanged = !this.pageWasChanged;
    },
    onDeletedVersion() {
      this.setUpdateVersionsState(true);
      this.updateVersions();
    },
  },
};
</script>
