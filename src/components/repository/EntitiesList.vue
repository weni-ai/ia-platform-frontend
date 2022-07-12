<template>
  <div class="entity-list">
    <div class="entity-list__content">
      <div class="entity-list__content__descriptions">
        <div @click="goToSummary" class="entity-list__content__back-button">
          <unnnic-icon-svg icon="keyboard-arrow-left-1" size="md" />
        </div>
        <h1>
          {{ $t("webapp.entity.title") }}
          <span> "{{ entitySelected }}" </span>
        </h1>
      </div>
      <div class="entity-list__buttons-wrapper">
        <unnnic-button
          ref="editEntityEvent"
          @click="editOptionsEntity()"
          class="mr-2"
          type="secondary"
          size="large"
          :text="$t('webapp.entity.edit_button')"
        />
        <unnnic-button
          @click="deleteSelectedItems"
          type="secondary"
          size="large"
          :text="`Excluir selecionados (${selectedItems.length})`"
          :disabled="selectedItems.length === 0"
        />
      </div>
    </div>
    <div class="entity-list__subtitle">
      <p>{{ $tc("webapp.entity.description", totalSentences) }}</p>
    </div>
    <unnnic-modal
      :showModal="openModal"
      :text="$t('webapp.entity.edit_entity_modal_title')"
      scheme="feedback-yellow"
      modal-icon="alert-circle-1"
      @close="openModal = false"
    >
      <span
        slot="message"
        v-html="
          $t('webapp.entity.edit_entity_modal_subtitle', {
            entity: entitySelected,
          })
        "
      />
      <div slot="message" class="text-left">
        <unnnic-input
          :placeholder="$t('webapp.entity.edit_entity_field_label')"
          v-model="newEntityName"
        >
          <span
            slot="label"
            v-html="$t('webapp.entity.edit_entity_field_title')"
          />
        </unnnic-input>
      </div>
      <unnnic-button slot="options" type="terciary" @click="openModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        class="create-repository__container__button"
        type="primary"
        scheme="feedback-yellow"
        @click="saveEdition()"
      >
        {{ $t("webapp.entity.edit_entity_button_label") }}
      </unnnic-button>
    </unnnic-modal>
    <unnnic-modal
      :showModal="openSuccessModal"
      :text="$t('webapp.intent.success_modal_title')"
      scheme="feedback-green"
      modal-icon="check-circle-1-1"
      @close="openSuccessModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.intent.success_modal_subtitle')" />
    </unnnic-modal>
    <unnnic-modal
      :showModal="openDeleteModal"
      :text="$t('webapp.trainings.delete_title')"
      scheme="feedback-red"
      modal-icon="alert-circle-1"
      @close="openDeleteModal = false"
    >
      <span
      slot="message"
      v-html="$t('webapp.trainings.delete_phrase_modal')" />
      <unnnic-button slot="options" type="terciary" @click="openDeleteModal = false">
        {{ $t("webapp.home.cancel") }}
      </unnnic-button>
      <unnnic-button
        slot="options"
        type="primary"
        scheme="feedback-red"
        @click="deleteSelectedItems"
      >
        {{ $t("webapp.trainings.delete_title") }}
      </unnnic-button>
    </unnnic-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { getEntityColor } from '@/utils/entitiesColors';
import { formatters } from '@/utils';

