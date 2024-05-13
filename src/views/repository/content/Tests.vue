<template>
  <div class="quick-test">
    <div class="messages">
      <div
        class="messages__content"
        ref="messages"
      >
        <div
          v-if="!messages.length"
          class="messages__empty-text"
        >
          {{
            usePreview
              ? $t('router.preview.placeholder')
              : $t('quick_test.send_a_message')
          }}
        </div>

        <section
          v-for="(message, index) in messages"
          :key="index"
          :class="`messages__${message.type}`"
        >
          <div
            v-if="message.status === 'loading'"
            class="dot-typing"
          ></div>

          <UnnnicIntelligenceText
            v-else-if="message.type === 'change'"
            color="neutral-cloudy"
            family="secondary"
            weight="regular"
            size="body-md"
          >
            {{
              $t('router.preview.field_changed_to_value', {
                field: handleLetter($t(message.name)),
                value: message.value,
              })
            }}
          </UnnnicIntelligenceText>

          <template v-else>
            <Markdown
              :class="`messages__${message.type}__content`"
              :content="message.text"
            />

            <AnswerFeedback
              v-if="message.type === 'answer' && message.question_uuid"
              :feedback.sync="message.feedback"
              :contentBaseUuid="contentBaseUuid"
              :questionUuid="message.question_uuid"
            />

            <section
              v-if="shouldShowQuickReplies(message)"
              class="quick-replies"
            >
              <UnnnicButton
                v-for="(reply, index) in preview.quickReplies"
                :key="`reply-${index}`"
                type="secondary"
                size="small"
                class="quick-replies__button"
                @click="sendReply(reply)"
              >
                {{ reply }}
              </UnnnicButton>
            </section>
          </template>
        </section>
      </div>
    </div>

    <div class="write-message">
      <UnnnicInput
        v-model="message"
        class="write-message__input"
        size="md"
        :placeholder="$t('webapp.home.bases.tests_placeholder')"
        @keypress.enter="sendMessage"
      />

      <UnnnicButton
        size="large"
        iconCenter="send-email-3-1"
        type="alternative"
        class="button-send-message"
        @click="sendMessage"
      />
    </div>
  </div>
</template>

<script>
import nexusaiAPI from '../../../api/nexusaiAPI';
import { get } from 'lodash';
import AnswerFeedback from '../../../components/QuickTest/AnswerFeedback';
import FlowPreview from '../../../utils/FlowPreview';
import { lowerFirstCapitalLetter } from '../../../utils/handleLetters';
import Markdown from '../../../components/Markdown.vue';

