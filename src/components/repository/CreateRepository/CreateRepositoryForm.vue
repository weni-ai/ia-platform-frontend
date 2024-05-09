<template>
  <div class="create-repository">
    <div class="create-repository__container">
      <section class="create-repository__container__steps">
        <IntelligenceTab
          :name.sync="data.name"
          :description.sync="data.description"
          :repository_type.sync="data.repository_type"
        />
      </section>
      <section class="create-repository__container__steps">
        <DefinitionsTab
          @createRepository="createRepository($event)"
          @backModal="onChangeModalState(true)"
          :disabledSubmit="disabledSubmit"
          :repository_type="data.repository_type"
          :language.sync="data.language"
          :is_private.sync="data.is_private"
          :categories.sync="data.categories"
        />
      </section>

      <UnnnicModal
        :showModal="openModal"
        :text="$t('webapp.create_repository.modal_title')"
        scheme="aux-yellow-500"
        modalIcon="warning"
        @close="onChangeModalState(false)"
        :closeIcon="false"
      >
        <span
          slot="message"
          v-html="$t('webapp.create_repository.modal_description')"
        />
        <UnnnicButton
          slot="options"
          type="tertiary"
          @click="onChangeModalState(false)"
        >
          {{ $t('webapp.create_repository.modal_continue_button') }}
        </UnnnicButton>
        <UnnnicButton
          slot="options"
          @click="navigateToHomepage()"
          class="attention-button"
        >
          {{ $t('webapp.create_repository.modal_exit_button') }}
        </UnnnicButton>
      </UnnnicModal>
    </div>

    <UnnnicAlert
      v-if="errorDetail"
      :text="errorDetail"
      scheme="feedback-red"
      @close="errorDetail = ''"
    />
  </div>
</template>

<script>
import { getModel } from 'vue-mc-drf-model';
import { mapActions, mapGetters } from 'vuex';
import { updateAttrsValues } from '@/utils/index';
import RepositoryModel from '@/models/newRepository';
import Analytics from '@/utils/plugins/analytics';
import IntelligenceTab from '@/components/repository/CreateRepository/IntelligenceTab';
import DefinitionsTab from '@/components/repository/CreateRepository/DefinitionsTab';
import Emoji from '@/components/shared/Emoji';
import repositoryV2 from '../../../api/v2/repository';
import { get } from 'lodash';
import nexusaiAPI from '../../../api/nexusaiAPI';

export default {
  name: 'CreateRepositoryForm',
  components: {
    IntelligenceTab,
    DefinitionsTab,
    Emoji,
  },
  data() {
    return {
      errorDetail: '',
      formSchema: null,
      data: {
        language: '',
        is_private: true,
        categories: [],
        name: '',
        description: '',
        repository_type: 'content',
      },
      submitting: false,
      errors: {},
      drfRepositoryModel: {},
      categories: [],
      current: 0,
      resultParams: {},
      openModal: false,
      createdRepository: {},
    };
  },
  computed: {
    ...mapGetters(['getOrgSelected']),

    disabledSubmit() {
      if (this.data.repository_type === 'content') {
        return !this.data.name || !this.data.description;
      }

      return (
        !this.data.name ||
        !this.data.description ||
        !this.data.repository_type ||
        !this.data.language ||
        !this.data.is_private ||
        !this.data.categories.length
      );
    },

    computedSchema() {
      const computed = Object.entries(this.formSchema).reduce(
        (schema, entry) => {
          const [key, value] = entry;
          if (
            !(
              value.style &&
              typeof value.style.show === 'boolean' &&
              !value.style.show
            ) ||
            key === 'repository_type'
          ) {
            schema[key] = value;
          }
          return schema;
        },
        {},
      );
      const { is_private, ...schema } = computed;
      const organization = {
        label: this.$t('webapp.orgs.owner'),
        fetch: this.getOrgs,
        type: 'choice',
      };
      if (is_private) {
        return { ...schema, organization, is_private };
      }
      return computed;
    },
  },
  async mounted() {
    this.formSchema = await this.getNewRepositorySchema();
    this.constructModels();
  },
  methods: {
    ...mapActions(['getNewRepositorySchema', 'newRepository']),
    changeStepContent(value, current) {
      this.data = { ...this.data, ...value };
      this.current = current;
    },
    sendEvent() {
      Analytics.send({
        category: 'Intelligence',
        event: 'create intelligence event',
      });
    },
    constructModels() {
      const Model = getModel(this.computedSchema, RepositoryModel);
      this.drfRepositoryModel = new Model({}, null, {
        validateOnChange: true,
      });
    },
    repositoryDetailsRouterParams() {
      const { repository_type, owner__nickname, slug } = this.createdRepository;
      let name;

      if (repository_type === 'content') {
        name = 'repository-content-bases';
      } else if (repository_type === 'classifier') {
        name = 'repository-summary';
      }

      return {
        name,
        params: {
          ownerNickname: owner__nickname,
          slug,
        },
      };
    },
    createRepository(value) {
      this.onSubmit();
    },
    onChangeModalState(value) {
      this.openModal = value;
    },
    navigateToHomepage() {
      this.openModal = false;
      this.$emit('cancelCreation');
    },
    onSubmit() {
      this.submit(this.drfRepositoryModel);
    },
    async submit(model) {
      this.submitting = true;
      this.errors = {};

      try {
        if (this.data.repository_type === 'content') {
          const { data } = await nexusaiAPI.createIntelligence({
            orgUuid: this.$store.state.Auth.connectOrgUuid,
            name: this.data.name,
            description: this.data.description,
          });

          this.$router.push({
            name: 'intelligence-home',
            params: {
              intelligenceUuid: data.uuid,
            },
          });
        } else {
          const response = await repositoryV2.create({
            organization: this.getOrgSelected,
            name: this.data.name,
            description: this.data.description,
            language: this.data.language,
            repository_type: this.data.repository_type,
            categories: this.data.categories,
            is_private:
              this.data.repository_type === 'classifier'
                ? this.data.is_private
                : true,
          });

          const { owner__nickname, slug } = response.data;
          this.createdRepository = response.data;
          this.resultParams = { ownerNickname: owner__nickname, slug };
          this.$router.push(this.repositoryDetailsRouterParams());
        }
      } catch (error) {
        const detail = get(error, 'response.data.detail', '');

        if (detail) {
          this.errorDetail = detail;
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.attention-button {
  background-color: $unnnic-color-aux-yellow-500;

  &:hover:enabled {
    background-color: $unnnic-color-aux-yellow-700;
  }

  &:active:enabled {
    background-color: $unnnic-color-aux-yellow-900;
  }
}

.create-repository {
  display: flex;
  justify-content: center;
  align-items: center;

  &__container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    &__indicator {
      width: 18%;
      margin-bottom: 3.2rem;
    }

    &__steps {
      width: 100%;

      &__wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        &__title {
          text-align: center;
          color: $unnnic-color-neutral-darkest;
          font-family: $unnnic-font-family-primary;
          font-size: $unnnic-font-size-title-md;
        }

        &__button {
          width: 70%;
          margin-top: 2rem;

          &__btn {
            width: 100%;
          }
        }
      }
    }

    &__button {
      background-color: $unnnic-color-feedback-yellow;
    }
  }
}
::v-deep {
  .text-input.size--sm .icon-right,
  .text-input.size--sm .icon-left {
    top: 15px;
  }
}
</style>
