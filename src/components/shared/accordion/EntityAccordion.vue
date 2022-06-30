<template>
  <div class="expander">
    <div
      ref="expander"
      :class="{
        'expander__trigger': true,
        'expander__trigger--slim': slim,
        [`align-${align}`]: true,
        'active': isOpen,
        'before-border': !isOpen && customAccordion,
        'is-light': isLight,
        'cursor-pointer': true,
      }"
      @click="toggleAccordion()">

      <!-- <div
        ref="check"
        class="expander__trigger__check"
        @click.stop>
        <slot name="check" />
      </div> -->

      <div
        class="expander__trigger__header"
      >
        <slot name="header" />
      </div>

      <div
        class="expander__trigger__icon"
      >
        <slot name="icon" />
      </div>

      <div
        class="expander__trigger__options"
      >
        <slot name="options" />
      </div>
    </div>
    <transition name="fade">
      <div
        v-show="open && customAccordion"
        :class="'expander__body'">
        <slot name="body"/>
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  name: 'EntityAccordion',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    isLight: {
      type: Boolean,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    align: {
      type: String,
      default: 'center',
    },
    slim: {
      type: Boolean,
      default: false,
    },
    pendingExample: {
      type: Boolean,
      default: false,
    },
    customAccordion: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  watch: {
    open() {
      this.isOpen = this.open;
    },
  },
  mounted() {
    this.isOpen = this.open;
  },
  methods: {
    toggleAccordion() {
      this.isOpen = !this.isOpen;
      this.$emit('update:open', this.isOpen);
    },
  },
};
</script>


<style lang="scss" scoped>
  @import '~@/assets/scss/utilities';
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';

  .align {
    &-center {
      align-items: center;
    }

    &-top {
      align-items: flex-start;
    }
  }

  .before-border {
    position: relative;

    &:before {
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      content: '';
      transition: opacity .1s linear, transform .5s ease-in-out;
    }

    &:not(:hover)::before {
      opacity: 0;
      transform: scaleX(0);
    }
  }

  .accordion {
    overflow: hidden;
    background: $color-white;
    box-shadow: 0 1px 12px 1PX rgba(0,0,0,0.25);
  }

  .expander {
    &__trigger {
      display: flex;
      padding: .7rem 0;
      padding-bottom: 0;

      &--slim {
        padding: .35rem;
      }

      @media screen and (max-width: $mobile-width) {
        flex-wrap: wrap;
      }

      &--pending {
        background-color: $color-fake-white;
      }

    &__check {
      margin: 0 1rem;

      @media screen and (max-width: $mobile-width) {
        margin: 1rem 0;
      }
    }
    &__header {
      display: flex;
      // width: 80%;
      align-items: center;
    }
    &__icon {
      // min-width: 20%;
      display: flex;
      // justify-content: flex-end;
      margin-left: 0.5rem;

      @media screen and (max-width: $mobile-width) {
        margin: 0.3rem 0;
      }
    }
    &__options {
      // min-width: 20%;
      display: flex;
      // justify-content: flex-end;
      margin-left: auto;

      @media screen and (max-width: $mobile-width) {
        margin: 0.3rem 0;
      }
    }
    }

    &__body {
      padding: .5rem;
      padding-top: 0;

      &--pending{
        padding: .5rem 0;
        background: #EAEAEA;
        border-radius: 4px;
      }
    }
  }
  .cursor-pointer{
    cursor: pointer;
  }

  .is-light {
    background-color: white;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
  }

  .example {
    &__icon {
      margin: 0 .5rem;

      &:hover {
        color: black;
        transition: 1s;
      }
    }
  }
</style>
