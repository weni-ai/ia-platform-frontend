<template>
  <ModalNext
    class="flow-modal create-intelligence-modal"
    maxWidth="604px"
  >
    <article class="flow-modal__container">
      <div class="flow-modal__header">
        <div class="flow-modal__header__fill">
          <div class="flow-modal__header__fill__container">
            <div
              class="flow-modal__header__fill__bar flow-modal__header__fill__bar--green"
            ></div>
            <p
              :class="[
                'flow-modal__header__fill__label',
                { 'flow-modal__header__fill__label--green': index === 0 },
              ]"
            >
              {{ $t('modals.actions.flow.fill_name') }}
            </p>
          </div>
          <div class="flow-modal__header__fill__container">
            <div
              :class="[
                'flow-modal__header__fill__bar',
                { 'flow-modal__header__fill__bar--green': index === 1 },
              ]"
            />
            <p
              :class="[
                'flow-modal__header__fill__label',
                { 'flow-modal__header__fill__label--green': index === 1 },
              ]"
            >
              {{ $t('modals.actions.descriptions.fill_name') }}
            </p>
          </div>
        </div>
        <div class="flow-modal__header__title__container">
          <h3>
            {{
              index === 0
                ? $t('modals.actions.flow.title')
                : $t('modals.actions.descriptions.title')
            }}
          </h3>
          <h4 v-if="index === 1">{{ flowSelected.name }}</h4>
          <p>
            {{
              index === 0
                ? $t('modals.actions.flow.sub_title')
                : $t('modals.actions.descriptions.sub_title')
            }}
          </p>
        </div>
      </div>
      <div class="flow-modal__body">
        <div
          class="flow-modal__body__flow"
          v-if="index === 0"
        >
          <div>
            <UnnnicInput
              size="sm"
              :iconLeftClickable="true"
              iconLeft="search-1"
              :placeholder="$t('modals.actions.flow.placeholder')"
              v-model="filterName"
            />
          </div>
          <div class="flow-modal__body__flow__list">
            <div
              v-for="(item, index) in items.data"
              :key="index"
              :class="[
                'flow-modal__body__flow__list__item text-truncate',
                {
                  'flow-modal__body__flow__list__item--selected':
                    flowSelected && flowSelected.uuid === item.uuid,
                },
              ]"
              @click="handleFlowSelected(item)"
            >
              <UnnnicToolTip
                side="top"
                :text="item.name"
                enabled
                class="flow-modal__body__flow__list__item__tooltip text-truncate"
              >
                <UnnnicIcon
                  icon="account_tree"
                  size="sm"
                  scheme="neutral-cloudy"
                />
                <p>{{ handleFlowName(item.name) }}</p>
              </UnnnicToolTip>
            </div>
            <template v-if="items.status === 'loading'">
              <UnnnicSkeletonLoading
                v-for="i in 3"
                :key="`loading-${i}`"
                tag="div"
                height="50px"
                :style="{ display: 'flex', flexBasis: 'calc(50% - 6px)' }"
              />
            </template>

            <div
              v-show="!['loading', 'complete'].includes(items.status)"
              ref="end-of-list-element"
            ></div>
          </div>
        </div>
        <section
          v-if="items.data.length === 0 && items.status === 'complete'"
          class="flow-modal__body__not_found_container"
        >
          <UnnnicIcon
            icon="delete-1"
            size="sm"
            scheme="neutral-cloudy"
          />
          {{ $t('modals.actions.flow.not_found_message') }}
        </section>
        <div
          class="flow-modal__body_description"
          v-if="index === 1"
        >
          <UnnnicTextArea
            v-bind="$props"
            v-model="description"
            :label="$t('modals.actions.descriptions.label')"
          />
        </div>
      </div>
      <div class="flow-modal__footer">
        <UnnnicButton
          slot="options"
          class="create-repository__container__button"
          type="tertiary"
          @click="handleBackBtn"
        >
          {{ $t('modals.actions.btn_back') }}
        </UnnnicButton>
        <UnnnicButton
          slot="options"
          size="large"
          @click="handleNextBtn()"
          :disabled="isDisableNextBtn()"
          :loading="saving"
        >
          {{
            index === 0
              ? $t('modals.actions.btn_next')
              : $t('modals.actions.btn_create')
          }}
        </UnnnicButton>
      </div>
    </article>
  </ModalNext>
</template>

<script>
import { debounce } from 'lodash';
import nexusaiAPI from '../../api/nexusaiAPI';
import ModalNext from '../ModalNext.vue';

