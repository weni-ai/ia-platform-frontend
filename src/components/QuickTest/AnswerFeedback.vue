<template>
  <section
    ref="feedback"
    class="feedback"
  >
    <section class="feedback__thumbs">
      <UnnnicToolTip
        side="top"
        :text="$t('quick_test.feedback.liked')"
        enabled
      >
        <UnnnicIcon
          icon="thumb_up"
          scheme="neutral-cloudy"
          size="sm"
          clickable
          :filled="feedback.value === 'liked'"
          @click.native="
            $emit('update:feedback', { ...feedback, value: 'liked' });
            $nextTick(sendFeedback);
          "
        />
      </UnnnicToolTip>

      <UnnnicToolTip
        side="top"
        :text="$t('quick_test.feedback.disliked')"
        enabled
      >
        <UnnnicIcon
          icon="thumb_down"
          scheme="neutral-cloudy"
          size="sm"
          clickable
          :filled="feedback.value === 'disliked'"
          @click.native="
            $emit('update:feedback', {
              ...feedback,
              value: 'disliked',
              reason: null,
            })
          "
        />
      </UnnnicToolTip>
    </section>

    <section
      v-if="feedback.value === 'disliked' && feedback.reason !== 'close_reason'"
      class="feedback__reason"
      ref="reason-container"
    >
      <header class="feedback__reason__header">
        <UnnnicIntelligenceText
          color="neutral-dark"
          family="secondary"
          weight="bold"
          size="body-gt"
        >
          {{ $t('quick_test.rate_your_answer') }}
        </UnnnicIntelligenceText>

        <UnnnicIcon
          icon="close"
          size="sm"
          scheme="neutral-cloudy"
          clickable
          @click="
            $emit('update:feedback', { ...feedback, reason: 'close_reason' });
            $nextTick(sendFeedback);
          "
        />
      </header>

      <section class="feedback__reason__options">
        <UnnnicRadio
          v-for="reason in reasons"
          :key="reason.value"
          :value="reason.value"
          :globalValue="feedback.reason"
          size="md"
          @change="
            $emit('update:feedback', { ...feedback, reason: reason.value })
          "
        >
          {{ reason.text }}
        </UnnnicRadio>
      </section>

      <UnnnicButton
        class="feedback__reason__button-send-feedback"
        type="tertiary"
        size="small"
        :loading="sendingFeedback"
        :disabled="feedback.reason === null"
        @click="sendFeedback"
      >
        {{ $t('quick_test.send_feedback') }}
      </UnnnicButton>
    </section>
  </section>
</template>

<script>
import nexusaiAPI from '../../api/nexusaiAPI';

export default {
  props: {
    feedback: Object,
    contentBaseUuid: String,
    questionUuid: String,
  },

  data() {
    return {
      scrollToBottom: null,

      sendingFeedback: false,
    };
  },

  computed: {
    reasons() {
      return [
        {
          value: 0,
          text: this.$t('quick_test.completely_off_topic'),
        },
        {
          value: 1,
          text: this.$t('quick_test.partially_correct_went_off_base'),
        },
        {
          value: 2,
          text: this.$t(
            'quick_test.partially_correct_provided_information_on_a_different_topic',
          ),
        },
        {
          value: 3,
          text: this.$t(
            'quick_test.no_answer_but_the_information_is_in_database',
          ),
        },
      ];
    },
  },

  watch: {
    feedback: {
      deep: true,
      immediate: true,

      handler() {
        if (
          this.feedback.value !== 'disliked' &&
          feedback.reason !== 'close_reason'
        ) {
          return;
        }

        this.$nextTick(() => {
          const reasonContainer = this.$refs['reason-container'];

          reasonContainer.style.height = reasonContainer.offsetHeight + 'px';
          reasonContainer.style.width = reasonContainer.offsetWidth + 'px';

          reasonContainer.classList.add('open');

          this.scrollToBottom = setInterval(() => {
            this.$refs.feedback.scrollIntoView();
          }, 0);

          setTimeout(() => {
            clearInterval(this.scrollToBottom);
          }, 200);
        });
      },
    },
  },

  methods: {
    sendFeedback() {
      this.sendingFeedback = true;

      nexusaiAPI.question.feedback
        .create({
          contentBaseUuid: this.contentBaseUuid,
          questionUuid: this.questionUuid,
          value: this.feedback.value,
          feedback:
            this.feedback.value === 'liked' ||
            this.feedback.reason === 'close_reason'
              ? null
              : this.feedback.reason,
        })
        .then(() => {
          this.$store.state.alert = {
            type: 'default',
            text: this.$t('quick_test.feedback_sent'),
          };
        })
        .finally(() => {
          this.sendingFeedback = false;

          this.$emit('update:feedback', {
            ...this.feedback,
            reason: 'close_reason',
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.feedback {
  &__thumbs {
    display: flex;
    margin-top: $unnnic-spacing-ant;
    column-gap: $unnnic-spacing-ant;
    user-select: none;
  }

  &__reason {
    margin-top: $unnnic-spacing-ant;

    border-radius: $unnnic-border-radius-sm;

    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    padding: $unnnic-spacing-ant;

    box-sizing: border-box;

    overflow: hidden;

    /deep/ .label {
      color: $unnnic-color-neutral-dark;
    }

    &.open {
      animation: open 0.2s;

      @keyframes open {
        0% {
          margin-top: 0;
          width: 0;
          height: 0;
          padding: 0;
          opacity: 0;
        }

        50% {
          opacity: 0.5;
        }

        100% {
          opacity: 1;
        }
      }
    }

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__options {
      margin-top: $unnnic-spacing-xs;
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-nano;
    }

    &__button-send-feedback {
      width: 100%;
      margin-top: $unnnic-spacing-xs;
    }
  }
}
</style>
