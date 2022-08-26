<template>
   <unnnic-tag
      class="entity-tag"
      :hasCloseIcon="closable"
      @close="$emit('close')"
      type="default"
      v-html="group ? $t('webapp.evaluate.entity_is_group',
        { entity: entityName, group }) : entityName"
      clickable
      :style="{backgroundColor: randomColor()}"
    />
</template>

<script>
import { getEntityColor, getRandomColor } from '@/utils/entitiesColors';

export default {
  name: 'EntityTag',
  props: {
    entityName: {
      type: String,
      default: '',
    },
    colorClass: {
      type: String,
      default: null,
    },
    group: {
      type: String,
      default: null,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
    closable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classes() {
      const classList = { highlighted: this.highlighted };
      classList[this.tagClass] = true;
      return classList;
    },
    tagClass() {
      return this.colorClass || `${getEntityColor(this.entityName)}`;
    },
    document() {
      return document
    }
  },
  methods: {
    randomColor() {
      return getRandomColor()
    }
  },
};
</script>

<style lang="scss" scoped>


  /deep/ strong {
      color: inherit;
    }

    .highlighted {
        border: 2px solid red;
    }

    span, strong{
      font-family: $unnnic-font-family-secondary;
    }

    .entity-tag {
      font-family: Lato;
      font-size: .75rem;
      font-weight: 400;
      line-height: 1.25rem;
      padding: .25rem .75rem;
      color: inherit;
      display: inline-flex;
    }

</style>
