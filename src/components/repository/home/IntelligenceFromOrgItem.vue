<template>
  <div>
    <home-repository-card
      :repository-detail="intelligence"
      @dispatchShowModal="showModal($event)"
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
  name: 'HomeIntelligenceFromOrg',
  components: {
    HomeRepositoryCard,
    ModalContainer,
  },
  props: {
    intelligence: Object,
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
