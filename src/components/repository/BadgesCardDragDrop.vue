<template>
  <div :class="['badges-card', dark ? 'badges-card__dark' : '']">
    <entity-accordion :open.sync="isOpen">
      <div slot="header" class="level">
        <div class="badges-card__header">
          <div v-show="!edit || !fieldInput">
            <span v-html="title"></span>
          </div>
        </div>
      </div>
      <div slot="icon" class="level example-accordion__btns-wrapper">
        <unnnic-icon-svg
          :icon="`${isOpen ? 'arrow-button-down-1' : 'arrow-right-1-1'}`"
          size="sm"
        />
      </div>
      <div slot="options">
        <a
          v-if="edit && identifier === 'newGroup'"
          class="badges-card__link"
          @click.stop="finished()"
        >
          Salvar e fechar
        </a>
        <!-- <a
          v-if="edit && identifier === 'newGroup'"
          class="badges-card__link"
          @click.stop="editGroups()"
        >
          Cancelar edição
        </a> -->
        <a
          v-if="identifier === 'ungrouped'"
          class="badges-card__link"
          @click.stop="editGroups()"
        >
          {{ !edit ? $t("webapp.home.edit_groups") : "" }}
        </a>
        <a
          v-if="edit && identifier !== 'ungrouped' && identifier !== 'newGroup'"
          class="badges-card__link"
          @click.stop="changeEditingInput()"
        >
          Alterar nome
        </a>
        <a
          v-if="closable && edit"
          class="badges-card__link"
          @click.stop="onRemoveCard"
        >
          Excluir grupo
        </a>
      </div>
      <div slot="body">
        <create-badges-card
          v-if="identifier === 'newGroup'"
          :identifier="identifier"
          :disabled="!edit"
          @move="onMove"
          :List="localList"
          @change="onChange"
          @onUpdateList="updateLocalList"
          @onFinished="createGroup"
        />
        <div v-else>
          <draggable
            :disabled="!edit"
            v-model="localList"
            :sort="false"
            :data-id-attr="identifier"
            :move="onMove"
            group="entities"
            class="badges-card__wrapper"
            @change="onChange"
          >
            <entity-tag
              v-for="(item, i) in localList"
              :key="i"
              :class="[
                'badges-card__wrapper__badge',
                `badges-card__wrapper__badge--${edit ? 'moving' : 'locked'}`,
              ]"
              :entity-name="item.value"
              :closable="edit"
              @close="close(item)"
              @click.native="goToEntity(item)"
            />
          </draggable>
        </div>
      </div>
    </entity-accordion>
    <unnnic-modal
        :showModal="openModal"
        :text="$t('webapp.home.edit_group_modal_title')"
        scheme="feedback-yellow"
        modal-icon="alert-circle-1"
        @close="openModal = false"
      >
        <span slot="message" v-html="editMessage" />
        <div slot="message" class="badges-card__header__edit">
            <!-- <p v-html="$tc('webapp.home.labeled', examplesCount)"></p> -->
            <unnnic-input
              :placeholder="$t('webapp.home.edit_group_field_label')"
              v-model="newGroupName"
            >
              <span slot="label" v-html="$t('webapp.home.edit_group_field_title')" />
            </unnnic-input>
            <!-- <b-field class="badges-card__header__edit__field">
              <b-input v-model="groupName" size="is-small" />
            </b-field> -->
            <!-- <div class="badges-card__header__edit__icon">
              <b-icon
                v-if="edit"
                icon="check-bold"
                size="is-small"
                @click.native="saveChange()"
              />
            </div> -->
        </div>
        <unnnic-button slot="options" type="terciary" @click="openModal = false">
          {{ $t("webapp.home.cancel") }}
        </unnnic-button>
        <unnnic-button
          slot="options"
          class="create-repository__container__button"
          type="primary"
          scheme="feedback-yellow"
          @click="saveChange()"
        >
          {{ $t("webapp.home.edit_group_button_label") }}
        </unnnic-button>
      </unnnic-modal>
  </div>
</template>

<script>
import { getEntityColor } from '@/utils/entitiesColors';
import EntityTag from '@/components/repository/repository-evaluate/example/EntityTag';
import draggable from 'vuedraggable';
import { mapActions, mapGetters } from 'vuex';
import { formatters } from '@/utils';
import EntityAccordion from '@/components/shared/accordion/EntityAccordion';
import CreateBadgesCard from '@/components/repository/CreateBadgesCard';