export default {
  name: 'RepositoryContentTests',

  props: {
    contentBaseUuid: String,
    contentBaseLanguage: String,
    usePreview: Boolean,
  },

  components: {
    Markdown,
    AnswerFeedback,
  },

  mixins: [FlowPreview],

  data() {
    return {
      message: '',

      messages: [],
    };
  },

  computed: {
    language() {
      const language = this.contentBaseLanguage;

      if (!language) {
        return null;
      }

      return language.indexOf('-') === -1
        ? language
        : language.slice(0, language.indexOf('-')) +
            language.slice(language.indexOf('-')).toUpperCase();
    },
  },

  mounted() {
    if (this.usePreview) {
      this.previewInit();

      window.brainPreviewAddMessage = (message) => {
        this.messages.push(message);
      };
    }
  },

  watch: {
    'preview.session.status'(value, previous) {
      if (previous === 'waiting' && value === 'completed') {
        this.messages.push({
          type: 'flowsend',
          name: '',
          question_uuid: null,
          feedback: {
            value: null,
            reason: null,
          },
        });
      }
    },
  },

  methods: {
    shouldShowQuickReplies(message) {
      return (
        this.usePreview &&
        message.type === 'answer' &&
        this.isTheLastMessage(message) &&
        this.preview.quickReplies?.length
      );
    },

    handleLetter(message) {
      return lowerFirstCapitalLetter(message);
    },

    isTheLastMessage(message) {
      return (
        this.messages.filter(({ type }) => ['answer', 'question']).at(-1) ===
        message
      );
    },

    treatEvents(replace, events) {
      this.messages.splice(
        this.messages.indexOf(replace),
        1,
        ...events
          .filter(({ type, text }) => type === 'msg_created')
          .map(({ type, msg, text }) => {
            if (type === 'msg_created') {
              return {
                type: 'answer',
                text: msg.text,
                status: 'loaded',
                question_uuid: null,
                feedback: {
                  value: null,
                  reason: null,
                },
              };
            }
          }),
      );

      if (this.preview.session?.status === 'completed') {
        this.messages.push({
          type: 'flowsend',
          name: '',
          question_uuid: null,
          feedback: {
            value: null,
            reason: null,
          },
        });
      }

      this.scrollToLastMessage();
    },

    async flowResume(answer, { text }) {
      const {
        data: { events },
      } = await this.previewResume(text);

      this.treatEvents(answer, events);
    },

    async flowStart(answer, flow) {
      const {
        data: { events },
      } = await this.previewStart({
        flowName: flow.name,
        flowUuid: flow.uuid,
      });

      this.treatEvents(answer, events);
    },

    sendReply(message) {
      this.message = message;

      this.sendMessage();
    },

    sendMessage() {
      const message = this.message.trim();

      if (!message) {
        return;
      }

      this.messages.push({
        type: 'question',
        text: message,
      });

      this.message = '';

      this.scrollToLastMessage();

      setTimeout(() => {
        const answer = {
          type: 'answer',
          text: '',
          status: 'loading',
          question_uuid: null,
          feedback: {
            value: null,
            reason: null,
          },
        };

        this.messages.push(answer);

        this.scrollToLastMessage();

        if (this.usePreview) {
          if (this.preview.session?.status === 'waiting') {
            this.flowResume(answer, { text: message });
            return;
          }

          nexusaiAPI.router.preview
            .create({
              projectUuid: this.$store.state.Auth.connectProjectUuid,
              text: message,
              contact_urn: this.preview.contact.urns[0],
            })
            .then(({ data }) => {
              if (data.type === 'broadcast') {
                answer.status = 'loaded';
                answer.text = get(
                  data,
                  'message',
                  this.$t('quick_test.unable_to_find_an_answer', this.language),
                );

                this.scrollToLastMessage();
              } else if (data.type === 'flowstart') {
                this.messages.splice(this.messages.indexOf(answer), 0, {
                  type: 'flowstart',
                  name: data.name,
                  question_uuid: null,
                  feedback: {
                    value: null,
                    reason: null,
                  },
                });

                this.flowStart(answer, { name: data.name, uuid: data.uuid });
              }
            });
        } else {
          nexusaiAPI.question
            .create({
              contentBaseUuid: this.contentBaseUuid,
              text: message,
              language: (this.language || '').toLowerCase(),
            })
            .then(({ data }) => {
              answer.status = 'loaded';
              answer.question_uuid = get(data, 'question_uuid', null);
              answer.text = get(
                data,
                'answers.0.text',
                this.$t('quick_test.unable_to_find_an_answer', this.language),
              );

              this.scrollToLastMessage();
            })
            .catch(() => {
              this.messages.splice(this.messages.indexOf(answer), 1);
            });
        }
      }, 400);
    },

    scrollToLastMessage() {
      this.$nextTick(() => {
        this.$refs.messages.lastChild.scrollIntoView({ behavior: 'smooth' });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.quick-replies {
  margin-top: $unnnic-spacing-sm;
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-nano;

  &__button {
    color: $unnnic-color-weni-600;
  }
}

.button-send-message :deep(svg .primary) {
  fill: $unnnic-color-weni-600;
}

.dot-typing {
  $dot-size: 0.3125 * $unnnic-font-size;
  $dot-color: $unnnic-color-neutral-clean;
  $dot-min-height: -$dot-size;
  $dot-max-height: (
      -$unnnic-font-size-body-md - $unnnic-line-height-md + $dot-size
    ) * 0.65;

  width: $dot-size;
  height: $dot-size;
  margin: 0 $dot-size * 1.75;
  margin-top: $unnnic-font-size-body-md + $unnnic-line-height-md - $dot-size;
  // margin-bottom: ($unnnic-font-size-body-md + $unnnic-line-height-md) * 0.25;
  border-radius: math.div($dot-size, 2);
  background-color: transparent;
  box-shadow: -$dot-size * 1.75 ($dot-min-height) $dot-color,
    0 ($dot-min-height) $dot-color,
    $dot-size * 1.75 ($dot-min-height) $dot-color;
  animation: dot-typing 1s infinite ease;

  @keyframes dot-typing {
    0% {
      box-shadow: -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }

    20% {
      box-shadow: -$dot-size * 1.75 ($dot-max-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }

    40% {
      box-shadow: -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-max-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }

    60% {
      box-shadow: -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-max-height) $dot-color;
    }

    80% {
      box-shadow: -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }
  }
}

.quick-test {
  flex: 1;
  display: flex;
  flex-direction: column;

  row-gap: $unnnic-spacing-xs;

  .messages {
    flex: 1;

    &__content {
      height: 0;
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-xs;
    }

    $scroll-size: $unnnic-inline-nano;

    overflow: overlay;

    margin-right: -$unnnic-spacing-xs;
    padding-right: $unnnic-spacing-xs;

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

    &__empty-text {
      color: $unnnic-color-neutral-clean;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }

    &__question,
    &__answer {
      max-width: 75%;
      color: $unnnic-color-neutral-dark;

      &__content {
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        font-weight: $unnnic-font-weight-regular;
      }

      border-radius: $unnnic-border-radius-md;
      padding: $unnnic-spacing-ant;

      ::v-deep {
        p {
          margin: 0;
        }
      }
    }

    &__question {
      align-self: self-end;
      background-color: $unnnic-color-weni-200;
      border-bottom-right-radius: $unnnic-border-radius-sm;
      margin-left: 1.875 * $unnnic-font-size;
    }

    &__answer {
      align-self: self-start;
      background-color: $unnnic-color-neutral-light;
      border-bottom-left-radius: $unnnic-border-radius-sm;
      margin-right: 1.875 * $unnnic-font-size;
    }

    &__change {
      text-align: center;

      + .messages__change {
        margin-top: -$unnnic-spacing-nano;
      }
    }
  }

  .write-message {
    display: flex;
    column-gap: $unnnic-spacing-nano;

    &__input {
      width: 100%;
    }
  }
}

#webchat {
  height: 100%;

  ::v-deep {
    & > div,
    & > div > div.push-widget-container {
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
      animation: none;
    }

    .push-sender {
      padding: 0;
      margin-top: $unnnic-spacing-xs;
      display: flex;
      column-gap: $unnnic-spacing-nano;
      height: 2.875 * $unnnic-font-size;

      .push-new-message {
        background-color: $unnnic-color-neutral-snow;
        padding: ($unnnic-spacing-ant - $unnnic-border-width-thinner)
          $unnnic-spacing-sm;
        border: $unnnic-border-width-thinner solid
          $unnnic-color-neutral-cleanest;
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
        background-image: url('@/assets/imgs/send.svg');
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

:deep(.icon-right) {
  transform: translateY(100%);
}

.error-text {
  font-family: $unnnic-font-family-secondary;
}

:deep(.icon-right) {
  transform: translateY(100%);
}

:deep(.rpstr-vw-bs__wrapper__content) {
  margin: 0;
}

hr {
  margin: $unnnic-spacing-ant 0 $unnnic-spacing-sm;
}
</style>
