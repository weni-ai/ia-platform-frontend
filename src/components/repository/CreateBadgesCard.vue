<template>
  <div
    ref="dropzone"
    :class="{
      'drag-area__dropzone': true,
      'drag-area__dropzone__is-dragover': isDragging,
      'drag-area__dropzone__has-error': hasError,
    }"
    v-on:dragenter="dragenter"
    v-on:dragover="dragover"
    v-on:dragleave="dragleave"
    v-on:dragend="dragend"
    v-on:drop="drop"
  >
    <div v-if="localList.length === 0">
      <UnnnicIconSvg
        class="drag-area__dropzone__icon"
        icon="study-light-idea-1"
        :scheme="hasError ? 'feedback-red' : 'neutral-cloudy'"
        size="xl"
      />

      <div class="drag-area__dropzone__content">
        <span class="drag-area__dropzone__content__title">
          {{ $t('webapp.home.drag_new') }}
        </span>
      </div>
    </div>
    <Draggable
      v-model="localList"
      :sort="false"
      :data-id-attr="identifier"
      :move="onMove"
      group="entities"
      class="badges-card__wrapper"
      @change="onChange"
    >
      <EntityTag
        v-for="(item, i) in localList"
        :key="i"
        :class="[
          'badges-card__wrapper__badge',
          `badges-card__wrapper__badge--moving`,
        ]"
        :entityName="item.value"
        :closable="edit"
        @close="close(item)"
        @click.native="goToEntity(item)"
      />
    </Draggable>
  </div>
</template>

<script>
import { formatters } from '@/utils';
import EntityTag from '@/components/repository/repository-evaluate/example/EntityTag';
import draggable from 'vuedraggable';
import EntityAccordion from '@/components/shared/accordion/EntityAccordion';

export default {
  name: 'CreateBadgesCard',
  components: {
    draggable,
    EntityTag,
    EntityAccordion,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
      default: null,
    },
    format: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => [],
    },
    examplesCount: {
      type: Number,
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
    disabled: {
      type: Boolean,
      default: false,
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
      text: '',
      localList: this.list,
      hasError: false,
      isDragging: false,
      dragEnterCounter: 0,
    };
  },
  computed: {
    canSubmit() {
      return this.text && this.text.length > 0;
    },
  },
  watch: {
    text() {
      if (!this.format || !this.text || this.text.length <= 0) return;
      this.text = formatters.bothubItemKey()(this.text.toLowerCase());
    },
    list() {
      this.$emit('onUpdateList');
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    finished() {
      if (this.canSubmit) this.$emit('onFinished', this.text);
    },
    onChange() {
      this.$emit('change');
    },
    onMove({ draggedContext, relatedContext }) {
      this.$emit('move', { draggedContext, relatedContext });
    },
    dragenter() {
      this.dragEnterCounter += 1;
      this.isDragging = true;
    },
    dragover() {
      this.isDragging = true;
    },
    dragleave() {
      this.dragEnterCounter -= 1;
      if (this.dragEnterCounter === 0) {
        this.isDragging = false;
      }
    },
    dragend() {
      this.isDragging = false;
    },
    drop(event) {
      this.isDragging = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:string';
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/variables.scss';
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

@function borderDashed($color) {
  @debug 'here 1 2';
  @debug string.slice(#{$color}, 2);
  @return url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23#{string.slice(#{$color}, 2)}' stroke-width='4' stroke-dasharray='4%2c 12' stroke-dashoffset='9' stroke-linecap='square'/%3e%3c/svg%3e");
}
.drag-area {
  &__dropzone {
    border-radius: $unnnic-border-radius-lg;
    background-color: $unnnic-color-background-carpet;
    padding: 1rem;
    margin: 1rem;
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
  padding: 0.75rem;
  margin: 0.75rem 0;
  border: 1px solid $color-border;
  border-radius: 6px;

  &__dark {
    background-color: #f5f5f5;
    border: 1px solid #f5f5f5;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
  }

  &__title {
    align-items: center;
    column-gap: 0.5rem;
  }

  &__icon {
    color: $color-grey-dark;
    cursor: pointer;
  }

  &__input {
    max-width: 80%;
    margin-left: 0.5rem;
    margin-bottom: 0;
    margin-block: auto;
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
        cursor: grab;
      }

      &--locked {
        cursor: pointer;
      }
    }
  }
}

.field.is-grouped.is-grouped-multiline > .control:last-child,
.field.is-grouped.is-grouped-multiline > .control:not(:last-child) {
  margin-bottom: 0;
}
</style>
