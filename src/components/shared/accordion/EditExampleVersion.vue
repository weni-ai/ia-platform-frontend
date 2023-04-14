<template>
  <div class="edit-sentence">
    <form>
      <div class="columns edit-sentence__wrapper">
        <div class="column is-6">
          <unnnic-input-next
            ref="textInput"
            :label="$t('webapp.example.version_name')"
            size="sm"
            v-model="versionName"
            :placeholder="$t('webapp.example.enter_sentence')"
          />
        </div>
        <div class="column is-6">
          <div class="edit-sentence__label">
            <p
              slot="label"
              class="unnnic-form__label"
              v-html="$t('webapp.example.principal_version_label')">
            </p>
            <unnnic-tool-tip
              side="top"
              :text="$t('webapp.example.principal_version_info')"
              enabled
            >
              <unnnic-icon
                class="info"
                icon="information-circle-4"
                size="sm"
                scheme="neutral-soft"
              />
            </unnnic-tool-tip>
          </div>
          <unnnic-switch
            :textRight="$t('webapp.example.principal_version_text')"
            v-model="isDefaultVersion"
            :disabled="isDefault" />
        </div>
      </div>
      <div
        class="edit-sentence__btn-wrapper">
        <div class="column p-0 is-flex is-justify-content-space-between">
          <unnnic-button
            class="mr-4 edit-sentence__btn-wrapper__button"
            type="terciary"
            size="small"
            @click.prevent.stop="$emit('cancel')">
            {{ $t('webapp.trainings.cancel_button') }}
          </unnnic-button>
          <unnnic-button
            type="secondary"
            size="small"
            class="edit-sentence__btn-wrapper__button"
            @click.prevent.stop="saveVersion">
            {{ $t('webapp.trainings.save_button') }}
          </unnnic-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'EditExampleVersion',
  props: {
    textToEdit: {
      type: String
    },
    versionId: {
      type: Number
    },
    isDefault: {
      type: Boolean
    }
  },
  data() {
    return {
      versionName: '',
      isDefaultVersion: false
    }
  },
  created(){
    this.versionName = this.textToEdit;
    this.isDefaultVersion = this.isDefault;
  },
  methods: {
    cancelEditVersion() {
      this.$emit('cancel')
    },
    async saveVersion() {
      this.$emit('save', {
        versionName: this.versionName,
        isDefaultVersion: this.isDefaultVersion,
        isNewVersionName: this.versionName !== this.textToEdit
      })
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.edit-sentence {
  background: transparent;
  border-top: 1px solid #E2E6ED;
  border-radius: 4px;
  margin-top: 1rem;

  &__wrapper {
    max-width: 100%;
    margin: 0;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  &__input {
     margin: 0 .5rem;

     &__wrapper {
       display: flex;
       flex-wrap: wrap;
       padding: 0.25rem;
       width: 70%;
     }

     &__label /deep/ {
       font-weight: normal;
     }
  }

  &-input {
    margin: .5rem 0;
  }

  &__btn-wrapper{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem .5rem;

    &__button{
      width: 50%;
    }

    a {
      font-family: 'Lato';
      font-weight: 400;
      font-size: 12px;
      color: #67738B;
      text-decoration: underline
    }
  }
  &__label {
    display: flex;

    p {
      margin-right: $unnnic-spacing-stack-xs;
    }
  }
}
/deep/ .column.is-6 {
  flex: auto;
  max-width: 50%;
  padding: .5rem;
}
/deep/ .column.is-3 {
  flex: auto;
  padding: .5rem;
}
/deep/ .input {
  height: auto;
}
/deep/ .unnnic-form__label {
  font-family: Lato;
}
/deep/ .unnnic-form__label strong {
  color: #67738B;
  font-weight: 400;
  text-decoration: solid #67738B underline;
}

/deep/ .unnnic-tooltip {
  display: flex;
  align-items: center;
}
</style>
