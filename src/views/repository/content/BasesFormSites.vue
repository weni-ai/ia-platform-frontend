<!-- eslint-disable vue/no-duplicate-attributes -->
<template>
  <section :class="`sites__container sites__container--shape-${shape}`">
    <section
      v-if="items.data.length === 0 && shape !== 'accordion'"
      class="sites__content--empty"
    >
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        color="neutral-darkest"
        size="body-lg"
        weight="bold"
        marginBottom="sm"
      >
        {{ $t('content_bases.sites.sidebar_add.title') }}
      </UnnnicIntelligenceText>

      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        color="neutral-cloudy"
        size="body-gt"
        marginBottom="sm"
      >
        {{ $t('content_bases.sites.sidebar_add.description') }}
      </UnnnicIntelligenceText>

      <UnnnicButton
        size="small"
        type="primary"
        class="sites__content__button-add-site"
        @click.native="isAddSiteOpen = true"
      >
        {{ $t('content_bases.sites.add_site') }}
      </UnnnicButton>
    </section>

    <BasesFormGenericList
      v-else
      :items="items"
      :shape="shape"
      :title="
        shape === 'accordion'
          ? $t('content_bases.tabs.sites')
          : $t('content_bases.sites.uploaded_sites')
      "
      :description="$t('content_bases.sites.sidebar_add.description')"
      :addText="$t('content_bases.sites.add_site')"
      :filterItem="filterItem"
      @load-more="$emit('load-more')"
      @add="isAddSiteOpen = true"
      @remove="
        ($event) => openDeleteSite($event.uuid, $event.created_file_name || '')
      "
    />

    <RightSidebar
      v-if="isAddSiteOpen"
      :title="$t('content_bases.sites.sidebar_add.title')"
      :description="$t('content_bases.sites.sidebar_add.description')"
      dividerYSpacing="lg"
      @close="isAddSiteOpen = false"
    >
      <form
        class="add-form"
        @submit.prevent="addSites"
      >
        <UnnnicFormElement
          :label="$t('content_bases.sites.sidebar_add.fields.link.label')"
        >
          <section class="add-form__links">
            <UnnnicInput
              v-for="(site, index) in sites"
              :key="index"
              v-model="site.value"
              :type="
                !site.value.trim() || validURL(site.value) ? 'normal' : 'error'
              "
              :placeholder="
                $t('content_bases.sites.sidebar_add.fields.link.placeholder')
              "
              :iconRight="sites.length > 1 ? 'bin-1-1' : null"
              iconRightClickable
              @icon-right-click="sites.splice(index, 1)"
            ></UnnnicInput>

            <UnnnicButton
              type="tertiary"
              size="small"
              iconLeft="add-1"
              :type.prop="'button'"
              @click.prevent="sites.push({ value: '' })"
            >
              {{ $t('content_bases.sites.sidebar_add.button_more_one') }}
            </UnnnicButton>
          </section>
        </UnnnicFormElement>

        <UnnnicButton
          class="add-form__button-submit"
          :disabled="submitDisabled"
        >
          {{ $t('content_bases.sites.sidebar_add.button_load_content') }}
        </UnnnicButton>
      </form>
    </RightSidebar>

    <UnnnicModal
      v-if="modalDeleteSite"
      :text="$t('content_bases.sites.delete_site.title')"
      :closeIcon="false"
      class="delete-site-modal"
      persistent
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
          @click="modalDeleteSite = false"
        >
          {{ $t('content_bases.sites.delete_site.cancel') }}
        </UnnnicButton>

        <UnnnicButton
          class="create-repository__container__button attention-button"
          type="warning"
          :loading="modalDeleteSite.status === 'deleting'"
          @click="remove"
        >
          {{ $t('content_bases.sites.delete_site.delete') }}
        </UnnnicButton>
      </template>
    </UnnnicModal>
  </section>
</template>

<script>
import nexusaiAPI from '../../../api/nexusaiAPI';
import RightSidebar from '../../../components/RightSidebar.vue';
import BasesFormGenericList from './BasesFormGenericList.vue';

export default {
  components: {
    RightSidebar,
    BasesFormGenericList,
  },
  props: {
    items: Object,
    shape: String,
    filterText: String,
  },

  data() {
    return {
      isAddSiteOpen: false,

      sites: [{ value: '' }],

      modalDeleteSite: null,
    };
  },

  computed: {
    contentBaseUuid() {
      return (
        this.$route.params.contentBaseUuid ||
        this.$store.state.router.contentBaseUuid
      );
    },

    submitDisabled() {
      return !this.sites.filter(({ value }) => this.validURL(value)).length;
    },
  },

  methods: {
    filterItem(item) {
      return item.created_file_name
        ?.toLowerCase()
        .includes(this.filterText?.toLowerCase());
    },

    addSites() {
      const sites = this.sites
        .filter((site) => this.validURL(site.value))
        .map((site) => ({
          file: null,
          file_name: null,
          extension_file: 'site',
          uuid: `temp-${Math.random() * 1000}`,
          created_file_name: site.value,
          status: 'uploading',
        }));

      this.$emit('update:items', {
        ...this.items,
        data: this.items.data.concat(sites),
      });

      Promise.all(
        sites.map(async (site) => {
          const { data } =
            await nexusaiAPI.intelligences.contentBases.sites.create({
              contentBaseUuid: this.contentBaseUuid,
              link: site.created_file_name,
            });

          site.uuid = data.uuid;
          site.status = 'uploaded';
        }),
      ).then(() => {
        this.$store.state.alert = {
          type: 'success',
          text: this.$t(
            'content_bases.sites.content_of_the_sites_has_been_added',
          ),
        };
      });

      this.sites = [{ value: '' }];

      this.isAddSiteOpen = false;
    },

    openDeleteSite(siteUuid, siteURL) {
      this.modalDeleteSite = {
        uuid: siteUuid,
        name: siteURL,
        status: null,
      };
    },

    remove() {
      this.modalDeleteSite.status = 'deleting';

      nexusaiAPI.intelligences.contentBases.sites
        .delete({
          contentBaseUuid: this.contentBaseUuid,
          linkUuid: this.modalDeleteSite.uuid,
        })
        .then(() => {
          this.$store.state.alert = {
            type: 'default',
            text: this.$t('content_bases.files.file_removed_from_base', {
              name: this.modalDeleteSite.name,
            }),
          };

          this.$emit('removed', this.modalDeleteSite.uuid);
        })
        .finally(() => {
          this.modalDeleteSite = null;
        });
    },

    validURL(url) {
      // eslint-disable-next-line no-useless-escape
      return /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(
        url.trim(),
      );
    },
  },
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

.add-form {
  &__links {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-xs;
  }

  &__button-submit {
    width: 100%;
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
