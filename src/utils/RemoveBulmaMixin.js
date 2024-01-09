export default {
  data() {
    return {
      bulmaStyles: [],
    }
  },

  mounted() {
    this.removeBulmaStyles();
  },

  beforeDestroy() {
    this.retoreBulmaStyles();
  },

  updated() {
    document.styleSheets.forEach((style) => {
      if (style.ownerNode.innerHTML.startsWith('/* Bulma Utilities */')) {
        this.bulmaStyles.push(
          style.ownerNode.parentNode.removeChild(style.ownerNode),
        );
      }
    });
  },

  methods: {
    removeBulmaStyles() {
      document.styleSheets.forEach((style) => {
        if (style.ownerNode.innerHTML.startsWith('/* Bulma Utilities */')) {
          this.bulmaStyles.push(
            style.ownerNode.parentNode.removeChild(style.ownerNode),
          );
        }
      });

      const style = document.createElement('style');

      style.setAttribute('class', 'remove-body-margin');
      style.innerHTML = 'body { margin: 0; }';

      document.head.appendChild(style);
    },

    retoreBulmaStyles() {
      this.bulmaStyles.forEach((style) => {
        document.head.appendChild(style);
      });

      const style = document.querySelector('.remove-body-margin');

      style.parentNode.removeChild(style);
    },
  },
};
