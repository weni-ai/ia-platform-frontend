<template>
  <div class="highlighted-pre">
    <pre v-highlightjs="finalCode"><code :class="codeClass"></code></pre>

    <UnnnicToolTip
      @mouseout.native="copyLabel = 'Copiar'"
      :text="$t('webapp.integration.copy_label')"
      enabled
      side="top"
      maxWidth="15rem"
      class="copy-button"
    >
      <UnnnicButtonIcon
        size="small"
        icon="copy-paste-1"
        @click.native="copyURL()"
      />
    </UnnnicToolTip>
  </div>
</template>

<script>
import 'vue-code-highlight/themes/prism-okaidia.css';
import { component as VueCodeHighlight } from 'vue-code-highlight';

export default {
  name: 'HighlightedCode',
  components: {
    VueCodeHighlight,
  },
  props: {
    code: {
      type: String,
      default: null,
    },
    codeClass: {
      type: String,
      default: 'html',
    },
  },
  computed: {
    finalCode() {
      return (
        this.code ||
        (this.$slots.default &&
          this.$slots.default[0] &&
          this.$slots.default[0].text)
      );
    },
  },
  methods: {
    copyURL() {
      navigator.clipboard.writeText(this.finalCode);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '../../assets/scss/hightlight.min.css';

.highlighted-pre {
  margin: 0;
  padding: $unnnic-spacing-sm;
  position: relative;
  background-color: $unnnic-color-neutral-light;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-soft;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  border-radius: $unnnic-border-radius-sm;
  box-sizing: content-box;
  min-height: $unnnic-font-size-body-gt + $unnnic-line-height-md +
    (0.875 * $unnnic-font-size);
  display: flex;
  align-items: center;

  pre {
    margin: 0;
  }

  code {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-primary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
  }

  .copy-button {
    position: absolute;
    top: $unnnic-spacing-stack-sm;
    right: $unnnic-spacing-stack-sm;
  }
}
</style>
