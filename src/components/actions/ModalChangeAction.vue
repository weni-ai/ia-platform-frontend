<template>
    <modal-next class="flow-modal create-intelligence-modal" max-width="604px">
        <article class="flow-modal__container">
            <div class="flow-modal__header">
                <div class="flow-modal__header__title__container">
                    <h3>{{ $t('modals.actions.descriptions.change_title') }}</h3>
                    <p>{{ $t('modals.actions.descriptions.change_sub_title') }}</p>
                </div>
            </div>
            <div class="flow-modal__body">
                <div class="flow-modal__body_description">
                    <UnnnicTextArea v-bind="$props" v-model="description"
                        :label="$t('modals.actions.descriptions.label')" />
                </div>
            </div>
            <div class="flow-modal__footer">
                <UnnnicButton slot="options" class="create-repository__container__button" type="tertiary"
                    @click="handleCloseModal">
                    {{ $t('modals.actions.btn_cancel') }}
                </UnnnicButton>
                <UnnnicButton slot="options" size='large' @click="handleNextBtn">
                    {{ $t('modals.actions.btn_complete') }}
                </UnnnicButton>
            </div>
        </article>
    </modal-next>
</template>

<script>
import ModalNext from '../ModalNext.vue';

export default {
    components: {
        ModalNext
    },
    props: {
        handleCloseModal: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            description: ''
        }
    },
    methods: {
        handleNextBtn() {
            console.log('handle submit')
        }
    }

};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.create-intelligence-modal {
    ::v-deep .create-intelligence-modal__container {
        padding: $unnnic-spacing-xl $unnnic-spacing-md $unnnic-spacing-md $unnnic-spacing-md;
    }
}

.flow-modal {
    &__container {
        display: flex;
        flex-direction: column;
    }

    &__header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: $unnnic-spacing-md;

        &__title {
            &__container {
                h3 {
                    font-family: $unnnic-font-family-secondary;
                    font-size: $unnnic-font-size-title-sm;
                    font-weight: $unnnic-font-weight-black;
                    line-height: $unnnic-line-height-md;
                    color: $unnnic-color-neutral-darkest;
                }

                p {
                    font-family: $unnnic-font-family-secondary;
                    font-size: $unnnic-font-size-body-gt;
                    font-weight: $unnnic-font-weight-regular;
                    line-height: $unnnic-line-height-md;
                    color: $unnnic-color-neutral-dark;
                }
            }
        }

    }

    &__footer {
        display: flex;
        justify-content: space-between;
        margin-top: $unnnic-spacing-md;
        gap: $unnnic-spacing-sm;

        button {
            width: 100%;

        }
    }
}
</style>