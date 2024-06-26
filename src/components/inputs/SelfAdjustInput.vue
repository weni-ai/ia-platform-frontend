<template>
  <div class="field">
    <div :class="{ control: true, 'has-icons-right': hasAppend }">
      <textarea
        ref="input"
        :class="{
          textarea: true,
          'self-adjust': true,
          'self-adjust__appended': hasAppend,
          'self-adjust__appended--small': hasAppend && smallIcon,
          'self-adjust--transparent': transparent,
          'self-adjust__contained': contained,
          [`self-adjust--${size}`]: true,
        }"
        v-bind="$attrs"
        v-model="val"
        v-on="inputListeners"
      />
      <span
        v-if="hasAppend"
        :class="[
          'icon is-right',
          `event-clickable${smallIcon ? '--small' : ''}`,
        ]"
      >
        <slot name="append" />
      </span>
    </div>
  </div>
</template>

<script>
import { formatters } from '@/utils';

export default {
  name: 'SelfAdjustInput',
  props: {
    updateValue: {
      type: null,
      default: null,
    },
    value: {
      type: String,
      default: '',
    },
    transparent: {
      type: Boolean,
      default: null,
    },
    size: {
      type: String,
      default: 'normal',
    },
    contained: {
      type: Boolean,
      default: null,
    },
    smallIcon: {
      type: Boolean,
      default: null,
    },
  },
  data() {
    return {
      val: this.value,
    };
  },
  computed: {
    fontSize() {
      if (this.size === 'small') return 14;
      return 16;
    },
    hasAppend() {
      return this.$slots.append;
    },
    inputListeners() {
      return {
        ...this.$listeners,
        input: () => {},
      };
    },
  },
  watch: {
    value() {
      this.val = this.value;
    },
    val() {
      this.val = formatters.sentenceItemKey()(this.val);
      this.$emit('input', this.val);
      this.updateTextareaHeight();
    },
    async updateValue() {
      this.updateTextareaHeight();
    },
  },
  async mounted() {
    this.updateTextareaHeight();
  },
  methods: {
    deselect() {
      window.getSelection().removeAllRanges();
      this.$refs.input.setSelectionRange(0, 0);
    },
    inputAction(action) {
      this.$refs.input[action]();
    },
    async updateTextareaHeight() {
      await this.$nextTick();
      const { input } = this.$refs;
      const offset = input.offsetHeight - input.clientHeight;
      const computedStyle = window.getComputedStyle(input);
      input.style.minHeight = `${Math.max(36, offset + this.fontSize)}px`;
      input.style.height = computedStyle.getPropertyValue('min-height');
      input.style.height = `${offset + input.scrollHeight}px`;
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '~@/assets/scss/variables.scss';

.self-adjust {
  resize: none;
  min-height: 36px;
  padding: 0.3rem 1rem;
  max-height: 900vh;

  &__contained {
    max-height: 50vh;
  }

  &__appended {
    padding: 0.3rem $form-append-width 0.3rem 1rem;

    &--small {
      padding-right: 1rem;
    }
  }

  &--transparent {
    background-color: transparent;
  }

  &--small {
    font-size: 12px;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
}

.event-clickable {
  display: flex;
  justify-content: flex-end;
  margin-right: $form-append-width /  4;
  pointer-events: all !important;
  min-width: $form-append-width !important;
  > * {
    pointer-events: all !important;
  }

  &--small {
    margin-right: $form-append-width /  8;
  }
}
</style>
