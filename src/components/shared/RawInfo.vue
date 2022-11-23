<template>
  <unnnic-modal :showModal="true" :text="$t('webapp.raw.raw')" @close="closeModal()">
    <div slot="message" class="raw-info">
      <div class="raw-info__title">
        <p>{{ $t('webapp.raw.raw_subtitle') }}</p>
      </div>
      <div class="raw-info__json">
        <highlighted-code :code="text" class="raw-info__input" code-class="json" />
        <b-icon icon="content-copy" class="raw-info__copy clickable" @click.native="copyText()" />
      </div>
    </div>
  </unnnic-modal>
</template>

<script>
import HighlightedCode from '@/components/shared/HighlightedCode';

export default {
  name: 'RawInfo',
  components: { HighlightedCode },
  props: {
    info: {
      type: Object,
      required: true,
    },
  },
  computed: {
    text() {
      return JSON.stringify(this.info, undefined, 4);
    },
  },
  methods: {
    copyText() {
      navigator.clipboard.writeText(this.text);
      this.$buefy.toast.open({
        message: this.$t('webapp.layout.copied'),
        type: 'is-success',
      });
    },
    closeModal() {
      this.$emit('closeModal')
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.raw-info {
  display: flex;
  flex-direction: column;

  &__json {
    position: relative;
    margin-top: 1.5rem;

    pre {
      background: white;
      text-align: left;
      font-size: .875rem;
    }
  }

  &__title {
    padding: 0 1.3rem;

    h1 {
      font-family: $font-family;
      font-size: 1.75rem;
      font-weight: $font-weight-bolder;
    }

    p {
      font-family: 'Lato';
    }
  }

  &__input {
    height: 18.75rem;
    font-size: 1.1rem;
    overflow-y: scroll;
  }

  &__copy {
    color: $color-grey-dark;
    position: absolute;
    top: 2.5rem;
    right: 3rem;
  }

  &__close {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: $color-grey-dark;
    cursor: pointer;
  }
}

/deep/ .unnnic-modal-container-background-body-alert_icon {
  display: none;
}
</style>
