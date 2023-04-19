<template>
  <pre
    v-highlightjs="finalCode"
    class="highlighted-pre"
  >
    <code :class="codeClass"></code>
    <unnnic-tool-tip
      @mouseout.native="copyLabel = 'Copiar'"
      :text="$t('webapp.integration.copy_label')"
      enabled
      side="top"
      maxWidth="15rem"
    >
      <unnnic-button-icon
        size="small"
        icon="copy-paste-1"
        @click.native="copyURL()"
      />
    </unnnic-tool-tip>
  </pre>
</template>

<script>
export default {
  name: 'HighlightedCode',
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
      return this.code || (
        this.$slots.default
        && this.$slots.default[0]
        && this.$slots.default[0].text
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
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
.highlighted-pre {
  white-space: pre-wrap;
  min-height: 68px;
  background-color: $unnnic-color-neutral-lightest;
  border: 1px solid $unnnic-color-neutral-soft;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px;

  code {
    font-family: $unnnic-font-family-primary;
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    margin-left: $unnnic-spacing-stack-sm;
  }

  .unnnic-tooltip {
    display: flex;
    align-items: center;
    margin-right: $unnnic-spacing-stack-sm;
  }
}
</style>
