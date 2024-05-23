<template>
  <section class="sources">
    <UnnnicCollapse
      size="md"
      v-model="active"
      :unspacedIcon="true"
    >
      <template slot="header">
        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          weight="regular"
          size="body-md"
          tag="p"
        >
          {{
            $tc('quick_test.sources', sources.length, { len: sources.length })
          }}
        </UnnnicIntelligenceText></template
      >
      <UnnnicIntelligenceText
        color="neutral-cloudy"
        family="secondary"
        weight="regular"
        size="body-md"
        tag="p"
      >
        {{ list(sources) }}.
      </UnnnicIntelligenceText>
    </UnnnicCollapse>
  </section>
</template>

<script>
import { uniq } from 'lodash';

export default {
  props: {
    sources: Array,
  },

  data() {
    return {
      active: false,
    };
  },

  methods: {
    list(sources) {
      const list = uniq(sources.map(this.name));

      return [list.slice(0, -1).join(', '), list.at(-1)]
        .filter((i) => i)
        .join(this.$t('and'));
    },

    type(source) {
      const types = {
        '.link:': 'link',
        '.text': 'text',
      };

      return (
        types[
          Object.keys(types).find((initial) =>
            String(source.created_file_name).startsWith(initial),
          )
        ] || 'file'
      );
    },

    name(source) {
      const type = this.type(source);

      const { created_file_name: name, extension_file: extension } = source;

      if (type === 'text') {
        return this.$t('content_bases.tabs.text').toLocaleLowerCase();
      }

      if (type === 'link') {
        return name.replace('.link:', '');
      }

      if (type === 'file') {
        return `${name}.${extension}`;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.sources {
  margin-top: $unnnic-spacing-xs;

  ::v-deep .unnnic-collapse {
    padding: 0;
  }

  ::v-deep .unnnic-icon {
    min-width: 10px;
    min-height: 10px;
    height: 10px;
    width: 10px;
  }
}
</style>
