<template>
  <div>
    <HomeRepositoryCard
      :type="
        project.hasOwnProperty('content_bases_count')
          ? 'content-intelligence'
          : 'classification-intelligence'
      "
      :uuid="project.uuid"
      :name="project.name"
      :description="project.description"
      :contentBasesLength="project.content_bases_count"
      :intents="project.intents"
      :languages="project.available_languages"
      :force="force"
      :defaultVersionId="project.version_default?.id"
      :isPrivate="project.is_private"
      :slug="project.slug"
      :ownerNickname="project.owner__nickname"
      @removed="$emit('removed')"
    />
  </div>
</template>
<script>
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard.vue';
import ModalContainer from '@/components/repository/home/ModalContainer.vue';

export default {
  name: 'HomeIntelligenceFromProject',
  components: { HomeRepositoryCard, ModalContainer },
  props: {
    project: Object,
  },

  emits: ['removed'],

  data() {
    return {};
  },

  computed: {
    force() {
      if (!this.project.repository_score) {
        return 0;
      }

      const scoreObject = this.project.repository_score;
      const scoreResult =
        (scoreObject.evaluate_size_score +
          scoreObject.intents_balance_score +
          scoreObject.intents_size_score) /
        3;

      return Math.round(scoreResult);
    },
  },
};
</script>
