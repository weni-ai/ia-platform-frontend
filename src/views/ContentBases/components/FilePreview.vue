<template>
  <UnnnicModal
    :title="$t(`content_bases.${translationType}.preview.title`)"
    size="lg"
  >
    <header class="details">
      <section
        v-for="(detail, index) in details"
        :key="index"
      >
        <UnnnicIntelligenceText
          color="neutral-dark"
          family="secondary"
          weight="bold"
          size="body-gt"
          tag="p"
          marginBottom="xs"
        >
          {{ detail.title }}
        </UnnnicIntelligenceText>

        <UnnnicIntelligenceText
          color="neutral-cloudy"
          family="secondary"
          size="body-gt"
        >
          {{ detail.value }}
        </UnnnicIntelligenceText>
      </section>
    </header>

    <UnnnicDivider ySpacing="md" />

    <template v-if="content.loading">
      <UnnnicSkeletonLoading
        v-for="(height, index) in ['44px', '110px', '88px', '110px', '88px']"
        :key="index"
        class="content-paragraph"
        :height="height"
        tag="section"
      />
    </template>

    <NotFound v-else-if="contentNotFound" />

    <template v-else>
      <UnnnicIntelligenceText
        tag="p"
        color="neutral-dark"
        family="secondary"
        weight="bold"
        size="body-gt"
        marginBottom="xs"
      >
        {{
          $t(
            `content_bases.${translationType}.preview.content_added_to_the_agent`,
          )
        }}
      </UnnnicIntelligenceText>

      <p
        v-for="(paragraph, index) in content.text.split(/\n+/)"
        :key="index"
        class="content-paragraph"
      >
        {{ paragraph }}
      </p>

      <UnnnicPagination
        v-if="content.totalPages >= 2"
        v-model="content.page"
        class="pagination"
        :disabled="content.loading"
        :max="content.totalPages"
      ></UnnnicPagination>
    </template>
  </UnnnicModal>
</template>

<script setup>
import UnnnicModal from '@/components/LocalUnnnic/UnnnicModal.vue';
import NotFound from './FilePreviewNotFound.vue';
import nexusaiAPI from '@/api/nexusaiAPI.js';
import { onMounted, reactive, watch, computed } from 'vue';
import i18n from '@/utils/plugins/i18n.js';

const props = defineProps({
  type: {
    type: String,
    default: 'file',
  },
  name: String,
  projectUuid: String,
  contentBaseUuid: String,
  fileUuid: String,
  createdAt: String,
});

const content = reactive({
  loading: false,
  status: null,
  text: '',
  page: 1,
  totalPages: null,
});

const translationType = computed(
  () => ({ file: 'files', site: 'sites' })[props.type],
);

const contentNotFound = computed(() => {
  return content.status === 404;
});

const formattedCreatedAt = computed(() => {
  if (!props.createdAt) {
    return null;
  }

  const { locale } = i18n.global;

  const date = new Date(props.createdAt);

  return (
    date.toLocaleDateString(locale) + '     ' + date.toLocaleTimeString(locale)
  );
});

const details = computed(() => {
  const details = [];

  details.push({
    title: i18n.global.t(`content_bases.${translationType.value}.preview.name`),
    value: props.name,
  });

  if (formattedCreatedAt.value) {
    details.push({
      title: i18n.global.t('content_bases.files.preview.date'),
      value: formattedCreatedAt.value,
    });
  }

  return details;
});

onMounted(async () => {
  loadContent();
});

watch([() => content.page], loadContent);

async function loadContent() {
  content.loading = true;

  const { data } = await nexusaiAPI.intelligences.contentBases.files
    .preview({
      projectUuid: props.projectUuid,
      contentBaseUuid: props.contentBaseUuid,
      fileUuid: props.fileUuid,
      page: content.page,
    })
    .finally(() => (content.loading = false));

  const { status } = data;
  const { content: text, page_number, total_pages } = data.data;

  content.status = status;

  if (content.status === 200) {
    content.text = text;
    content.page = page_number;
    content.totalPages = total_pages;
  }
}
</script>

<style lang="scss" scoped>
.details {
  display: flex;
  column-gap: $unnnic-spacing-sm;
  white-space: pre-wrap;
  word-break: break-word;

  > section {
    flex: 1;
  }
}

.content-paragraph + .content-paragraph {
  margin-top: $unnnic-spacing-xs;
}

.pagination {
  margin-top: $unnnic-spacing-sm;
  justify-content: end;
}
</style>
