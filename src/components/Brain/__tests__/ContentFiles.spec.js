import { mount } from '@vue/test-utils';
import ContentFiles from '@/components/Brain/ContentFiles.vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createStore } from 'vuex';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

const deleteRequest = vi
  .spyOn(nexusaiAPI.intelligences.contentBases.files, 'delete')
  .mockResolvedValue({});

const createRequest = vi
  .spyOn(nexusaiAPI.intelligences.contentBases.files, 'create')
  .mockResolvedValue({
    data: {
      uuid: '1',
      extension_file: 'txt',
    },
  });

let registeredEventListeners = [];
let unregisteredEventListeners = [];

window.realAddEventListener = window.addEventListener;
window.realRemoveEventListener = window.removeEventListener;

window.addEventListener = (eventName, ...args) => {
  registeredEventListeners.push(eventName);
  window.realAddEventListener(eventName, ...args);
};

window.removeEventListener = (eventName, ...args) => {
  unregisteredEventListeners.push(eventName);
  window.realRemoveEventListener(eventName, ...args);
};

const generateFiles = () => ({
  addItem: vi.fn(),
  removeItem: vi.fn(),
  loadNext: vi.fn(),
  next: null,
  status: null,
  data: [
    {
      extension_file: 'txt',
      uuid: '1',
      created_file_name: 'Text 1',
      status: 'uploaded',
      file_name: 'Text 1.txt',
      created_at: '2024-07-01T00:00:00.000000Z',
    },
    {
      extension_file: 'txt',
      uuid: '2',
      created_file_name: 'Text 2',
      status: 'uploaded',
      file_name: 'Text 2.txt',
      created_at: '2024-07-01T00:00:00.000000Z',
    },
    {
      extension_file: 'txt',
      uuid: '3',
      created_file_name: 'Text 3',
      status: 'uploaded',
      file_name: 'Text 3.txt',
      created_at: '2024-07-01T00:00:00.000000Z',
    },
  ],
});

const store = createStore({
  state() {
    return {
      Actions: {
        status: null,
        data: [],

        types: {
          status: null,
          data: [],
        },
      },

      alert: null,
    };
  },
});

const setup = ({ files }) =>
  mount(ContentFiles, {
    props: {
      files,
    },
    global: {
      plugins: [store, i18n],
      mocks: {
        $route: {
          params: {
            contentBaseUuid: '1234',
          },
        },
      },
    },
  });

describe('ContentFiles.vue', () => {
  let wrapper;
  let files;

  beforeEach(() => {
    registeredEventListeners = [];
    unregisteredEventListeners = [];

    files = generateFiles();

    wrapper = setup({
      files,
    });

    vi.clearAllMocks();
  });

  describe('when the component is initialized', () => {
    it('does not show modal delete file', () => {
      const modalDeleteFile = wrapper.find('[data-test="modal-remove-file"]');

      expect(modalDeleteFile.exists()).toBeFalsy();
    });

    it('registers events for drop files behavior', () => {
      expect(registeredEventListeners).toEqual(
        expect.arrayContaining(['dragover', 'dragleave', 'drop']),
      );
    });
  });

  describe('when the component is unmounted', () => {
    it('unregisters events for drop files behavior', () => {
      wrapper.unmount();

      expect(unregisteredEventListeners).toEqual(
        expect.arrayContaining(['dragover', 'dragleave', 'drop']),
      );
    });
  });

  describe('when user uploads no file', () => {
    beforeEach(() => {
      const inputFile = wrapper.find({ ref: 'browser-file-input' });

      vi.spyOn(inputFile.wrapperElement, 'files', 'get').mockReturnValue([]);

      inputFile.wrapperElement.dispatchEvent(new Event('change'));
    });

    it('does not add any file', () => {
      expect(files.addItem).not.toHaveBeenCalled();
    });
  });

  describe.each([
    {
      type: 'an unsupported file',
      extension: 'heic',
      size: null,
      errorMessage: i18n.global.t('content_bases.files.unsupported_format'),
    },
    {
      type: 'a file that exceeds limit',
      extension: 'txt',
      size: 50 * Math.pow(1024, 2) + 1,
      errorMessage: i18n.global.t('content_bases.files.exceeds_limit', {
        limitMB: 50,
      }),
    },
  ])('when the user uploads $type', ({ extension, size, errorMessage }) => {
    const textFile = new File(
      ['Hello World!'],
      `Name of the File.${extension}`,
      { type: '' },
    );

    if (size) {
      Object.defineProperty(textFile, 'size', { value: size });
    }

    let inputFile;

    beforeEach(() => {
      inputFile = wrapper.find({ ref: 'browser-file-input' });

      vi.spyOn(inputFile.wrapperElement, 'files', 'get').mockReturnValue([
        textFile,
      ]);
    });

    it('should show alert message', () => {
      inputFile.wrapperElement.dispatchEvent(new Event('change'));

      expect(store.state.alert).toEqual({
        text: errorMessage,
        type: 'error',
      });
    });
  });

  describe('when user uploads a file', () => {
    const textFile = new File(['Hello World!'], 'Name of the File.txt', {
      type: 'text/plain',
    });

    let inputFile;

    beforeEach(() => {
      inputFile = wrapper.find({ ref: 'browser-file-input' });

      vi.spyOn(inputFile.wrapperElement, 'files', 'get').mockReturnValue([
        textFile,
      ]);
    });

    it('should call addItem method', () => {
      inputFile.wrapperElement.dispatchEvent(new Event('change'));

      expect(files.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          created_file_name: 'Name of the File',
          extension_file: 'txt',
          file: 'Name of the File.txt',
          file_name: 'Name of the File.txt',
          progress: 0,
          status: 'uploading',
        }),
      );
    });

    it('should call create file API', () => {
      inputFile.wrapperElement.dispatchEvent(new Event('change'));

      expect(createRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          contentBaseUuid: '1234',
          file: textFile,
          extension_file: 'txt',
        }),
      );
    });

    describe('when an error occurs on create file API', () => {
      it('should change the status of the file to fail-upload', async () => {
        createRequest.mockRejectedValue({});

        await inputFile.wrapperElement.dispatchEvent(new Event('change'));
        await wrapper.vm.$nextTick();

        expect(files.addItem).toHaveBeenCalledWith(
          expect.objectContaining({
            created_file_name: 'Name of the File',
            extension_file: 'txt',
            file: 'Name of the File.txt',
            file_name: 'Name of the File.txt',
            status: 'fail-upload',
          }),
        );
      });
    });
  });

  describe('when the user wants to remove a file', () => {
    let listComponent;

    beforeEach(() => {
      listComponent = wrapper.findComponent({ name: 'ContentList' });

      listComponent.vm.$emit('remove', generateFiles().data[1]);
    });

    it('shows modal delete file', async () => {
      const modalRemoveFile = wrapper.find('[data-test="modal-remove-file"]');

      expect(modalRemoveFile.exists()).toBeTruthy();
    });

    describe('when user confirms', () => {
      it('should request to remove the file', async () => {
        const buttonRemove = wrapper.find('[data-test="button-remove"]');

        await buttonRemove.trigger('click');

        expect(deleteRequest).toHaveBeenCalledWith({
          contentBaseUuid: '1234',
          fileUuid: '2',
        });
      });
    });
  });
});