export default {
  components: {
    ModalNext,
  },

  props: {
    saving: Boolean,
  },

  data() {
    return {
      index: 0,
      description: '',

      filterName: '',

      flowSelected: {
        name: '',
        uuid: '',
      },

      items: {
        status: null,
        next: null,
        data: [],
      },

      isShowingEndOfList: false,
      intersectionObserver: null,
    };
  },

  watch: {
    'items.status'(status) {
      if (this.isShowingEndOfList && status === null) {
        this.loadMoreFlows();
      }
    },

    isShowingEndOfList() {
      if (this.isShowingEndOfList && this.items.status === null) {
        this.loadMoreFlows();
      }
    },

    filterName: debounce(function () {
      this.items.status = null;
      this.items.next = null;
      this.items.data = [];

      this.loadMoreFlows();
    }, 300),
  },

  mounted() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isShowingEndOfList = entry.isIntersecting;
      });
    });

    this.intersectionObserver.observe(this.$refs['end-of-list-element']);
  },

  beforeDestroy() {
    this.intersectionObserver.unobserve(this.$refs['end-of-list-element']);
  },

  methods: {
    async loadMoreFlows() {
      try {
        this.items.status = 'loading';

        const { data } = await nexusaiAPI.router.actions.flows.list({
          next: this.items.next,
          projectUuid: this.$store.state.Auth.connectProjectUuid,
          name: this.filterName,
        });
        this.items.data = this.items.data
          .concat(data.results)
          .filter((e) => e.name && e.uuid);

        this.items.next = data.next;

        if (this.items.next) {
          this.items.status = null;
        } else {
          this.items.status = 'complete';
        }
      } catch (error) {
        this.items.status = 'error';
      }
    },

    handleNextBtn() {
      if (this.index === 0) this.index = 1;
      else if (this.index === 1) {
        this.$emit('save', {
          flow: this.flowSelected,
          description: this.description,
        });
      }
    },
    isDisableNextBtn() {
      return this.flowSelected?.uuid ? false : true;
    },
    handleBackBtn() {
      if (this.index === 0) this.$emit('closeModal');
      this.index = 0;
    },
    handleFlowSelected(value) {
      const flow = {
        name: value?.name || '',
        uuid: value?.uuid || '',
      };
      this.flowSelected = flow;
    },
    handleFlowName(str) {
      return str.length > 30 ? str.slice(0, 27) + '...' : str;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.create-intelligence-modal {
  ::v-deep .create-intelligence-modal__container {
    padding: $unnnic-spacing-xl $unnnic-spacing-md $unnnic-spacing-md
      $unnnic-spacing-md;
  }
}

.text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.flow-modal {
  &__container {
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: $unnnic-spacing-md;

    &__fill {
      display: flex;
      align-items: flex-start;
      gap: $unnnic-spacing-xs;

      &__container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      &__bar {
        width: 7.8125rem;
        height: 0.5rem;
        border-radius: $unnnic-border-radius-pill;
        background: $unnnic-color-neutral-soft;

        &--green {
          background: $unnnic-color-weni-600;
        }
      }

      &__label {
        color: $unnnic-color-neutral-clean;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        font-weight: $unnnic-font-weight-regular;
        line-height: $unnnic-line-height-md;

        &--green {
          color: $unnnic-color-weni-700;
        }
      }
    }

    &__title {
      &__container {
        h3 {
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-title-sm;
          font-weight: $unnnic-font-weight-black;
          line-height: $unnnic-line-height-md;
          color: $unnnic-color-neutral-darkest;
        }

        p {
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-gt;
          font-weight: $unnnic-font-weight-regular;
          line-height: $unnnic-line-height-md;
          color: $unnnic-color-neutral-dark;
        }
      }
    }
  }

  &__body {
    &__not_found_container {
      text-align: center;
    }
    &__flow {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-sm;

      &__list {
        display: flex;
        flex-wrap: wrap;
        gap: $unnnic-spacing-ant;
        max-height: 300px;
        overflow-y: auto;

        &__item {
          cursor: pointer;
          display: flex;
          flex-basis: calc(50% - 6px);
          border-radius: $unnnic-border-radius-sm;
          padding: $unnnic-spacing-ant;
          border: 1px solid $unnnic-color-neutral-cleanest;
          background: $unnnic-color-background-carpet;

          &:hover {
            border: 1px solid $unnnic-color-weni-500;
            background: rgba(0, 222, 210, 0.16);
          }

          &--selected {
            border: 1px solid $unnnic-color-weni-500;
            background: rgba(0, 222, 210, 0.16);
          }

          p {
            font-family: $unnnic-font-family-secondary;
            font-size: $unnnic-font-size-body-gt;
            font-weight: $unnnic-font-weight-regular;
            line-height: $unnnic-line-height-md;
            color: $unnnic-color-neutral-darkest;
          }

          &__tooltip {
            display: flex;
            align-items: center;
            align-self: stretch;
            gap: $unnnic-spacing-ant;
          }
        }
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    margin-top: $unnnic-spacing-md;
    gap: $unnnic-spacing-sm;

    button {
      width: 100%;
    }
  }
}
</style>
