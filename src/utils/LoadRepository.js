import repositoryV2 from '../api/v2/repository';

export default {
  data() {
    return {
      loadingIntelligence: false,

      repository: {
        uuid: null,
        language: '',
        name: '',
        description: '',
        categories_list: [],
      },
    };
  },

  mounted() {
    this.loadingIntelligence = true;

    repositoryV2
      .shortcut(this.$route.params.ownerNickname, this.$route.params.slug)
      .then(({ data }) => {
        this.repository = data;
      })
      .finally(() => {
        this.loadingIntelligence = false;
      });
  },
};
