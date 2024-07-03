<template>
  <div class="create-repository">
    <div class="create-repository__container">
      <section class="create-repository__container__steps">
        <IntelligenceTab
          v-model:name="data.name"
          v-model:description="data.description"
          v-model:repository_type="data.repository_type"
        />
      </section>
      <section class="create-repository__container__steps">
        <DefinitionsTab
          v-model:language="data.language"
          v-model:is_private="data.is_private"
          v-model:categories="data.categories"
          :disabledSubmit="disabledSubmit"
          :repository_type="data.repository_type"
          :loading="submitting"
          @createRepository="createRepository($event)"
          @backModal="onChangeModalState(true)"
        />
      </section>

      <UnnnicModal
        :showModal="openModal"
        :text="$t('webapp.create_repository.modal_title')"
        scheme="aux-yellow-500"
        modalIcon="warning"
        :closeIcon="false"
        @close="onChangeModalState(false)"
      >
        <template #message>
          <span v-html="$t('webapp.create_repository.modal_description')" />
        </template>
        <template #options>
          <UnnnicButton
            type="tertiary"
            @click="onChangeModalState(false)"
          >
            {{ $t('webapp.create_repository.modal_continue_button') }}
          </UnnnicButton>
          <UnnnicButton
            class="attention-button"
            @click="navigateToHomepage()"
          >
            {{ $t('webapp.create_repository.modal_exit_button') }}
          </UnnnicButton>
        </template>
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
import { mapActions, mapGetters } from 'vuex';
import IntelligenceTab from '@/components/repository/CreateRepository/IntelligenceTab.vue';
import DefinitionsTab from '@/components/repository/CreateRepository/DefinitionsTab.vue';
import Emoji from '@/components/shared/Emoji.vue';
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
  },
  methods: {
    ...mapActions(['getNewRepositorySchema', 'newRepository']),
    changeStepContent(value, current) {
      this.data = { ...this.data, ...value };
      this.current = current;
    },
    repositoryDetailsRouterParams() {
      const { repository_type, owner__nickname, slug } = this.createdRepository;

      if (repository_type === 'classifier') {
        return {
          path: `/dashboard/${owner__nickname}/${slug}/`,
        };
      }

      return {
        name: 'repository-content-bases',
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

:deep(.text-input.size--sm .icon-right),
:deep(.text-input.size--sm .icon-left) {
  top: 15px;
}
</style>
