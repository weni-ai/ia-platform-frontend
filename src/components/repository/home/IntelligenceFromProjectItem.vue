<template>
  <div>
    <home-repository-card
      :repository-detail="project"
      :type="project.hasOwnProperty('content_bases_count') ? 'intelligence' : 'repository'"
      @dispatchShowModal="showModal($event)"
      @removed="$emit('removed')"
    />

    <modal-container
      :info-modal="modalInfo"
      :show-modal="openModal"
      @closeModal="openModal = false"
    >
    </modal-container>
  </div>
</template>
<script>
import HomeRepositoryCard from '@/components/repository/home/HomeRepositoryCard';
import ModalContainer from '@/components/repository/home/ModalContainer';

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
  }
};
</script>
