<template>
  <UnnnicModalDialog
    showCloseIcon
    showActionsDivider
    :title="$t('action_type_selector.title')"
    size="md"
    :secondaryButtonProps="{
      text: $t('cancel'),
      'data-test': 'cancel-button',
    }"
    :primaryButtonProps="{
      text: $t('next'),
      'data-test': 'next-button',
    }"
    @secondary-button-click="close"
    @primary-button-click="next"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <section class="groups">
      <p class="groups__description">
        {{ $t('action_type_selector.description') }}
      </p>

      <section
        v-for="(group, index) in groups"
        :key="index"
        class="group"
        :class="[
          {
            'group--selected': actionGroup === group.id,
            'group--disabled': isGroupDisabled(group.id),
          },
        ]"
        :data-test="group.id"
        @click="isGroupDisabled(group.id) ? null : (actionGroup = group.id)"
      >
        <section class="group__icon__container">
          <UnnnicIcon
            :icon="group.icon"
            scheme="inherit"
            class="group__icon"
            size="avatar-nano"
          />
        </section>

        <h3>{{ group.title }}</h3>

        <p>{{ group.description }}</p>
      </section>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import { actionGroupIcon } from '@/utils';
import i18n from '@/utils/plugins/i18n';
import { computed, getCurrentInstance, onMounted } from 'vue';
import { ref } from 'vue';

const props = defineProps({});

const instance = getCurrentInstance();

const actionGroup = defineModel('actionGroup', {
  type: String,
  required: true,
});

function getByGroup(group) {
  return instance.proxy['$store'].getters.actionsTypesAvailable.filter(
    (type) => type.group === group,
  );
}

function isGroupDisabled(groupId) {
  if (groupId === 'custom') {
    return false;
  }

  return getByGroup(groupId).length === 0;
}

const emit = defineEmits(['update:modelValue', 'selected']);

const groups = computed(() =>
  [
    {
      id: 'interactions',
      title: i18n.global.t('action_type_selector.types.interactions.title'),
      description: i18n.global.t(
        'action_type_selector.types.interactions.description',
      ),
    },
    {
      id: 'shopping',
      title: i18n.global.t('action_type_selector.types.shopping.title'),
      description: i18n.global.t(
        'action_type_selector.types.shopping.description',
      ),
    },
    {
      id: 'support',
      title: i18n.global.t('action_type_selector.types.support.title'),
      description: i18n.global.t(
        'action_type_selector.types.support.description',
      ),
    },
    {
      id: 'custom',
      title: i18n.global.t('action_type_selector.types.custom.title'),
      description: i18n.global.t(
        'action_type_selector.types.custom.description',
      ),
    },
  ].map((group) => ({ ...group, icon: actionGroupIcon(group.id) })),
);

function selectTheFirstGroupEnabled() {
  actionGroup.value = groups.value.find(
    (group) => !isGroupDisabled(group.id),
  ).id;
}

onMounted(() => {
  if (!actionGroup.value) {
    selectTheFirstGroupEnabled();
  }
});

function close() {
  emit('update:modelValue', false);
}

function next() {
  emit('selected');
  close();
}
</script>

<style lang="scss" scoped>
.groups {
  &__description {
    margin-bottom: $unnnic-spacing-sm;

    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  .group {
    cursor: pointer;
    user-select: none;
    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-ant - $unnnic-border-width-thinner;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
    background-color: $unnnic-color-neutral-white;
    display: grid;
    grid-template-areas:
      'icon title'
      'icon description';
    column-gap: $unnnic-spacing-ant;
    grid-template-columns: min-content;
    align-items: center;

    &__icon {
      color: $unnnic-color-neutral-cloudy;

      &__container {
        grid-area: icon;
        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: $unnnic-border-radius-sm;

        background-color: rgba(
          $unnnic-color-neutral-darkest,
          $unnnic-opacity-level-extra-light
        );

        width: $unnnic-avatar-size-xs;
        height: $unnnic-avatar-size-xs;

        padding: $unnnic-spacing-nano;
        box-sizing: border-box;
      }
    }

    h3 {
      grid-area: title;
      margin: 0;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    p {
      grid-area: description;

      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }

    &--selected {
      border-color: $unnnic-color-weni-500;
      background-color: rgba(
        $unnnic-color-weni-500,
        $unnnic-opacity-level-light
      );

      .group__icon {
        &__container {
          background-color: rgba(
            $unnnic-color-weni-900,
            $unnnic-opacity-level-extra-light
          );
        }
      }
    }

    &--disabled {
      cursor: not-allowed;

      border-color: $unnnic-color-neutral-light;
      background-color: $unnnic-color-neutral-light;

      h3,
      p {
        color: $unnnic-color-neutral-cleanest;
      }

      .group__icon {
        color: $unnnic-color-neutral-cleanest;

        &__container {
          background-color: transparent;
        }
      }
    }

    + .group {
      margin-top: $unnnic-spacing-xs;
    }
  }
}
</style>
