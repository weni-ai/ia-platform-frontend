<!-- eslint-disable vue/no-duplicate-attributes -->
<template>
  <section class="sites__container">
    <section
      v-if="items.data.length === 0"
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

    <div
      v-else
      class="sites__scrollable"
    >
      <BasesFormGenericList
        :title="$t('content_bases.sites.uploaded_sites')"
        :addText="$t('content_bases.sites.add_site')"
        :items.sync="items"
        @add="isAddSiteOpen = true"
        @remove="
          ($event) =>
            openDeleteSite($event.uuid, $event.created_file_name || '')
        "
      ></BasesFormGenericList>
    </div>

    <RightSidebar
      v-if="isAddSiteOpen"
      @close="isAddSiteOpen = false"
      :title="$t('content_bases.sites.sidebar_add.title')"
      :description="$t('content_bases.sites.sidebar_add.description')"
      dividerYSpacing="lg"
    >
      <form
        @submit.prevent="addSites"
        class="add-form"
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
              @click.prevent="sites.push({ value: '' })"
              :type.prop="'button'"
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
      <UnnnicIcon
        slot="icon"
        icon="error"
        size="md"
        scheme="aux-red-500"
      />

      <div
        slot="message"
        v-html="
          $t('content_bases.sites.delete_site.description', {
            name: modalDeleteSite.name,
          })
        "
      ></div>

      <UnnnicButton
        slot="options"
        class="create-repository__container__button"
        type="tertiary"
        @click="modalDeleteSite = false"
      >
        {{ $t('content_bases.sites.delete_site.cancel') }}
      </UnnnicButton>

      <UnnnicButton
        slot="options"
        class="create-repository__container__button attention-button"
        type="warning"
        @click="remove"
        :loading="modalDeleteSite.status === 'deleting'"
      >
        {{ $t('content_bases.sites.delete_site.delete') }}
      </UnnnicButton>
    </UnnnicModal>
  </section>
</template>

<script>
import RightSidebar from '../../../components/RightSidebar.vue';
import BasesFormGenericList from './BasesFormGenericList.vue';

export default {
  props: {
    items: Object,
  },

  components: {
    RightSidebar,
    BasesFormGenericList,
  },

  data() {
    return {
      isAddSiteOpen: false,

      sites: [{ value: '' }],

      modalDeleteSite: null,
    };
  },

  computed: {
    submitDisabled() {
      return !this.sites.filter(({ value }) => this.validURL(value)).length;
    },
  },

  methods: {
    addSites() {
      this.$emit('update:items', {
        ...this.items,
        data: this.items.data.concat(
          this.sites.map((site) => ({
            file: null,
            file_name: null,
            extension_file: 'site',
            uuid: 'site' + Math.random() * 1000,
            created_file_name: site.value,
            status: 'uploading',
          })),
        ),
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

      setTimeout(() => {
        this.$emit('update:items', {
          ...this.items,
          data: this.items.data.filter(
            ({ uuid }) => uuid !== this.modalDeleteSite.uuid,
          ),
        });

        this.$store.state.alert = {
          type: 'default',
          text: this.$t('content_bases.files.file_removed_from_base', {
            name: this.modalDeleteSite.name,
          }),
        };

        this.modalDeleteSite = null;
      }, 3000);
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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.delete-site-modal ::v-deep {
  .unnnic-modal-container-background-body-description-container {
    padding-bottom: $unnnic-spacing-xs;
  }

  .unnnic-modal-container-background-body__icon-slot {
    display: flex;
    justify-content: center;
    margin-bottom: $unnnic-spacing-sm;
  }

  .unnnic-modal-container-background-body-title {
    padding-bottom: $unnnic-spacing-sm;
  }

  .unnnic-modal-container-background-body {
    padding-top: $unnnic-spacing-giant;
  }
}

.sites {
  &__container {
    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-sm;

    flex: 1;
    display: flex;
    flex-direction: column;
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

  &__scrollable {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;

    overflow: overlay;

    $scroll-size: $unnnic-inline-nano;

    padding-right: $unnnic-inline-nano + $scroll-size;
    margin-right: -($unnnic-inline-nano + $scroll-size);

    &::-webkit-scrollbar {
      width: $scroll-size;
    }

    &::-webkit-scrollbar-thumb {
      background: $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    &::-webkit-scrollbar-track {
      background: $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-pill;
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
