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
                @click.prevent.stop="editVersion(item.id)"
              />
            </div>
          </template>
          <template v-if="repository.authorization.can_contribute" v-slot:duplicate>
            <div :style="{ textAlign: 'center' }">
              <unnnic-button
                size="small"
                type="secondary"
                iconCenter="copy-paste-1"
                @click.prevent.stop="duplicateThisVersion(item.id)"
              />
            </div>
          </template>
          <template v-if="repository.authorization.can_contribute" v-slot:delete>
            <div :style="{ textAlign: 'center' }">
              <unnnic-button
                size="small"
                type="secondary"
                iconCenter="delete-1-1"
                @click.prevent.stop="deleteThisVersion(item.id)"
              />
            </div>
          </template>
        </unnnic-table-row>
        <edit-example-version
          v-if="item.id === selectedItem"
          :entities="item.entities"
          :intent-to-edit="item.intent"
          :edit-example="true"
          :text-to-edit="item.text"
          :version-id="item.id"
          :language-edit="item.language"
          :get-all-entities="getEntitiesName"
          @saveList="updateList"
          @cancel="cancelEditVersion"
        />
      </template>
    </unnnic-table>
    <unnnic-modal
      :showModal="openModal"
      :text="$t('webapp.versions.delete_title_modal')"
      scheme="feedback-red"
      modal-icon="alert-circle-1"
      @close="openModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.versions.delete_phrase_modal')"></span>
      <unnnic-button slot="options" type="terciary" @click="openModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="confirmDelete()"
      >
        {{ $t("webapp.versions.delete_title_modal") }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-modal
      :showModal="openSuccessModal"
      :text="$t('webapp.versions.delete_success_title_modal')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.versions.delete_success_phrase_modal')"></span>
    </unnnic-modal>

    <unnnic-modal
      :showModal="openDuplicateModal"
      :text="$t('webapp.versions.duplicate_title_modal')"
      scheme="feedback-red"
      modal-icon="alert-circle-1"
      @close="openDuplicateModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.versions.duplicate_phrase_modal')"></span>
      <unnnic-button slot="options" type="terciary" @click="openDuplicateModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="confirmDuplicate()"
      >
        {{ $t("webapp.versions.duplicate_success_button_modal") }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-modal
      :showModal="openSuccessModal"
      :text="$t('webapp.versions.duplicate_success_title_modal')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.versions.duplicate_success_phrase_modal')"></span>
    </unnnic-modal>
  </div>
  </template>

<script>
import { mapState, mapActions } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import ExampleInfo from '@/components/shared/accordion/ExampleInfo';
import EditExampleIntent from '@/components/shared/accordion/EditExampleIntent';
import EditExampleVersion from '@/components/shared/accordion/EditExampleVersion';
import EditExample from '@/components/shared/accordion/EditExample';
import SentenceAccordion from '@/components/shared/accordion/SentenceAccordion';
import HighlightedEntity from '@/components/shared/HighlightedEntity';
import LanguageBadge from '@/components/shared/LanguageBadge';
import BadgesCard from '@/components/repository/BadgesCard';

export default {
  name: 'RepositoryVersionTable',
  components: {
    SentenceAccordion,
    ExampleInfo,
    EditExampleVersion,
    EditExample,
    HighlightedEntity,
    LanguageBadge,
    BadgesCard,
  },
  props: {
    text: {
      type: String,
      default: '',
    },
    entities: {
      type: Array,
      default: /* istanbul ignore next */ () => [],
    },
    intent: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    entitySelected: {
      type: String,
      default: null,
    },
    list: {
      type: Object,
      default: () => {},
    },
    showIntents: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      open: false,
      deleteDialog: null,
      remove: true,
      highlighted: null,
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
      openModal: false,
      openDuplicateModal: false,
      versionId: null,
      openSuccessModal: false,
      isVersionActive: false,
    };
  },

  computed: {
    ...mapState({
      repository: (state) => state.Repository.selectedRepository,
    }),
    entitiesList() {
      return this.entities.map((entity) => ({
        value: entity.value,
        class: this.getEntityClass(entity.entity),
        group: entity.group,
        ...entity,
      }));
    },
    getEntitiesName() {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value
      );
      return allEntitiesName;
    },
    generalValue() {
      if (!this.list.items.find((item) => item.selected)) {
        return false;
      }

      if (!this.list.items.find((item) => !item.selected)) {
        return true;
      }

      return 'less';
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
          width: '40px',
        },
        {
          id: 'duplicate',
          text: this.$t('webapp.versions.table_duplicate'),
          width: '40px',
        },
        {
          id: 'delete',
          text: this.$t('webapp.versions.table_delete'),
          width: '40px',
        })
    }
  },
  methods: {
    ...mapActions(['deleteEvaluateExample', 'deleteExample']),
    getEntityClass(entity) {
      const allEntitiesName = this.repository.entities.map(
        (entityValue) => entityValue.value
      );
      const color = getEntityColor(entity, allEntitiesName);
      return `entity-${color}`;
    },
    deleteThisVersion(id) {
      this.openModal = true;
      this.versionId = id;
    },
    duplicateThisVersion(id) {
      this.openDuplicateModal = true;
      this.versionId = id;
    },
    async confirmDelete() {
      try {
        await this.deleteExample({ id: this.versionId });
        this.$emit('dispatchEvent', { event: 'itemDeleted' });
        this.openModal = false;
        setTimeout(() => { this.openSuccessModal = true }, 2000);
      } catch {
        this.$emit('dispatchEvent', { event: 'error' });
      }
    },
    async confirmDuplicate() {
      try {
        await this.duplicateExample({ id: this.versionId });
        this.$emit('dispatchEvent', { event: 'itemDuplicate' });
        this.openDuplicateModal = false;
        setTimeout(() => { this.openSuccessModal = true }, 2000);
      } catch {
        this.$emit('dispatchEvent', { event: 'error' });
      }
    },
    cancelEditVersion() {
      this.open = !this.open;
      this.editing = false;
      this.$refs[this.selectedItem].active = false
      this.selectedItem = null;
    },
    editVersion(id) {
      this.selectedItem = id
      this.open = true;
      this.editing = true;
      this.$refs[id].active = true
    },
    updateList() {
      this.$emit('updateList');
    },
    changeGeneralCheckbox(value) {
      this.list.items = this.list.items.map((item) => ({
        ...item,
        selected: value,
      }));
    },
    activeVersion(item) {
      const { id } = item
      if (!this.editing) {
        this.$refs[id].active = true
      }
    },
    inactiveVersion(item) {
      const { id } = item
      if (!this.editing) {
        this.$refs[id].active = false
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.example-accordion {
  &__text {
    max-width: 100%;
    font-family: $font-family;
  }

  &__tag {
    margin-right: 0.5rem;
    font-weight: 900;
    font-size: 14px;
    color: #d0d3d9;
  }

  &__icon {
    color: $color-grey-dark;
  }

  &__btns-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  &__sentence {
    color: $unnnic-color-neutral-darkest;
    display: flex;
  }
}

.intent-label {
  font-family: 'Lato';
  font-size: 12px;
  color: #67738B;
  padding-top: 1px;
}

/deep/ .test > .item {
  background-color: blue;
}

/deep/ .scroll {
  padding-right: 0;
}

/deep/ .header .break-text {
  overflow: initial;
}
/deep/ .unnnic-table .item {
  border: 1px solid white;

  &:last-child {
    margin-bottom: 0;
  }
}
/deep/ .unnnic-table .item:hover {
  border: 1px solid $unnnic-color-neutral-soft;
}
/deep/ .test .unnnic-table .item {
  background: black;
}
</style>
