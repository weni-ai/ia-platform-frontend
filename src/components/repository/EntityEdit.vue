<template>
  <div class="entity-edit__entities-list">
    <div class="entity-edit__title entity-edit__entities-list__header">
      <b-loading :is-full-page="false" :active="loading" />
    </div>
    <badges-card-drag-drop
      :key="`${newGroup}-${needsUpdate}`"
      v-if="editing"
      :list="newGroup"
      :examples-count="newGroup.length"
      :edit="editing"
      :title="$tc('webapp.home.new_group_named', newGroup.length)"
      identifier="newGroup"
      @onCloseTag="onRemoveEntity($event, null)"
      @onMove="moveEntity"
      @onEditGroups="editGroups"
      format
      @close="creating = false"
      @finished="createGroup"
    />
    <badges-card-drag-drop
      :key="needsUpdate"
      :list="ungrouped"
      :examples-count="ungrouped.length"
      :edit="editing"
      :title="$tc('webapp.home.unlabeled', ungrouped.length)"
      identifier="ungrouped"
      @onCloseTag="onRemoveEntity($event, null)"
      @onMove="moveEntity"
      @onEditGroups="editing = !editing"
    />
    <div>
      <badges-card-drag-drop
        v-for="group in groups"
        :identifier="group.group_id"
        :key="`${group.group_id}-${needsUpdate}`"
        :list="group.entities"
        :title="$tc('webapp.home.labeled', group.entities.length, { label_value: group.value, })"
        :examples-count="group.entities.length"
        :example-name="group.value"
        @changedName="group.value = $event"
        :edit="editing"
        closable
        @onMove="moveEntity"
        @onRemoveCard="onRemoveGroup(group)"
        @onCloseTag="onRemoveEntity($event, group.group_id)"
      />
    </div>
    <unnnic-modal
        :showModal="openModal"
        :text="modalTitle"
        scheme="feedback-red"
        modal-icon="alert-circle-1"
        @close="openModal = false"
      >
        <span slot="message" v-html="deleteMessage" />
        <unnnic-button slot="options" type="terciary" @click="openModal = false">
          {{ $t("webapp.home.cancel") }}
        </unnnic-button>
        <unnnic-button
          slot="options"
          class="create-repository__container__button"
          type="primary"
          scheme="feedback-red"
          @click="onDelete"
        >
          {{ deleteButton }}
        </unnnic-button>
      </unnnic-modal>
  </div>
</template>

