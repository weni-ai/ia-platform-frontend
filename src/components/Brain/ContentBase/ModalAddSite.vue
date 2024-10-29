<template>
  <UnnnicModalDialog
    :modelValue="true"
    showCloseIcon
    size="md"
    :title="$t('content_bases.sites.add_site')"
    :secondaryButtonProps="{
      text: $t('content_bases.sites.modal.buttons.cancel'),
      'data-test': 'cancel-button',
    }"
    :primaryButtonProps="{
      text: $t('content_bases.sites.modal.buttons.finish'),
      disabled: submitDisabled,
      'data-test': 'finish-button',
    }"
    @secondary-button-click="$emit('close')"
    @primary-button-click="addSite"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <section class="add-site-container">
      <UnnnicIntelligenceText
        class="description"
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        marginTop="xs"
        tag="p"
      >
        {{ $t('content_bases.sites.modal.description') }}
      </UnnnicIntelligenceText>
      <UnnnicFormElement
        :label="$t('content_bases.sites.modal.fields.link.label')"
      >
        <UnnnicInput
          v-model="site"
          data-test="site-input"
          :type="!site.trim() || validURL(site) ? 'normal' : 'error'"
          :placeholder="
            $t('content_bases.sites.sidebar_add.fields.link.placeholder')
          "
          @input="onInput"
        ></UnnnicInput>
      </UnnnicFormElement>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import nexusaiAPI from '@/api/nexusaiAPI.js';
import i18n from '@/utils/plugins/i18n.js';
import { ref, computed, reactive } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const emit = defineEmits(['close', 'addedSite', 'update:modelValue']);

const props = defineProps({
  contentBaseUuid: {
    type: String,
    required: true,
  },
});

const site = ref('');

const onInput = (event) => {
  const siteWithoutSpaces = event.target.value.trim().split(/\s+/).join('');
  site.value = siteWithoutSpaces;
};

const submitDisabled = computed(() => !validURL(site.value));

function validURL(url) {
  // eslint-disable-next-line no-useless-escape
  return /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(
    url.trim(),
  );
}

function normalizeURL(url) {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  return `https://${url}`;
}

function addSite() {
  if (validURL(site.value)) {
    const newSite = reactive({
      file: null,
      file_name: null,
      extension_file: 'site',
      uuid: `temp-${Math.random() * 1000}`,
      created_file_name: normalizeURL(site.value),
      status: 'uploading',
    });

    emit('addedSite', newSite, props.contentBaseUuid);

    nexusaiAPI.intelligences.contentBases.sites
      .create({
        contentBaseUuid: props.contentBaseUuid,
        link: newSite.created_file_name,
      })
      .then(({ data }) => {
        newSite.uuid = data.uuid;
        newSite.status = 'processing';
      })
      .catch((error) => {
        newSite.status = 'fail';
      })
      .finally(() => {
        emit('close');
        store.state.alert = {
          type: 'success',
          text: i18n.global.t(
            'content_bases.sites.content_of_the_sites_has_been_added',
          ),
        };
      });
  }
}
</script>

<style lang="scss" scoped>
.add-site-container {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  .description {
    margin-top: 0;
  }
}
</style>