export default {
  name: 'BadgesCardDragDrop',
  components: {
    draggable,
    EntityTag,
    EntityAccordion,
    CreateBadgesCard,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: () => [],
    },
    examplesCount: {
      type: Number,
      default: null,
    },
    dark: {
      type: Boolean,
      default: null,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    closable: {
      type: Boolean,
      default: null,
    },
    identifier: {
      type: null,
      default: null,
    },
    exampleName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      entity: null,
      to: null,
      localList: [],
      targetList: [],
      groupName: this.exampleName,
      fieldInput: false,
      isOpen: false,
      openModal: false,
      editMessage: '',
      newGroupName: '',
    };
  },
  computed: {
    ...mapGetters({
      version: 'getSelectedVersion',
      repositoryUuid: 'getSelectedVersionRepository',
    }),
    nameList() {
      return this.localList.map((item) => item.value || item);
    },
  },
  watch: {
    list() {
      this.updateLocalList();
    },
    groupName() {
      this.groupName = formatters.bothubItemKey()(this.groupName.toLowerCase());
      this.$emit('changedName', this.groupName);
    },
  },
  mounted() {
    this.updateLocalList();
  },
  methods: {
    ...mapActions(['editGroup']),
    goToEntity(entity) {
      if (this.edit) return;
      const { entity_id } = entity;
      this.$router.push({
        name: 'repository-entitylist',
        params: { entity_id },
      });
    },
    changeEditingInput() {
      this.openModal = true;
      this.editMessage = this.$t('webapp.home.edit_group_modal_subtitle', {
        group: this.groupName
      });
      // this.fieldInput = !this.fieldInput;
    },
    async saveChange() {
      // this.fieldInput = !this.fieldInput;
      this.openModal = false;
      try {
        await this.editGroup({
          name: this.newGroupName,
          groupId: this.identifier,
          repositoryId: this.repositoryUuid,
          version: this.version,
        });
        this.newGroupName = formatters.bothubItemKey()(this.newGroupName.toLowerCase());
        this.$emit('changedName', this.newGroupName)
      } catch (err) {
        this.$buefy.toast.open({
          message: this.$t('webapp.settings.default_error'),
          type: 'is-danger',
        });
      }
    },
    getEntityClass(entity) {
      const color = getEntityColor(entity, this.nameList);
      return `entity-${color}`;
    },
    onRemoveCard() {
      this.$emit('onRemoveCard');
    },
    close(entity) {
      this.$emit('onCloseTag', entity);
    },
    onMove({ draggedContext, relatedContext }) {
      this.to = relatedContext.component.$attrs['data-id-attr'];
      this.entity = draggedContext.element;
      this.targetList = [...relatedContext.list, this.entity];
      console.log(this.to, this.entity, this.targetList)
    },
    onChange() {
      if (this.entity == null || this.to == null) return;
      this.$emit('onMove', {
        from: this.identifier,
        to: this.to,
        entity: this.entity,
        targetList: this.targetList,
        sourceList: this.localList,
      });
      this.entity = null;
      this.to = null;
      this.targetList = [];
    },
    updateLocalList() {
      this.localList = [...this.list];
    },
    editGroups() {
      this.$emit('onEditGroups');
    },
    finished() {
      // this.$emit('finished');
      this.$emit('onEditGroups');
    },
    createGroup(text) {
      this.$emit('finished', text)
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

@function borderDashed($color) {
  @return url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23#{str-slice(quote($color), 2)}' stroke-width='4' stroke-dasharray='4%2c 12' stroke-dashoffset='9' stroke-linecap='square'/%3e%3c/svg%3e");
}
.drag-area {
  &__dropzone {
    border-radius: $unnnic-border-radius-lg;
    background-color: $unnnic-color-background-carpet;
    padding: 1rem;
    margin: 1rem;
    // Dashed border with increased dashes spacing and color neutral clean
    background-image: borderDashed($unnnic-color-neutral-clean);
    &__has-error {
      background-image: borderDashed($unnnic-color-feedback-red);
    }
    &__is-dragover {
      background-color: $unnnic-color-background-sky;
      background-image: borderDashed($unnnic-color-brand-weni);
    }
    &__icon {
      display: block;
      margin: 0 auto;
      margin-bottom: $unnnic-spacing-stack-sm;
    }
    &__content {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-stack-nano;
      text-align: center;
      font-family: $unnnic-font-family-secondary;
      &__title {
        color: $unnnic-color-neutral-cloudy;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        &__search {
          color: $unnnic-color-brand-weni;
        }
        &__error {
          color: $unnnic-color-feedback-red;
        }
      }
      &__subtitle {
        color: $unnnic-color-neutral-cloudy;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
        &__error {
          color: $unnnic-color-feedback-red;
        }
      }
    }
  }
  &__cards {
    margin-top: $unnnic-spacing-stack-md;
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-stack-xs;
  }
}
.drag-area__dropzone__dragndrop,
.drag-area__dropzone__uploading,
.drag-area__dropzone__success,
.drag-area__dropzone__error {
  display: none;
}

.badges-card {
  // padding: 0.75rem;
  margin: 0.75rem 0;
  // border: 1px solid $color-border;
  // border-radius: 6px;

  &__dark {
    background-color: $color-fake-white;
    border: 1px solid $color-fake-white;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    font-family: $font-family;

    &__edit {
      text-align: left;
      margin-top: 2rem;

      p {
        min-width: 50%;
      }

      &__icon {
        color: $color-grey-dark;
        margin-left: 0.4rem;
      }
    }
  }

  &__link {
    color: $unnnic-color-neutral-cloudy;
    text-decoration: underline;
    margin: 1rem;
  }

  &__wrapper {
    margin: 0.75rem 0.5rem;
    display: flex;
    flex-wrap: wrap;

    &__badge {
      height: 1.5rem;
      margin: 0.4rem 0.5rem 0 0;
      font-weight: bold;
      line-height: calc(1.5rem - 4px);
      border-width: 1px;

      &--moving {
        cursor: move;
      }

      &--locked {
        cursor: pointer;
      }
    }
  }
}
</style>