export default {
  name: 'EntitiesList',
  props: {
    entitiesList: {
      type: Object,
      default: null,
    },
    entityName: {
      type: String,
      default: '',
    },
    repository: {
      type: Object,
      default: () => {},
    },
    selectedItems: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      editSentences: false,
      entityId: this.$route.params.entity_id,
      allEntities: [],
      errors: {},
      entitySelected: '',
      deleteDialog: null,
      openModal: false,
      openSuccessModal: false,
      openDeleteModal: false,
      newEntityName: '',
    };
  },
  computed: {
    ...mapGetters({
      repositoryVersion: 'getSelectedVersion',
      repositoryList: 'getCurrentRepository',
    }),
    totalSentences() {
      if (this.entitiesList !== null) {
        return this.entitiesList.total;
      }
      return 0;
    },
  },
  watch: {
    entitySelected() {
      this.entitySelected = formatters.bothubItemKey()(this.entitySelected);
      this.$emit('update:entityName', this.entitySelected);
    },
  },
  mounted() {
    this.getEntitiesName();
    this.getSelectedEntity();
  },
  methods: {
    ...mapActions(['editEntityName', 'setUpdateRepository', 'deleteExample']),
    getEntityClass() {
      const color = getEntityColor(this.entitySelected, this.allEntities);
      return `entity-${color}`;
    },
    async getEntitiesName() {
      const allEntitiesName = await this.repository.entities.map(
        (entityValue) => entityValue.value
      );
      this.allEntities = allEntitiesName;
    },
    async getSelectedEntity() {
      const entity = await this.repositoryList.entities.find(
        (entityValue) => entityValue.id === Number(this.entityId)
      );
      this.entitySelected = entity.value;
    },
    editOptionsEntity() {
      // this.editSentences = !this.editSentences;
      this.openModal = true;
    },
    async saveEdition() {
      try {
        await this.editEntityName({
          group: {
            repository: this.repositoryList.uuid,
          },
          entityId: this.entityId,
          value: this.newEntityName,
          repositoryVersion: this.repositoryVersion,
        });
        this.$emit('saveEdition');
        this.entitySelected = this.newIntentName;
        this.openModal = false;
        this.openSuccessModal = true
      } catch (error) {
        if (error.response.data.non_field_errors !== undefined) {
          this.$buefy.toast.open({
            message: this.$t('webapp.entity.error_entity_exists'),
            type: 'is-danger',
          });
        } else {
          this.$buefy.toast.open({
            message: this.$t('webapp.entity.error_entity'),
            type: 'is-danger',
          });
        }
      }
      // this.editOptionsEntity();
    },
    deleteSelectedItems() {
      this.selectedItems.forEach((item) => {
        this.deleteExample({ id: item.id });
        this.$emit('itemDeleted');
        this.openDeleteModal = false;
      });
    },
    goToSummary() {
      this.$router.push(
        `/dashboard/${this.$route.params.ownerNickname}/${this.$route.params.slug}/`
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/colors.scss";
@import "~@/assets/scss/variables.scss";
.entity-list {
  margin: 0.4rem;
  margin-left: 2.8rem !important;
  margin-bottom: 2rem !important;
  &__options {
    p {
      font-size: $font-size;
    }

  }

  &__subtitle {
    p {
      font-family: "Lato";
      font-size: 14px;
      color: #4e5666;
    }
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__descriptions {
      display: flex;

      &__tag {
        margin: 0.2rem 0.5rem;
        border-radius: 1rem;
        padding: 0 1.1rem;

        div {
          font-size: 1.12rem;
          font-family: $font-family;
          margin-bottom: 0.1rem;
        }
      }
      &__editEntityName {
        margin: 0.2rem 0.5rem;
        width: 10rem;
      }
    }

    h1 {
      font-size: 1.75rem;
    }

    &__buttonEdit {
      width: 9.9rem;
      margin-bottom: 0.5rem;
      background-color: $color-primary;
      color: #ffffff;
    }
    &__buttonSave {
      width: 9.9rem;
      margin-bottom: 0.5rem;
      background-color: $color-secondary-light;
      color: #ffffff;
    }

     h1 {
      font-family: "Aleo";
      font-size: 20px;
      color: #272b33;
    }

    &__back-button {
      cursor: pointer;
      margin-left: -2.5rem;
      margin-right: 1rem;
    }
  }

  &__notification {
    margin: 0.5rem;

    @media screen and (max-width: 50em) {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
  }

  &__buttons-wrapper {
    position: relative;
    top: 16px;
  }
}
</style>
