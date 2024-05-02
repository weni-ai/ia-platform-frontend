<template>
  <section>
    <section
      class="selected__container"
      :style="inputStyle"
    >
      <section
        v-for="(part, index) in parts"
        :key="index"
        class="selected__line"
        :style="{ marginLeft: -inputScrolledLeft + 'px' }"
      >
        <span :style="{ whiteSpace: 'pre' }">{{ part.textBefore }}</span>

        <span
          :class="['selected', `selected--color-${part.color}`]"
          :style="{
            whiteSpace: 'pre',
          }"
          >{{ part.text }}</span
        >
      </section>
    </section>

    <UnnnicInput
      ref="input"
      :value="value"
      @input="$emit('input', $event)"
      v-bind="$attrs"
    />
  </section>
</template>

<script>
import { getEntityColor } from '../utils/entitiesColors';

export default {
  props: {
    value: String,
    selected: Object,
    entities: Array,
  },

  data() {
    return {
      inputStyle: {},
      inputScrolledLeft: 0,
    };
  },

  mounted() {
    const input = this.$refs.input.$el.querySelector('input');

    const style = getComputedStyle(input);

    this.inputStyle = {
      font: style.font,
      fontWeight: style.fontWeight,
      height: style.height,
      marginBottom: `-${style.height}`,
      padding: style.padding,
      backgroundColor: style.backgroundColor,
    };

    input.style.backgroundColor = 'transparent';

    input.addEventListener('scroll', (event) => {
      this.inputScrolledLeft = event.target.scrollLeft;
    });

    input.addEventListener('select', (event) => {
      const selected = event.target.value.substring(
        event.target.selectionStart,
        event.target.selectionEnd,
      );

      const offsetLeft = selected.match(/^( +)[^ ]/)?.[1].length || 0;
      const offsetRight = selected.match(/[^ ]( +)$/)?.[1].length || 0;

      this.$emit('update:selected', {
        start: event.target.selectionStart + offsetLeft,
        end: event.target.selectionEnd - offsetRight,
      });
    });
  },

  computed: {
    parts() {
      const parts = [];

      const getHightlightedWordObject = ({
        start: startSelection,
        end: endSelection,
        entity: entityName,
      }) => ({
        textBefore: this.value.substring(0, startSelection),
        text: this.value.substring(startSelection, endSelection),
        color: entityName ? getEntityColor(entityName) : undefined,
      });

      if (this.selected) {
        parts.push(getHightlightedWordObject(this.selected));
      }

      return parts.concat(this.entities.map(getHightlightedWordObject));
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.selected__container {
  width: 100%;
  overflow: hidden;
  pointer-events: none;
}

.selected__line {
  height: 0;
  color: transparent;
}

.selected {
  background-color: $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;

  $inside-spacing: 0.125 * $unnnic-font-size;

  padding: $inside-spacing;
  margin: -$inside-spacing;
  box-sizing: content-box;

  $entities-colors: (
    ('sunflower', #ffc312, black),
    ('energos', #c4e538, black),
    ('blue-martina', #12cbc4, black),
    ('lavender-rose', #fda7df, black),
    ('bara-red', #ed4c67, white),
    ('radiant-yellow', #f79f1f, white),
    ('android-green', #a3cb38, white),
    ('mediterranean-sea', #1289a7, white),
    ('lavender-tea', #d980fa, black),
    ('very-berry', #b53471, white)
  );

  @each $entity-color in $entities-colors {
    $name: nth($entity-color, 1);
    $bg: nth($entity-color, 2);

    &--color-#{$name} {
      background-color: $bg;
    }
  }
}
</style>
