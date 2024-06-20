<template>
  <div id="app">
    <!-- <news-modal /> -->
    <RouterView />
    <!-- <tutorial-modal
      :open="activeMenu"/> -->

    <ModalDependingOnFlowsLength />

    <UnnnicAlert
      v-if="$store.state.alert"
      :key="$store.state.alert.text"
      v-bind="$store.state.alert"
      @close="$store.state.alert = null"
    ></UnnnicAlert>

    <ModalWarn
      v-if="$store.state.modalWarn"
      :showModal="!!$store.state.modalWarn"
      :title="$store.state.modalWarn.title"
      :description="$store.state.modalWarn.description"
      :closeText="$store.state.modalWarn.closeText"
      :actionText="$store.state.modalWarn.actionText"
      :loading="$store.state.modalWarn.loading"
      :message="$store.state.modalWarn.message"
      @close="$store.state.modalWarn = null"
      @action="$store.state.modalWarn.action"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import hotjar from '@/utils/plugins/hotjar';
import I18n from '@/utils/plugins/i18n';
import store from './store';
import ModalDependingOnFlowsLength from './components/ModalDependingOnFlowsLength.vue';
import ModalWarn from './components/ModalWarn.vue';

export default {
  components: {
    I18n,
    ModalDependingOnFlowsLength,
    ModalWarn,
  },

  name: 'App',

  data() {
    return {
      connectBaseURL: '',
    };
  },
  computed: {
    ...mapGetters(['activeMenu']),
    dynamicTitle() {
      if (I18n.locale === 'pt-BR') {
        return 'Weni Inteligência Artificial';
      }
      if (I18n.locale === 'en-US') {
        return 'Weni Artificial Intelligence';
      }
      return 'Weni Inteligencia Artificial';
    },
  },
  created() {
    window.addEventListener('message', (event) => {
      const prefix = 'connect:';
      const content = String(event.data);
      if (content.startsWith(prefix)) {
        const eventMessage = content.substr(prefix.length);
        const type = eventMessage.substr(0, eventMessage.indexOf(':'));
        const data = {
          ...JSON.parse(eventMessage.substr(type.length + 1)),
          origin: event.origin,
        };
        if (type === 'updateExternalToken') {
          store.dispatch('externalLogin', { token: data.data.token });
        }
      }
    });
  },
  mounted() {
    document.title = this.dynamicTitle;
    hotjar.addHotjar();
    this.safariDetected();
    this.profileInfo();
    window.parent.postMessage(
      {
        event: 'getConnectBaseURL',
      },
      '*',
    );

    window.addEventListener('message', (event) => {
      const eventName = event.data && event.data.event;

      if (eventName === 'setConnectBaseURL') {
        this.connectBaseURL = event.data.connectBaseURL;
        this.translateAllLinks();
      }
    });
  },
  methods: {
    ...mapActions(['getMyProfileInfo', 'setUserName']),
    async profileInfo() {
      const { data } = await this.getMyProfileInfo();
      if (data) {
        this.$set(this.$store.state.User, 'me', data);

        this.setUserName(data.name);
        if (data.language?.includes?.('-')) {
          const [first, second] = data.language.split('-');
          const secondUpperCase = second.toUpperCase();
          const languageResult = `${first}-${secondUpperCase}`;
          this.$i18n.locale = languageResult;
        } else {
          this.$i18n.locale = data.language || 'en-US';
        }
      }
      return true;
    },
    safariDetected() {
      if (
        navigator.userAgent.indexOf('Safari') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1
      ) {
        this.$router.push('/safariAlert/');
      }
    },
    translateAllLinks() {
      if (!this.connectBaseURL) {
        return;
      }

      const url = new URL(this.connectBaseURL);
      const debug = url.host && url.host.includes('develop');

      document.querySelectorAll('a[href]').forEach((link) => {
        const internalHref =
          link.getAttribute('internal-href') || link.getAttribute('href');

        if (
          ['http://', 'https://'].some((initial) =>
            internalHref.startsWith(initial),
          )
        ) {
          return;
        }

        const dashHref = this.connectBaseURL + internalHref;

        if (link.translateLinkConnect) {
          if (link.getAttribute('href') === dashHref) {
            return;
          }

          link.removeEventListener('click', link.translateLinkConnect);
        }

        link.setAttribute('internal-href', internalHref);
        link.setAttribute('href', dashHref);

        const randomId = Math.floor(Math.random() * 100);

        link.addEventListener(
          'click',
          (link.translateLinkConnect = () => {
            if (debug) {
              console.log(`TranslateLinkConnectId ${randomId}`);
            }

            link.setAttribute('href', internalHref);

            setTimeout(() => {
              link.setAttribute('href', dashHref);
            }, 0);
          }),
        );
      });
    },
  },
  updated() {
    this.translateAllLinks();
  },
};
</script>

<style lang="scss">
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

body {
  background-color: $unnnic-color-background-snow;
  min-height: 100vh;
  margin: 0;
}

p {
  margin: 0;
}

a {
  text-decoration: none;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: $unnnic-color-neutral-soft;
}

::-webkit-scrollbar-thumb {
  background: $unnnic-color-neutral-clean;
  border-radius: $unnnic-border-radius-pill;
}

:not(.quick-test, .notices) {
  pointer-events: visible;
}
.container-padding {
  padding: 0 8px;
}

.clickable {
  cursor: pointer;
  outline: none;
}

.icon-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none !important;
  > * {
    pointer-events: none !important;
  }
}

@keyframes iconSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.icon-spin {
  animation-name: iconSpin;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.item {
  margin-bottom: 1rem;
}

.item-1-2 {
  margin-bottom: 0.5rem;
}

.mh-200 {
  max-height: 200px;
}

.align-items-center {
  align-items: center;
}
</style>
