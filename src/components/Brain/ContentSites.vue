<template>
  <section :class="`sites__container sites__container--shape-${$props.shape}`">
    <section
      v-if="$props.items.data.length === 0 && $props.shape !== 'accordion'"
      class="sites__content--empty"
    >
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        color="neutral-darkest"
        size="body-lg"
        weight="bold"
        marginBottom="sm"
        data-test="label-title"
      >
        {{ $t('content_bases.sites.title') }}
      </UnnnicIntelligenceText>

      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        color="neutral-cloudy"
        size="body-gt"
        marginBottom="sm"
        data-test="label-description"
      >
        {{ $t('content_bases.sites.description') }}
      </UnnnicIntelligenceText>

      <UnnnicButton
        size="small"
        type="primary"
        class="sites__content__button-add-site"
        @click="openAddSite"
      >
        {{ $t('content_bases.sites.add_site') }}
      </UnnnicButton>
    </section>

    <ContentList
      v-else
      :items="$props.items"
      :shape="$props.shape"
      :subDescription="$t('content_bases.sites.description')"
      :description="$t('content_bases.sites.title')"
      :addText="$t('content_bases.sites.add_site')"
      defaultIcon="globe"
      columns="1, 1fr"
      @add="openAddSite"
      @remove="onRemove"
    />

    <ModalAddSite
      v-if="isAddSiteOpen"
      v-model="isAddSiteOpen"
      :contentBaseUuid="contentBaseUuid"
      @close="closeAddSite"
      @added-site="addedSites"
    />

    <UnnnicModal
      v-if="modalDeleteSite"
      :text="$t('content_bases.sites.delete_site.title')"
      :closeIcon="false"
      class="delete-site-modal"
      persistent
      data-test="modal-remove-site"
    >
      <template #icon>
        <UnnnicIcon
          icon="error"
          size="md"
          scheme="aux-red-500"
        />
      </template>

      <template #message>
        <div
          v-html="
            $t('content_bases.sites.delete_site.description', {
              name: modalDeleteSite.name,
            })
          "
        ></div>
      </template>
      <template #options>
        <UnnnicButton
          class="create-repository__container__button"
          type="tertiary"
          data-test="button-cancel"
          @click="closeModal"
        >
          {{ $t('content_bases.sites.delete_site.cancel') }}
        </UnnnicButton>

        <UnnnicButton
          class="create-repository__container__button attention-button"
          type="warning"
          :loading="modalDeleteSite.status === 'deleting'"
          data-test="button-remove"
          @click="remove"
        >
          {{ $t('content_bases.sites.delete_site.delete') }}
        </UnnnicButton>
      </template>
    </UnnnicModal>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import nexusaiAPI from '@/api/nexusaiAPI';
import ModalAddSite from '@/components/Brain/ContentBase/ModalAddSite.vue';
import ContentList from '@/components/Brain/ContentBase/ContentList.vue';
import i18n from '@/utils/plugins/i18n.js';

const props = defineProps({
  items: {
    type: Object,
    default: () => {},
  },
  shape: {
    type: String,
    default: 'accordion',
  },
});

const isAddSiteOpen = ref(false);
const modalDeleteSite = ref(null);

const route = useRoute();
const store = useStore();

const contentBaseUuid = computed(
  () => route.params.contentBaseUuid || store.state.router.contentBaseUuid,
);

const openAddSite = () => {
  isAddSiteOpen.value = true;
};

const closeAddSite = () => {
  isAddSiteOpen.value = false;
};

const onRemove = ({ uuid, created_file_name, status }) => {
  if (['fail-upload'].includes(status)) {
    props.items.removeItem({ uuid });
  } else {
    openDeleteSite(uuid, created_file_name || '');
  }
};

const addedSites = (site) => {
  props.items.addItem(site);
};

const openDeleteSite = (siteUuid, siteURL) => {
  modalDeleteSite.value = {
    uuid: siteUuid,
    name: siteURL,
    status: null,
  };
};

const closeModal = () => {
  modalDeleteSite.value = null;
};

const remove = () => {
  modalDeleteSite.value.status = 'deleting';

  nexusaiAPI.intelligences.contentBases.sites
    .delete({
      contentBaseUuid: contentBaseUuid.value,
      linkUuid: modalDeleteSite.value.uuid,
    })
    .then(() => {
      store.state.alert = {
        type: 'default',
        text: i18n.global.t('content_bases.files.file_removed_from_base', {
          name: modalDeleteSite.value.name,
        }),
      };

      props.items.removeItem({ uuid: modalDeleteSite.value.uuid });
    })
    .finally(() => {
      closeModal();
    });
};
</script>

<style lang="scss" scoped>
.delete-site-modal {
  :deep(.unnnic-modal-container-background-body-description-container) {
    padding-bottom: $unnnic-spacing-xs;
  }

  :deep(.unnnic-modal-container-background-body__icon-slot) {
    display: flex;
    justify-content: center;
    margin-bottom: $unnnic-spacing-sm;
  }

  :deep(.unnnic-modal-container-background-body-title) {
    padding-bottom: $unnnic-spacing-sm;
  }

  :deep(.unnnic-modal-container-background-body) {
    padding-top: $unnnic-spacing-giant;
  }
}

.sites {
  &__container {
    flex: 1;
    display: flex;
    flex-direction: column;

    &--shape-normal {
      height: 100%;
    }
  }

  &__content {
    &--empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &__button-add-site {
      width: 12.5 * $unnnic-font-size;
    }
  }
}
</style>
