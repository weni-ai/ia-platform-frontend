import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { fileSizeLimitInMegabytes } from '@/utils/medias';
import i18n from '@/utils/plugins/i18n';

import AddFilesContent from '../AddFilesContent.vue';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    intelligences: {
      contentBases: {
        files: {
          create: vi.fn(),
          delete: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('@/utils/medias', () => ({
  allowedMediaFormats: { document: ['.pdf', '.doc', '.docx'] },
  fileSizeLimitInMegabytes: 50,
}));

const store = createStore({
  state: {
    router: { contentBaseUuid: '123' },
    alert: null,
  },
});

describe('AddFilesContent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(AddFilesContent, {
      global: {
        plugins: [store, i18n],
      },
    });
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders StartAddContent when there are no files', () => {
    expect(wrapper.find('[data-testid="start-add-content"]').exists()).toBe(
      true,
    );
  });

  it('renders ContentItem for each file when files are present', async () => {
    wrapper.vm.files.data = [
      { uuid: 'file-1', file: 'example.pdf' },
      { uuid: 'file-2', file: 'example.docx' },
    ];

    await wrapper.vm.$nextTick();

    const contentItems = wrapper.findAllComponents(
      '[data-testid="content-item"]',
    );
    expect(contentItems).toHaveLength(2);
  });

  it('emits "update:model-value" when files.data changes', async () => {
    wrapper.vm.files.data.push({ uuid: 'file-1', file: 'example.pdf' });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:model-value')).toBeTruthy();
  });

  it('triggers file input click when StartAddContent emits "add"', async () => {
    const input = wrapper.find('[data-testid="input-file"]');
    const clickSpy = vi.spyOn(input.element, 'click');

    wrapper.findComponent('[data-testid="start-add-content"]').vm.$emit('add');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('displays an alert for unsupported file formats', async () => {
    const input = wrapper.find('[data-testid="input-file"]');
    const file = new File(['test'], 'example.exe', { type: 'application/exe' });

    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    });
    await input.trigger('change');

    expect(store.state.alert.text).toContain(
      i18n.global.t('content_bases.files.unsupported_format'),
    );
  });

  it('displays an alert for files exceeding size limit', async () => {
    const input = wrapper.find('[data-testid="input-file"]');
    const file = new File(['test'], 'largefile.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(file, 'size', {
      value: (fileSizeLimitInMegabytes + 1) * Math.pow(1024, 2),
    });

    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    });
    await input.trigger('change');

    expect(store.state.alert.text).toContain(
      i18n.global.t('content_bases.files.exceeds_limit', {
        limitMB: fileSizeLimitInMegabytes,
      }),
    );
  });

  it('removes a file when ContentItem emits "remove"', async () => {
    const mockFile = { uuid: 'file-1', file: 'example.pdf' };
    wrapper.vm.files.data = [mockFile];

    await wrapper.vm.$nextTick();

    const spyRemove = vi
      .spyOn(wrapper.vm, 'remove')
      .mockImplementation(() => {});
    const contentItem = wrapper.findComponent('[data-testid="content-item"]');

    contentItem.vm.$emit('remove', mockFile);

    expect(spyRemove).toHaveBeenCalledWith(mockFile);
  });
});
