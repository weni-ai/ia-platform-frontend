<template>
  <RightSidebar
    :title="$t('content_bases.sites.sidebar_add.title')"
    :description="$t('content_bases.sites.sidebar_add.description')"
    dividerYSpacing="lg"
    @close="$emit('close')"
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
</template>

<script setup>
import nexusaiAPI from '@/api/nexusaiAPI.js';
import RightSidebar from '../../../components/RightSidebar.vue';
import i18n from '@/utils/plugins/i18n.js';
import { reactive, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const emit = defineEmits(['close', 'addedSites']);

const props = defineProps({
  contentBaseUuid: {
    type: String,
    required: true,
  },
});

const sites = reactive([{ value: '' }]);

const submitDisabled = computed(() => {
  return !sites.filter(({ value }) => validURL(value)).length;
});

function validURL(url) {
  // eslint-disable-next-line no-useless-escape
  return /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(
    url.trim(),
  );
}

function addSites() {
  const normalizeURL = (url) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      return url;
    }

    return `https://${url}`;
  };

  const items = sites
    .filter((site) => validURL(site.value))
    .map((site) =>
      reactive({
        file: null,
        file_name: null,
        extension_file: 'site',
        uuid: `temp-${Math.random() * 1000}`,
        created_file_name: normalizeURL(site.value),
        status: 'uploading',
      }),
    );

  emit('addedSites', items, props.contentBaseUuid);

  Promise.all(
    items.map(async (site) => {
      try {
        const { data } =
          await nexusaiAPI.intelligences.contentBases.sites.create({
            contentBaseUuid: props.contentBaseUuid,
            link: site.created_file_name,
          });

        site.uuid = data.uuid;
        site.status = 'processing';
      } catch (error) {
        site.status = 'fail';
      }
    }),
  ).then(() => {
    store.state.alert = {
      type: 'success',
      text: i18n.global.t(
        'content_bases.sites.content_of_the_sites_has_been_added',
      ),
    };
  });
}
</script>

<style lang="scss" scoped>
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
