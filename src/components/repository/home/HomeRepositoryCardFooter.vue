<template>
  <footer
    v-if="type === 'content-base'"
    class="base__footer"
  >
    {{ language }}
  </footer>

  <footer
    v-else
    class="intelligence__footer"
  >
    <section
      v-for="(stat, index) in stats"
      :key="index"
      class="intelligence__footer__content"
    >
      <header class="intelligence__footer__content__data">
        {{ stat.title }}

        <UnnnicToolTip
          v-if="stat.info"
          :text="stat.info"
          enabled
          side="top"
          maxWidth="17rem"
          class="intelligence__footer__content__info-icon"
        >
          <UnnnicIconSvg
            icon="information-circle-4"
            scheme="neutral-soft"
            size="sm"
          />
        </UnnnicToolTip>
      </header>

      <section class="intelligence__footer__content__data__info">
        <UnnnicAvatarIcon
          class="intelligence__footer__content__data__info__icon"
          size="xs"
          :icon="stat.icon"
          :scheme="stat.scheme"
        />

        <section class="intelligence__footer__content__data__info__number">
          {{ stat.value }}
        </section>
      </section>
    </section>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },

  language: {
    type: String,
    default: '',
  },

  contentBasesLength: {
    type: Number,
    default: 0,
  },

  intents: {
    type: Array,
    default() {
      return [];
    },
  },

  languages: {
    type: Array,
    default() {
      return [];
    },
  },

  force: {
    type: Number,
    default: 0,
  },
});

const stats = computed(() => {
  const stats = [];

  if (props.type === 'content-intelligence') {
    stats.push(
      ...[
        {
          title: i18n.global.tc(
            'webapp.intelligences_lib.knowledge_bases',
            props.contentBasesLength,
          ),
          scheme: 'aux-purple',
          icon: 'article',
          value: props.contentBasesLength,
        },
      ],
    );
  } else if (props.type === 'classification-intelligence') {
    stats.push(
      ...[
        {
          title: i18n.global.tc(
            'webapp.intelligences_lib.intent',
            props.intents.length,
          ),
          scheme: 'aux-pink',
          icon: 'typing-1',
          value: props.intents.length,
        },
        {
          title: i18n.global.tc(
            'webapp.intelligences_lib.language',
            props.languages.length,
          ),
          scheme: 'aux-purple',
          icon: 'translate-1',
          value: props.languages.length,
        },
        {
          title: i18n.global.t('webapp.intelligences_lib.intelligence_force'),
          info: i18n.global.t(
            'webapp.intelligences_lib.intelligence_force_tooltip',
          ),
          scheme: 'feedback-blue',
          icon: 'fitness-biceps-1',
          value: `${props.force}%`,
        },
      ],
    );
  }

  return stats;
});
</script>

<style lang="scss">
.base__footer {
  color: $unnnic-color-neutral-cloudy;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-bold;
  text-transform: uppercase;
}

.intelligence__footer {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-xs;

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-nano;

    &__info-icon {
      margin-left: $unnnic-spacing-nano;
    }

    &__data {
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
      font-family: $unnnic-font-family-secondary;

      &__info {
        display: flex;
        align-items: center;
        column-gap: $unnnic-spacing-xs;

        &__number {
          color: $unnnic-color-neutral-darkest;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
          font-weight: $unnnic-font-weight-bold;
          font-family: $unnnic-font-family-secondary;
        }
      }
    }
  }
}
</style>
