import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';

import MessageInput from '../MessageInput.vue';

const defaultProps = {
  placeholder: 'Type a message',
  modelValue: '',
};

const elements = {
  messageInputLeftButton: '[data-test="message-input-left-button"]',
  contentItemActions: '[data-test="content-item-actions"]',
  fileInput: '[data-test="file-input"]',
  textInput: '[data-test="text-input"]',
  audioRecorder: '[data-test="audio-recorder"]',
  rightButton: '[data-test="right-button"]',
};

const store = createStore({
  state() {
    return {
      alert: null,
    };
  },
  mutations: {
    setAlert(state, alert) {
      state.alert = alert;
    },
  },
});

const setup = (props = {}) =>
  shallowMount(MessageInput, {
    props: { ...defaultProps, ...props },
    global: {
      plugins: [store],
    },
  });

describe('MessageInput.vue', () => {
  let wrapper;
  const component = (element) => wrapper.findComponent(elements[element]);
  const element = (element) => wrapper.find(elements[element]);

  beforeEach(() => {
    wrapper = setup();
  });

  describe('Rendering', () => {
    it('should render input and action buttons correctly', () => {
      expect(element('textInput').exists()).toBe(true);
      expect(element('messageInputLeftButton').exists()).toBe(true);
      expect(component('rightButton').exists()).toBe(true);
    });

    it('renders input with correct placeholder', () => {
      const input = element('textInput');
      expect(input.attributes('placeholder')).toBe(defaultProps.placeholder);
    });

    // it('should display mic icon when there is no modelValue and not recording', async () => {
    //   expect(component('rightButton').props('icon')).toBe('mic');

    //   await wrapper.setProps({ modelValue: 'Hello World' });
    //   expect(component('rightButton').props('icon')).toBe('send');
    // });
  });

  // describe('Audio Recording', () => {
  //   it('hides the input when recording audio', async () => {
  //     expect(element('textInput').element.style.display).toBe('');
  //     expect(component('audioRecorder').element.style.display).toBe('none');

  //     wrapper.vm.audioRecorderStatus = 'recording';

  //     await wrapper.vm.$nextTick();

  //     expect(element('textInput').element.style.display).toBe('none');
  //     expect(component('audioRecorder').element.style.display).toBe('');
  //   });

  //   it('converts audio source to File when update:model-value is emitted from audioRecorder', async () => {
  //     global.fetch = vi.fn(() =>
  //       Promise.resolve({
  //         blob: () =>
  //           Promise.resolve(new Blob(['audio data'], { type: 'audio/mpeg3' })),
  //       }),
  //     );

  //     await wrapper.vm.updateAudioModelValue(new Audio());
  //     await wrapper.vm.$nextTick();

  //     const emittedFile = wrapper.emitted('update:model-value')[0][0];

  //     expect(emittedFile).toBeInstanceOf(File);
  //     expect(emittedFile.name).toMatch(/\d+\.mp3$/);
  //     expect(emittedFile.type).toBe('audio/mpeg3');
  //   });
  // });

  describe('Sending Messages', () => {
    it('emits "send" when right button is clicked and conditions are met', async () => {
      wrapper.vm.modelValue = 'Test message';
      await wrapper.vm.$nextTick();

      await element('rightButton').trigger('click');
      expect(wrapper.emitted().send).toBeTruthy();
    });
  });

  describe('File Input Handling', () => {
    it('shows an alert when an unsupported file format is selected', async () => {
      const fileInput = element('fileInput');

      const file = new File([''], 'example.unsupported', {
        type: 'application/unsupported',
      });
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { files: [file] },
        writable: false,
      });

      await fileInput.element.dispatchEvent(event);

      expect(store.state.alert).toEqual({
        type: 'error',
        text: wrapper.vm.$t('content_bases.files.unsupported_format'),
      });
    });
  });

  describe('Geolocation', () => {
    it('emits update:model-value with mock coordinates on geolocation error', async () => {
      wrapper.vm.getGeolocalization();
      await wrapper.vm.$nextTick();

      const emittedGeolocation = wrapper.emitted('update:model-value')[0][0];

      expect(emittedGeolocation).toBe('-9.6695958,-35.7209979');
    });

    it('emits update:model-value with geolocation coordinates on success', async () => {
      const mockPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      };

      global.navigator.geolocation = {
        getCurrentPosition: vi.fn((success) => success(mockPosition)),
      };

      wrapper.vm.getGeolocalization();

      await wrapper.vm.$nextTick();

      const emittedGeolocation = wrapper.emitted('update:model-value')[0][0];

      expect(emittedGeolocation).toBe('37.7749,-122.4194');
    });
  });
});
