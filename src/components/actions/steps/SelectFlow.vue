<template>
  <UnnnicIntelligenceText
    tag="p"
    color="neutral-cloudy"
    family="secondary"
    size="body-gt"
    marginBottom="sm"
  >
    {{ $t('modals.actions.add.steps.select_flow.explanation') }}
  </UnnnicIntelligenceText>

  <section class="flow-modal__body__flow">
    <UnnnicInput
      v-model="filterName"
      size="sm"
      :iconLeftClickable="true"
      iconLeft="search-1"
      :placeholder="
        $t('modals.actions.add.steps.select_flow.filters.flow_name.placeholder')
      "
      data-test="filter-input"
    />
  </section>

  <section
    v-if="itemsData.length === 0 && items.status.value === 'complete'"
    class="flow-modal__body__not_found_container"
  >
    <UnnnicIcon
      icon="delete-1"
      size="sm"
      scheme="neutral-cloudy"
    />

    <UnnnicIntelligenceText
      color="neutral-cloudy"
      family="secondary"
      size="body-gt"
    >
      {{ $t('modals.actions.flow.not_found_message') }}
    </UnnnicIntelligenceText>
  </section>

  <section
    v-show="!(itemsData.length === 0 && items.status.value === 'complete')"
    class="flow-modal__body__flow__list"
  >
    <section
      v-for="item in itemsData"
      :key="item.uuid"
      :class="[
        'flow-item',
        {
          'flow-item--selected': isFlowSelected(item),
        },
      ]"
      :data-test="`flow-${item.uuid}`"
      @click="selectFlow(item)"
    >
      <UnnnicIcon
        icon="account_tree"
        size="ant"
        scheme="weni-600"
      />

      <p class="text-truncate">{{ item.name }}</p>

      <UnnnicToolTip
        v-if="item.actions.length"
        side="top"
        :text="getTreatedTooltipFlowActions(item)"
        enabled
        class="flow-item__actions"
      >
        <UnnnicIcon
          icon="bolt"
          size="sm"
          scheme="neutral-clean"
        />
        {{ item.actions.length }}
      </UnnnicToolTip>
    </section>

    <template v-if="items.status.value === 'loading'">
      <UnnnicSkeletonLoading
        v-for="i in 4"
        :key="`loading-${i}`"
        tag="div"
        height="50px"
        :style="{ display: 'flex', flexBasis: 'calc(50% - 6px)' }"
      />
    </template>

    <section
      v-show="!['loading', 'complete'].includes(items.status.value)"
      ref="endOfListElement"
    />
  </section>
</template>

<script setup>
import { debounce } from 'lodash';
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useActionsStore } from '@/store/Actions.js';
import i18n from '@/utils/plugins/i18n';

const filterName = ref('');
const intersectionObserver = ref(null);
const isShowingEndOfList = ref(false);
const endOfListElement = ref();

const props = defineProps({
  flowUuid: {
    type: String,
    default: '',
  },

  name: {
    type: String,
    default: '',
  },

  items: {
    type: Object,
    required: true,
  },
});

const actionsStore = useActionsStore();

const emit = defineEmits(['update:flowUuid', 'update:name']);

const itemsData = computed(() => {
  const newItemsData = props.items.data.value;
  return {
    ...newItemsData?.map((flow) => ({
      ...flow,
      actions: getFlowActions(flow.uuid),
    })),
  };
});

watch(
  () => filterName.value,
  debounce(() => {
    props.items.reset();
    props.items.overwriteParams({
      name: filterName.value,
    });
  }, 300),
);

onBeforeMount(() => {
  if (props.items.status.value === null) {
    props.items.loadNext();
  }
});

onMounted(() => {
  intersectionObserver.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isShowingEndOfList.value = entry.isIntersecting;
    });
  });

  intersectionObserver.value.observe(endOfListElement.value);
});

onBeforeUnmount(() => {
  intersectionObserver.value.unobserve(endOfListElement.value);
});

watch(
  () => props.items.status.value,
  (status) => {
    if (isShowingEndOfList.value && status === null) {
      props.items.loadNext();
    }
  },
);

watch(
  () => isShowingEndOfList.value,
  () => {
    if (isShowingEndOfList.value && props.items.status.value === null) {
      props.items.loadNext();
    }
  },
);

function getFlowActions(flowUuid) {
  return actionsStore.actions.data
    .filter((action) => action.flow_uuid === flowUuid)
    .map((flow) => flow.name);
}

function getTreatedTooltipFlowActions(flow) {
  const { actions } = flow;

  if (actions.length === 0) return '';

  const formattedActions =
    actions.length > 1
      ? `${actions.slice(0, -1).join(', ')} ${i18n.global.t('and')} ${actions.at(-1)}`
      : actions[0];

  return i18n.global.t(
    'modals.actions.add.steps.select_flow.flow_assigned_actions',
    actions.length,
    {
      count: actions.length,
      actions: formattedActions,
    },
  );
}

function isFlowSelected(flow) {
  return props.flowUuid === flow.uuid;
}

function selectFlow(flow) {
  emit('update:flowUuid', flow.uuid);
  emit('update:name', flow.name);
}
</script>

<style lang="scss" scoped>
.text-truncate {
  flex: 1;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.flow-modal__body__not_found_container {
  margin-top: $unnnic-spacing-sm;
  text-align: center;

  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-nano;
  justify-content: center;
}

.flow-modal__body__flow {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__list {
    margin-top: $unnnic-spacing-sm;
    height: 100%;
    overflow: overlay;

    $scroll-size: $unnnic-inline-nano;

    padding-right: $unnnic-inline-nano + $scroll-size;
    margin-right: -($unnnic-inline-nano + $scroll-size);

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    gap: $unnnic-spacing-xs;

    &::-webkit-scrollbar {
      width: $scroll-size;
    }

    &::-webkit-scrollbar-thumb {
      background: $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    &::-webkit-scrollbar-track {
      background: $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-pill;
    }
  }
}

.flow-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: $unnnic-spacing-ant;
  border-radius: $unnnic-border-radius-sm;
  padding: $unnnic-spacing-ant;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
  background: $unnnic-color-background-carpet;

  color: $unnnic-color-neutral-dark;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-regular;

  &:hover {
    border: $unnnic-border-width-thinner solid $unnnic-color-weni-500;
    background: rgba(0, 222, 210, 0.16);
  }

  &--selected {
    border: $unnnic-border-width-thinner solid $unnnic-color-weni-500;
    background: rgba(0, 222, 210, 0.16);
  }

  &__actions.unnnic-tooltip {
    display: flex;
    align-items: center;
    color: $unnnic-color-neutral-clean;
  }
}
</style>
