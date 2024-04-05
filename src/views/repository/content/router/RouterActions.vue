<template>
  <section class="actions__container">
    <BasesFormGenericList
      shape="accordion"
      hideCounter
      hideToggle
      :title="'Fluxos'"
      :description="'o que é o router? no que ele agrega se eu ativar no fluxo?'"
      :addText="'Adicionar fluxo'"
      :items.sync="items"
      @load-more="$emit('load-more')"
      @add="isAddActionOpen = true"
      @remove="
        ($event) => openDeleteSite($event.uuid, $event.created_file_name || '')
      "
    />
  </section>
</template>

<script>
import BasesFormGenericList from '../BasesFormGenericList.vue';

export default {
  props: {
    items: Object,
  },

  components: {
    BasesFormGenericList,
  },

  data() {
    return {
      isAddActionOpen: false,

      modalDeleteSite: null,
    };
  },

  methods: {
    openDeleteAction(actionUuid, actionName) {
      this.modalDeleteSite = {
        uuid: actionUuid,
        name: actionName,
        status: null,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.actions__container {
  margin-top: $unnnic-spacing-xs;
}
</style>
