<template>
  <div>
    <HomeRepositoryCard
      :repositoryDetail="project"
      :type="
        project.hasOwnProperty('content_bases_count')
          ? 'intelligence'
          : 'repository'
      "
      @dispatchShowModal="showModal($event)"
      @removed="$emit('removed')"
    />

    <ModalContainer
      :infoModal="modalInfo"
      :showModal="openModal"
      @closeModal="openModal = false"
    >
    </ModalContainer>
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
  data() {
    return {
      modalInfo: {},
      openModal: false,
    };
  },
  methods: {
    showModal(value) {
      this.openModal = true;
      this.modalInfo = { ...value };
    },
  },
};
</script>
