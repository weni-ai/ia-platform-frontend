export default {
  data() {
    return {};
  },

  mounted() {
    document.documentElement.classList.add('not-bulma');
  },

  beforeDestroy() {
    document.documentElement.classList.remove('not-bulma');
  },
};
