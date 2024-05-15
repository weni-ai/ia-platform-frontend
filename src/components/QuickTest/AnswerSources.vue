<template>
  <section class="sources">
    <UnnnicIntelligenceText
      color="neutral-cloudy"
      family="secondary"
      weight="regular"
      size="body-md"
      tag="p"
    >
      {{ $tc('quick_test.sources', sources.length) }}

      {{ list(sources) }}.
    </UnnnicIntelligenceText>
  </section>
</template>

<script>
export default {
  props: {
    sources: Array,
  },

  methods: {
    list(sources) {
      const list = sources.map(this.name);

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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.sources {
  margin-top: $unnnic-spacing-xs;
}
</style>
