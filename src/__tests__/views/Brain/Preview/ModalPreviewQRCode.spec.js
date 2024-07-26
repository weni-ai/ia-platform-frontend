import { mount } from '@vue/test-utils';
import ModalPreviewQRCode from '@/views/Brain/Preview/ModalPreviewQRCode.vue';
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      Auth: {
        connectProjectUuid: 'test2323test',
        token: 'Bearer testToken123',
      },
    };
  },
});

describe('ModalPreviewQRCode', () => {
  let wrapper;

  beforeEach(() => {
    const projectUuid = store.state.Auth.connectProjectUuid;
    const token = store.state.Auth.token.replace('Bearer ', '');
    wrapper = mount(ModalPreviewQRCode, {
      global: {
        plugins: [store],
        mocks: {
          $router: {
            resolve: () => ({
              href: `/brain/preview?project_uuid=${projectUuid}&token=${token}`,
            }),
          },
        },
      },
    });
  });

  test('renders QRCode with correct URL', async () => {
    const expectedURL = `${location.origin}/brain/preview?project_uuid=${store.state.Auth.connectProjectUuid}&token=${store.state.Auth.token.replace('Bearer ', '')}`;

    expect(wrapper.vm.previewFullPageURL).toBe(expectedURL);
    const qrCodeElement = wrapper.find('.modal-preview-qr-code__qr-code');

    expect(qrCodeElement.exists()).toBe(true);
    const modelValue = qrCodeElement.attributes().modelValue;
    expect(modelValue).toBe(expectedURL);
  });

  test('emits "close" event on UnnnicModal close', async () => {
    await wrapper.findComponent('.modal-preview-qr-code').trigger('close');
    expect(wrapper.emitted().close).toBeTruthy();
  });

  test('renders description text correctly', () => {
    const description = wrapper.text();
    expect(description).toContain(
      wrapper.vm.$t('router.preview.modal_qr_code.description'),
    );
  });

  test('UnnnicModal receives correct props', () => {
    const unnnicModalProps = wrapper
      .findComponent('.modal-preview-qr-code')
      .props();
    expect(unnnicModalProps.scheme).toBe('aux-yellow-500');
    expect(unnnicModalProps.text).toBe(
      wrapper.vm.$t('router.preview.modal_qr_code.title'),
    );
  });

  test('checks for scoped styles', () => {
    const modal = wrapper.find('.modal-preview-qr-code');
    expect(modal.exists()).toBe(true);

    const qrCodeStyle = modal.find('.modal-preview-qr-code__qr-code');
    expect(qrCodeStyle.exists()).toBe(true);
  });
});
