<template>
  <div :style="{ flex: 1 }">
    <div id="webchat"></div>

    <div v-if="false" id="webchat">
      <div>
        <div class="push-widget-container push-chat-open">
          <div class="push-conversation-container">
            <div class="push-header-and-loading">
              <div
                class="push-header push-with-subtitle push-without-header-avatar"
              >
                <div class="push-header-buttons">
                  <button class="push-close-button">a</button>
                </div>
                <div class="push-title-and-subtitle">
                  <h4 class="push-title undefined">Title</h4>
                  <span class="push-subtitle undefined">Subtitle</span>
                </div>
              </div>
            </div>
            <div
              id="push-messages"
              class="push-messages-container"
              tabindex="0"
            >
              <input
                class="push-dropzone"
                accept=".jpeg,.jpg,.png,.svg,.pdf,.docx,.xls,.xlsx,.mp3,.wav,.mp4,.mov"
                multiple=""
                type="file"
                autocomplete="off"
                tabindex="-1"
                style="display: none"
              />
              <section>
                <!-- -->
                <div class="push-group-message push-from-client">
                  <div class="push-message undefined push-from-client">
                    <div class="push-client" style="">
                      <div class="push-message-text">qual será o tema?</div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-response">
                  <div class="push-message undefined">
                    <div class="push-response" style="">
                      <div class="push-message-text">
                        <div class="push-markdown">
                          <h4><strong>Resposta</strong></h4>
                          <h2>
                            "O tema da palestra será sobre o dia-a-dia em
                            Produto e Tecnologia na Weni, como é a rotina de
                            trabalho dentro da empresa."
                          </h2>
                          <p><strong>Confiança:</strong> %</p>
                          <p>&nbsp;</p>
                          <p><strong>Nenhuma outra resposta</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-client">
                  <div class="push-message undefined push-from-client">
                    <div class="push-client" style="">
                      <div class="push-message-text">e o objetivo?</div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-response">
                  <div class="push-message undefined">
                    <div class="push-response" style="">
                      <div class="push-message-text">
                        <div class="push-markdown">
                          <h4><strong>Resposta</strong></h4>
                          <h2>"Desculpe, não possuo essa informação."</h2>
                          <p><strong>Confiança:</strong> %</p>
                          <p>&nbsp;</p>
                          <p><strong>Nenhuma outra resposta</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-client">
                  <div class="push-message undefined push-from-client">
                    <div class="push-client" style="">
                      <div class="push-message-text">
                        qual será o objetivo da palestra?
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-response">
                  <div class="push-message undefined">
                    <div class="push-response" style="">
                      <div class="push-message-text">
                        <div class="push-markdown">
                          <h4><strong>Resposta</strong></h4>
                          <h2>
                            "O objetivo da palestra com o tema "O dia-a-dia em
                            Produto e Tecnologia na Weni" é mostrar como
                            funciona a rotina de trabalho dentro da Weni,
                            focando em metodologias, ritos e comportamentos que
                            seguimos no dia-a-dia da construção de novos
                            produtos e tecnologia."
                          </h2>
                          <p><strong>Confiança:</strong> %</p>
                          <p>&nbsp;</p>
                          <p><strong>Nenhuma outra resposta</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-client">
                  <div class="push-message undefined push-from-client">
                    <div class="push-client" style="">
                      <div class="push-message-text">qual será o horário?</div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-response">
                  <div class="push-message undefined">
                    <div class="push-response" style="">
                      <div class="push-message-text">
                        <div class="push-markdown">
                          <h4><strong>Resposta</strong></h4>
                          <h2>
                            "O horário da palestra com o tema "O dia-a-dia em
                            Produto e Tecnologia na Weni" será às 11:30h."
                          </h2>
                          <p><strong>Confiança:</strong> %</p>
                          <p>&nbsp;</p>
                          <p><strong>Nenhuma outra resposta</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-client">
                  <div class="push-message undefined push-from-client">
                    <div class="push-client" style="">
                      <div class="push-message-text">
                        o horário será pela manhã ou a noite?
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-response">
                  <div class="push-message undefined">
                    <div class="push-response" style="">
                      <div class="push-message-text">
                        <div class="push-markdown">
                          <h4><strong>Resposta</strong></h4>
                          <h2>"Desculpe, não possuo essa informação."</h2>
                          <p><strong>Confiança:</strong> %</p>
                          <p>&nbsp;</p>
                          <p><strong>Nenhuma outra resposta</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-client">
                  <div class="push-message undefined push-from-client">
                    <div class="push-client" style="">
                      <div class="push-message-text">quem é John Cordeiro?</div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-response">
                  <div class="push-message undefined">
                    <div class="push-response" style="">
                      <div class="push-message-text">
                        <div class="push-markdown">
                          <h4><strong>Resposta</strong></h4>
                          <h2>
                            "John Cordeiro é o diretor de produto e tecnologia
                            da Weni, e será o palestrante da palestra sobre o
                            dia-a-dia em Produto e Tecnologia na Weni."
                          </h2>
                          <p><strong>Confiança:</strong> %</p>
                          <p>&nbsp;</p>
                          <p><strong>Nenhuma outra resposta</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-client">
                  <div class="push-message undefined push-from-client">
                    <div class="push-client" style="">
                      <div class="push-message-text">
                        obrigado pelas informações
                      </div>
                    </div>
                  </div>
                </div>
                <div class="push-group-message push-from-response">
                  <div class="push-message undefined">
                    <div class="push-response" style="">
                      <div class="push-message-text">
                        <div class="push-markdown">
                          <h4><strong>Resposta</strong></h4>
                          <h2>"Desculpe, não possuo essa informação."</h2>
                          <p><strong>Confiança:</strong> %</p>
                          <p>&nbsp;</p>
                          <p><strong>Nenhuma outra resposta</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div>
              <div></div>
              <form class="push-sender">
                <label for="push-file-upload"
                  ><input
                    multiple=""
                    id="push-file-upload"
                    type="file"
                    accept=".jpeg,.jpg,.png,.svg,.pdf,.docx,.xls,.xlsx,.mp3,.wav,.mp4,.mov"
                    style="display: none"
                  />a</label
                ><textarea
                  type="text"
                  class="push-new-message"
                  name="message"
                  placeholder="Mensagem"
                  autocomplete="off"
                ></textarea
                ><button type="submit" class="push-send">f</button>
              </form>
            </div>
            <a
              href="https://weni.ai"
              class="push-poweredby-container"
              target="_blank"
              >Powered by Weni Platform</a
            >
          </div>
          <button type="button" class="push-launcher push-hide-sm">s</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RepositoryContentTests',

  props: {
    config: String,
  },

  data() {
    return {
      message: '',
    };
  },

  methods: {
    sendMessage() {
      window.WebChat.send(this.message);

      this.message = '';
    },
  },

  beforeMount() {
    window.WebChat = null;
  },

  mounted() {
    const message = this.config;

    if (window.WebChat) {
      window.WebChat.send(message);
    } else {
      const script = document.createElement('script');
      const flowsUUID = runtimeVariables.get('VUE_APP_QA_FLOW_CHANNEL');
      script.setAttribute(
        'src',
        'https://storage.googleapis.com/push-webchat/wwc-latest.js',
      );
      script.setAttribute('id', 'removeScript');
      document.body.appendChild(script);
      script.addEventListener('load', () => {
        window.WebChat.default.init({
          selector: '#webchat',
          initPayload: message,
          channelUuid: flowsUUID,
          host: 'https://new.push.al',
          socketUrl: 'https://websocket.weni.ai',
          sessionId: `${
            Math.floor(Math.random() * 1e10).toString(36)
            + new Date().getTime().toString(36)
          }`,
          title: 'Title',
          subtitle: 'Subtitle',
          startFullScreen: false,
          inputTextFieldHint: this.$t('webapp.home.bases.tests_placeholder'),
          customizeWidget: {
            userMessageBubbleColor: '#edfffe',
            userMessageTextColor: '#272B33',
            fullScreenBotMessageBubbleColor: '$unnnic-color-neutral-light',
            botMessageBubbleColor: '#272B33',
            inputBackgroundColor: '#FFFFFF',
            inputFontColor: '#4E5666',
            inputPlaceholderColor: '#67738B',
          },
        });

        window.WebChat.open();

        setTimeout(() => window.WebChat.send(message), 1000);
      });
    }

    return true;
  },

  beforeDestroy() {
    const script = document.querySelector('#removeScript');

    if (script) {
      script.parentNode.removeChild(script);
    }
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

#webchat {
  height: 100%;

  ::v-deep {
    & > div, & > div > div.push-widget-container {
      height: 100%;
    }

    .push-widget-container {
      position: unset;
      width: 100%;
      height: 430px;
      box-shadow: none;
      padding: 0;

      @media (min-width: 1440px) {
        height: 500px;
      }

      section:has(.push-group-message) {
        height: 0;
      }
    }
    .push-poweredby-container {
      display: none;
    }
    .push-launcher {
      display: none;
    }
    .push-header.push-with-subtitle {
      display: none;
    }
    .push-conversation-container {
      box-shadow: none;
    }

    .push-conversation-container {
      overflow: visible;
    }

    .push-sender {
      padding: 0;
      margin-top: $unnnic-spacing-xs;
      display: flex;
      column-gap: $unnnic-spacing-nano;

      .push-new-message {
        background-color: $unnnic-color-neutral-snow;
        padding: ($unnnic-spacing-ant - $unnnic-border-width-thinner) $unnnic-spacing-sm;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
        border-radius: $unnnic-border-radius-sm;
        flex: 1;

        color: $unnnic-color-neutral-dark;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-regular;

        height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

        &::placeholder {
          color: $unnnic-color-neutral-cleanest;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
          font-weight: $unnnic-font-weight-regular;
        }

        &:focus {
          border-color: $unnnic-color-neutral-clean;
        }

        $scroll-size: $unnnic-inline-nano;

        &::-webkit-scrollbar {
          width: $scroll-size;
        }

        &::-webkit-scrollbar-thumb {
          background: $unnnic-color-neutral-clean;
          border-radius: $unnnic-border-radius-pill;
        }

        &::-webkit-scrollbar-track {
          background: $unnnic-color-neutral-soft;
          border-radius: $unnnic-border-radius-pill;
        }
      }

      .push-send {
        background-color: $unnnic-color-weni-50;
        border: 0;
        width: 2.875 * $unnnic-font-size;
        height: 2.875 * $unnnic-font-size;
        padding: 0;
        display: block;

        &:hover:enabled {
          background-color: $unnnic-color-weni-100;
          border: 0;
        }

        &:active:enabled {
          background-color: $unnnic-color-weni-200;
          color: $unnnic-color-weni-900;
        }
      }
    }

    .push-messages-container {
      overflow-y: auto;

      $scroll-size: $unnnic-inline-nano;

      padding: 0;
      padding-right: $unnnic-inline-nano + $scroll-size;
      margin-right: -($unnnic-inline-nano + $scroll-size);

      &::-webkit-scrollbar {
        width: $scroll-size;
      }

      &::-webkit-scrollbar-thumb {
        background: $unnnic-color-neutral-clean;
        border-radius: $unnnic-border-radius-pill;
      }

      &::-webkit-scrollbar-track {
        background: $unnnic-color-neutral-soft;
        border-radius: $unnnic-border-radius-pill;
      }
    }

    .push-group-message + .push-group-message {
      margin-block-start: $unnnic-spacing-xs;
    }

    .push-message {
      margin: 0;
    }

    .push-response {
      border-radius: $unnnic-border-radius-md $unnnic-border-radius-md
        $unnnic-border-radius-md $unnnic-border-radius-sm;
      background-color: $unnnic-color-neutral-light;
    }

    .push-client {
      border-radius: $unnnic-border-radius-md $unnnic-border-radius-md
        $unnnic-border-radius-sm $unnnic-border-radius-md;
      background-color: $unnnic-color-weni-100;
    }

    .push-response,
    .push-client {
      padding: $unnnic-spacing-xs;
      max-width: 80%;

      .push-message-text,
      .push-markdown h4,
      .push-markdown h4,
      .push-markdown h2,
      .push-markdown p {
        color: $unnnic-color-neutral-dark;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-regular;

        margin: 0;

        strong {
          color: $unnnic-color-neutral-dark;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-md;
          line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
          font-weight: $unnnic-font-weight-bold;
        }
      }
    }

    .push-markdown {
      ul {
        list-style-type: disc;
        padding-inline-start: 40px;
      }
    }

    label[for='push-file-upload'] {
      display: none;
    }
    .push-send {
      border: 1px solid $unnnic-color-neutral-cleanest;
      padding: $unnnic-spacing-ant $unnnic-spacing-sm;
      border-radius: $unnnic-border-radius-sm;
      width: 12px;
      img {
        display: none;
      }
      &:after {
        background-image: url('~@/assets/imgs/send.svg');
        background-repeat: no-repeat;
        background-position: center;
        padding: 0 $unnnic-spacing-xs;
        content: ' ';
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-lg;
        color: #4e5666;
      }
      &:hover {
        border: 1px solid $unnnic-color-neutral-clean;
      }
    }
  }
}

/deep/ .icon-right {
  transform: translateY(100%);
}

.error-text {
  font-family: $unnnic-font-family-secondary;
}

/deep/ .icon-right {
  transform: translateY(100%);
}

/deep/ .rpstr-vw-bs__wrapper__content {
  margin: 0;
}

hr {
  margin: $unnnic-spacing-ant 0 $unnnic-spacing-sm;
}
</style>
