<template>
  <unnnic-carousel
    :tagItems="filteredData"
    v-model="value"
    @change-selected="update()"
  />
</template>

<script>

export default {
  props: {
    choices: {
      required: true,
      type: Array,
    },
    initialData: {
      type: [Array, String],
      default: () => ([]),
    },
  },
  data() {
    return {
      value: this.initialData.map(choice => choice.value),
    };
  },
  computed: {
    filteredData() {
      const values = this.value.map(({ value }) => (value));
      return this.choices
        .map((value) => ({ ...value, name: value.display_name, id: value.value }));
    },
  },
  mounted() {
    this.update();
  },
  methods: {
    update() {
      this.$emit('input', this.value);
    },
  },
};
</script>