<script>
import BadgesCardDragDrop from '@/components/repository/BadgesCardDragDrop';
import CreateBadgesCard from '@/components/repository/CreateBadgesCard';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'EntityEdit',
  components: {
    BadgesCardDragDrop,
    CreateBadgesCard,
  },
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
    ungrouped: {
      type: Array,
      default: () => [],
    },
    newGroup: {
      type: Array,
      default: () => [],
    },
    repositoryUuid: {
      type: String,
      required: true,
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      creating: false,
      editing: false,
      loading: false,
      needsUpdate: false,
      openModal: false,
      deleteMessage: '',
      modalTitle: '',
      deleteButton: '',
      group: {},
      groupId: null,
      entity: null,
      isGroup: false
    };
  },
  computed: {
    ...mapGetters({
      version: 'getSelectedVersion',
    }),
  },
  watch: {
    editing() {
      this.creating = false;
    },
  },
  methods: {
    ...mapActions([
      'editEntity',
      'addGroup',
      'deleteEntity',
      'deleteGroup',
      'editGroup',
    ]),
    showError(error) {
      let message = this.$t('webapp.home.default_error');

      if (
        error.response
        && error.response.data
        && error.response.data.non_field_errors
        && error.response.data.non_field_errors.length > 0
      ) { message = error.response.data.non_field_errors.join(', '); }

      this.$buefy.toast.open({
        message,
        type: 'is-danger',
      });
    },
    async createGroup(text) {
      if (!text || text.length === 0) return;
      this.loading = true;
      try {
        const newGroup = await this.addGroup({
          name: text,
          repositoryId: this.repositoryUuid,
          version: this.version,
        });
        this.$emit('createdGroup', {
          ...newGroup.data,
          entities: [],
          group_id: newGroup.data.id,
        });
        this.creating = false;
      } catch (e) {
        this.showError(e);
      } finally {
        this.loading = false;
      }
    },
    updateGroups(from, to, targetList, sourceList) {
      switch (from) {
        case 'ungrouped':
          this.$emit('updateUngrouped', { entities: sourceList });
          break;
        case 'newGroup':
          this.$emit('updateNewGroup', { entities: sourceList });
          break;

        default:
          this.$emit('updateGroup', { entities: sourceList, groupId: from });
          break;
      }

      switch (to) {
        case 'ungrouped':
          this.$emit('updateUngrouped', { entities: targetList });
          break;
        case 'newGroup':
          this.$emit('updateNewGroup', { entities: targetList });
          break;

        default:
          this.$emit('updateGroup', { entities: targetList, groupId: to });
          break;
      }
    },
    async removeEntity(entity, groupId) {
      this.openModal = false
      this.loading = true;
      try {
        await this.deleteEntity({
          entityId: entity.entity_id,
        });
        this.$emit('removeEntity', { entity, groupId });
      } catch (e) {
        this.showError(e);
      } finally {
        this.loading = false;
      }
    },
    async removeGroup(groupId) {
      this.openModal = false
      this.loading = true;
      try {
        await this.deleteGroup({
          groupUuid: groupId,
        });
        this.$emit('removeGroup', groupId);
      } catch (e) {
        this.showError(e);
      } finally {
        this.loading = false;
      }
    },
    async moveEntity(event) {
      const { entity, from, to, targetList, sourceList } = event;
      if (to !== 'newGroup') {
        this.loading = true;
        try {
          await this.editEntity({
            entityId: entity.entity_id,
            name: entity.value,
            repositoryVersion: this.version,
            repositoryId: this.repositoryUuid,
            groupId: to === 'ungrouped' || to === 'newGroup' ? null : to,
          });
          this.updateGroups(from, to, targetList, sourceList);
        } catch (e) {
          this.showError(e);
          this.needsUpdate = !this.needsUpdate;
        } finally {
          this.loading = false;
        }
      } else {
        this.updateGroups(from, to, targetList, sourceList)
      }
    },
    onRemoveEntity(entity, groupId) {
      this.groupId = groupId
      this.entity = entity
      this.openModal = true;
      this.modalTitle = this.$t('webapp.home.delete_entity');
      this.deleteMessage = this.$t('webapp.home.delete_entity_message', {
        entity: entity.value
      });
      this.deleteButton = this.$t('webapp.home.delete');
      this.isGroup = false
    },
    onRemoveGroup(group) {
      this.group = group
      this.openModal = true
      this.modalTitle = this.$t('webapp.home.delete_group');
      this.deleteMessage = this.$t('webapp.home.delete_group_message', {
        group: group.value
      })
      this.deleteButton = this.$t('webapp.home.delete_group');
      this.isGroup = true
    },
    editGroups() {
      this.editing = !this.editing
      this.$emit('onEditGroups')
    },
    onDelete() {
      if (this.isGroup) {
        this.removeGroup(this.group.group_id)
      } else {
        this.removeEntity(this.entity, this.groupId);
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
@import "~@/assets/scss/colors.scss";

.entity-edit {
  &__title {
    font-size: 1.75rem;
    font-weight: $font-weight-medium;
    font-family: $font-family;
    color: $color-fake-black;
  }

  &__button {
    color: white;
    margin-left: 0.5rem;
    margin-top: 0.6rem;
  }

  &__entities-list {
    // padding: 1rem .5rem;
    &__header {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      align-items: center;

      &__container {
        display: flex;
      }
      &__question {
        margin: -0.1rem 0 0 0.2rem;
      }
    }
  }

  &__entities-list {
    &__labeled-count {
      margin-top: $between-title-subtitle;
      margin-bottom: $between-subtitle-content;
    }
  }
}

.tooltipStyle::after {
  font-size: 12px;
  line-height: 13px;
  padding: 1rem 0.5rem;
  font-family: $font-family;
}
</style>
