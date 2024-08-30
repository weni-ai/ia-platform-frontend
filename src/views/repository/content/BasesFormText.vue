<template>
  <UnnnicSkeletonLoading
    v-if="item.status === 'loading'"
    tag="div"
    height="100%"
    class="repository-base-edit__wrapper__card-content"
  />

  <section
    v-else
    :class="[
      'repository-base-edit__wrapper__card',
      'repository-base-edit__wrapper__card-content',
    ]"
  >
    <header class="repository-base-edit__wrapper__card-content__header">
      {{ $t('content_bases.write_content') }}

      <UnnnicButton
        v-if="!dontShowSaveButton"
        :loading="item.status === 'saving'"
        size="small"
        class="repository-base-edit__wrapper__card-content__header__save-button"
        :disabled="!modelValue.trim() || modelValue === item.oldValue"
        data-test="save-button"
        @click="saveText"
      >
        {{ $t('webapp.settings.save') }}
      </UnnnicButton>
    </header>

    <textarea
      id="textId"
      :value="modelValue"
      name=""
      cols="30"
      rows="10"
      class="repository-base-edit__textarea"
      :class="{
        'repository-base-edit__textarea--button-on-header': !dontShowSaveButton,
      }"
      :placeholder="$t('content_bases.write_content_placeholder')"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>

    <section
      v-if="!modelValue.trim() && false"
      class="repository-base-edit__wrapper__card-content__info"
    >
      <UnnnicIcon
        icon="help"
        size="sm"
        scheme="neutral-cloudy"
      />

      <p v-html="$t('content_bases.write_content_help')"></p>
    </section>
  </section>
</template>

<script>
import Unnnic from '@weni/unnnic-system';
import nexusaiAPI from '../../../api/nexusaiAPI';
import { get } from 'lodash';

export default {
  props: {
    dontShowSaveButton: Boolean,
    item: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],

  computed: {
    contentBaseUuid() {
      return (
        this.$route.params.contentBaseUuid ||
        this.$store.state.router.contentBaseUuid
      );
    },
  },

  methods: {
    async saveText() {
      try {
        this.item.status = 'saving';

        if (this.item.uuid) {
          const { data: contentBaseTextData } =
            await nexusaiAPI.intelligences.contentBases.texts.edit({
              contentBaseUuid: this.contentBaseUuid,
              contentBaseTextUuid: this.item.uuid,
              text: this.modelValue,
            });

          this.item.oldValue = contentBaseTextData.text;
        } else {
          const { data: contentBaseTextData } =
            await nexusaiAPI.intelligences.contentBases.texts.create({
              contentBaseUuid: this.contentBaseUuid,
              text: this.modelValue,
            });

          this.item.uuid = contentBaseTextData.uuid;
          this.item.oldValue = contentBaseTextData.text;
        }

        this.isAlertOpen = true;
      } catch (error) {
        const errorMessage = get(error, 'response.data.text.0', '');

        if (errorMessage) {
          this.alertError(errorMessage);
        }
      } finally {
        this.item.status = null;
      }
    },

    alertError(title) {
      Unnnic.unnnicCallAlert({
        props: { text: title, scheme: 'feedback-red', icon: 'alert-circle-1' },
        seconds: 5,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.repository-base-edit__wrapper {
  flex: 1;
  display: flex;
  gap: $unnnic-spacing-sm;

  &__left-side {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__card-test-container {
    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;
    border-radius: $unnnic-border-radius-sm;

    width: 24.625 * $unnnic-font-size;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    &__header {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;
      padding-inline: $unnnic-spacing-sm;
      padding-top: $unnnic-spacing-ant;
      padding-bottom: $unnnic-spacing-ant - $unnnic-border-width-thinner;
      margin-inline: -$unnnic-spacing-sm;
      margin-top: -$unnnic-spacing-sm;
      margin-bottom: $unnnic-spacing-sm;
      border-bottom: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-cleanest;
    }
  }

  &__card {
    padding: $unnnic-spacing-sm;

    &__header {
      display: flex;
      align-items: center;
    }
  }

  &__card-content {
    border: 0;
    flex: 1;
    padding: 0;
    position: relative;
    display: flex;
    flex-direction: column;

    &:has(&__info) textarea {
      border-radius: $unnnic-border-radius-sm $unnnic-border-radius-sm 0 0;
    }

    &__header {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-bold;
      background-color: $unnnic-color-background-snow;

      display: flex;
      align-items: center;
      justify-content: space-between;
      position: absolute;
      margin: $unnnic-spacing-sm;
      margin-top: $unnnic-border-width-thinner;
      margin-bottom: 0;
      padding-top: $unnnic-spacing-sm - $unnnic-border-width-thinner;
      padding-bottom: $unnnic-spacing-sm;
      left: 0;
      right: 0;

      &__save-button {
        width: 12.5 * $unnnic-font-size;
      }
    }

    &__info {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;

      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-nano;
      padding-block: $unnnic-spacing-xs
        ($unnnic-spacing-xs - $unnnic-border-width-thinner);
      padding-inline: $unnnic-spacing-sm - $unnnic-border-width-thinner;

      background-color: $unnnic-color-neutral-light;
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
      border-top-width: 0;

      border-radius: 0 0 $unnnic-border-radius-sm $unnnic-border-radius-sm;

      :deep(a) {
        color: inherit;
        text-underline-offset: $unnnic-spacing-stack-nano;
      }
    }
  }
}

.repository-base-edit__textarea {
  resize: none;
  flex: 1;
  padding: $unnnic-spacing-sm;
  padding-top: 3.375 * $unnnic-font-size;

  margin: 0;
  font-family: $unnnic-font-family-primary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-lg;

  color: $unnnic-color-neutral-dark;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  font-weight: $unnnic-font-weight-regular;

  color: $unnnic-color-neutral-dark;
  border: none;

  border-radius: $unnnic-border-radius-sm;

  outline-style: solid;
  outline-color: $unnnic-color-neutral-cleanest;
  outline-width: $unnnic-border-width-thinner;
  outline-offset: -$unnnic-border-width-thinner;

  &--button-on-header {
    padding-top: 4.375 * $unnnic-font-size;
  }

  &::placeholder {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    font-weight: $unnnic-font-weight-regular;
  }

  &:focus {
    outline-color: $unnnic-color-neutral-clean;
  }

  &::-webkit-scrollbar {
    margin-right: $unnnic-inset-sm;
  }
}
</style>
