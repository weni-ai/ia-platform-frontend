<template>
  <div
    :class="{ 'category-item': true, 'category-item__selected': selected }"
    class="category-item"
  >
    <p>{{ title }}</p>
    <div class="category-item__separator" />
    <CustomIcon
      :value="icon"
      class="category-item__icon"
      size="large"
      :fillPrimary="true"
    />
  </div>
</template>

<script>
import CustomIcon from '@/components/shared/CustomIcon';

export default {
  name: 'CategoryItem',
  components: { CustomIcon },
  props: {
    icon: {
      type: String,
      default: 'botinho',
    },
    value: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.category-item {
  text-align: center;
  border-radius: 10px;
  font-size: 0.875rem;
  background-color: white;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  width: 7rem;

  &__icon {
    color: $color-primary;
  }

  &__separator {
    height: 1px;
    margin: 0.5rem 1rem;
    background-color: $color-grey;
  }

  &__selected {
    box-shadow: 0px 0px 0px 2px $color-primary inset;
  }
}
</style>
