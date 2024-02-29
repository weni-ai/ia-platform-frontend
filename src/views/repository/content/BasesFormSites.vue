<!-- eslint-disable vue/no-duplicate-attributes -->
<template>
  <section class="sites__container">
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
  </section>
</template>

<script>
import RightSidebar from '../../../components/RightSidebar.vue';

export default {
  components: {
    RightSidebar,
  },

  data() {
    return {
      isAddSiteOpen: true,

      sites: [{ value: '' }],
    };
  },

  computed: {
    submitDisabled() {
      return !this.sites.filter(({ value }) => this.validURL(value)).length;
    },
  },

  methods: {
    addSites() {
      console.log('add sites', this.sites);
    },

    validURL(url) {
      return /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(
        url.trim(),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
