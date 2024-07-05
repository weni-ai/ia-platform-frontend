<template>
  <UnnnicModal
    :title="$t(`content_bases.${translationType}.preview.title`)"
    size="lg"
  >
    <section>
      <UnnnicIntelligenceText
        color="neutral-dark"
        family="secondary"
        weight="bold"
        size="body-gt"
        tag="p"
        marginBottom="xs"
      >
        {{ $t(`content_bases.files.preview.name`) }}
      </UnnnicIntelligenceText>

      <UnnnicIntelligenceText
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
      >
        {{ name }}
      </UnnnicIntelligenceText>
    </section>

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

    <p
      v-for="(paragraph, index) in content.text.split(/\n+/)"
      v-else
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
  </UnnnicModal>
</template>

<script setup>
import UnnnicModal from '@/components/LocalUnnnic/UnnnicModal.vue';
import nexusaiAPI from '@/api/nexusaiAPI.js';
import { onMounted, reactive, watch, computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'file',
  },
  name: String,
  projectUuid: String,
  contentBaseUuid: String,
  fileUuid: String,
});

const content = reactive({
  loading: false,
  text: '',
  page: 1,
  totalPages: null,
});

const translationType = computed(
  () => ({ file: 'files', site: 'sites' })[props.type],
);

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

  if (status === 200) {
    content.text = text;
    content.page = page_number;
    content.totalPages = total_pages;
  }
}
</script>

<style lang="scss" scoped>
.content-paragraph + .content-paragraph {
  margin-top: $unnnic-spacing-xs;
}

.pagination {
  margin-top: $unnnic-spacing-sm;
  justify-content: end;
}
</style>
