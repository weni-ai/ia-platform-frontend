<template>
  <div class="log-entities__wrapper">
    <div class="level">
      <div
        class="level-left">
        <!-- <div v-if="entitiesList.length > 0">
          <unnnic-label
            class="mr-1 repository-log-info__label"
            :label="$tc('webapp.inbox.entities', entitiesList.length)"
          />
          <entity-tag
            v-for="(entity, i) in entitiesList"
            :key="i"
            :highlighted="entity.entity === highlighted"
            :color-class="entity.class"
            :entity-name="entity.entity"
            @mouseenter.native.stop="$emit('update:highlighted', entity.entity)"
            @mouseleave.native.stop="$emit('update:highlighted', null)"/>
        </div> -->
        <unnnic-label
          class="mr-1 repository-log-info__label"
          label="Interação recebida em:"
        />
        <unnnic-label
          class="repository-log-info__label--regular"
          :label="formattedDate"
        />
      </div>
      <div class="level-right">
        <unnnic-button
          :text="$t('webapp.inbox.add_to_train_button')"
          id="tour-inbox-step-2"
          :is-previous-disabled="true"
          type="secondary"
          iconLeft="graph-status-circle-1"
          size="small"
          class="mr-4 repository-log-info__button--wide"
          @click="sendToTraining()"
        />
        <unnnic-button
          :text="$t('webapp.inbox.add_to_sentence_button')"
          id="tour-inbox-step-3"
          :is-previous-disabled="true"
          :is-next-disabled="true"
          iconLeft="check-square-1"
          size="small"
          type="secondary"
          class="repository-log-info__button--wide"
          @click="sendToTest()"
        />
      </div>
    </div>
    <hr class="divider" />
    <div class="level is-mobile">
      <div class="level-left">
        <unnnic-label
          class="mr-3 repository-log-info__label"
          label="Mais detalhes da interação:"
        />
        <unnnic-button
          class="repository-log-info__button mr-4"
          type="secondary"
          size="small"
          @click="debug()"
        >
            {{ $t('webapp.inbox.debug') }}
        </unnnic-button>
        <unnnic-button
          class="repository-log-info__button"
          type="secondary"
          size="small"
          @click="showRawInfo()"
        >
          {{ $t('webapp.inbox.raw') }}
        </unnnic-button>
      </div>
      <div class="level-right">
        <div
          v-if="intent"
          class="level-item has-text-grey"
        >
          <unnnic-label
          class="mr-1 repository-log-info__label"
          label="Versão:"
          />
          <unnnic-label
          class="repository-log-info__label--regular"
          :label="versionName"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EntityTag from '@/components/repository/repository-evaluate/example/EntityTag';

export default {
  name: 'LogInfo',
  components: {
    EntityTag,
  },
  props: {
    entitiesList: {
      type: Array,
      default: () => ([]),
    },
    intent: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: String,
      default: '',
    },
    highlighted: {
      type: String,
      default: null,
    },
    versionName: {
      type: String,
      default: null,
    }
  },
  computed: {
    formattedDate() {
      const date = new Date(this.createdAt)
      return date.toLocaleString()
    }
  },
  methods: {
    showRawInfo() {
      this.$emit('onShowRawInfo');
    },
    debug() {
      this.$emit('debug');
    },
    sendToTraining() {
      this.$emit('sendToTraining');
    },
    sendToTest() {
      this.$emit('sendToTest');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/utilities.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
.repository-log-info {
  &__button {
    width: 158px;

    &--wide {
      width: 245px;
    }
  }

  &__label {
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-bold;

    &--regular {
      font-size: $unnnic-font-size-body-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }
}

.log {
  $radius: .5rem;

  margin: 1rem .5rem;
  overflow: visible;
  background-color: $white-bis;
  border-radius: $radius;

  &-text {
    display: flex;
    padding: 1rem 2rem;
    margin-bottom: 4px;
    background-color: $white-ter;
    border-radius: $radius;
    transition: box-shadow .2s ease;

    &__main {
      flex-grow: 1;
      font-size: 1.25rem;
    }

    &__rigth {
      flex-grow: 0;
    }
  }

  &-entities,
  &-infos {
    padding: .25rem .5rem .3rem 1rem;
  }

  &-entities {

    &__wrapper {
      padding: 1rem 0 .5rem;

      strong {
        margin-right: 0.5rem;
      }
    }

    > * {
      margin: 0 .5rem 0 0;

      &:last-child {
        margin: 0;
      }
    }
  }
}
.divider {
  background: $unnnic-color-neutral-soft;
  margin: $unnnic-spacing-stack-lg 0;
  height: 1px;
}
</style>
