<template>
    <modal-next class="flow-modal create-intelligence-modal" max-width="600px">
        <article class="flow-modal__container">
            <div class="flow-modal__header">
                <div class="flow-modal__header__fill">
                    <div class="flow-modal__header__fill__container">
                        <div class="flow-modal__header__fill__bar flow-modal__header__fill__bar--green"></div>
                        <p :class="[
                            'flow-modal__header__fill__label',
                            { 'flow-modal__header__fill__label--green': this.index === 0 }
                        ]">Selecionar fluxo</p>
                    </div>
                    <div class="flow-modal__header__fill__container">
                        <div :class="[
                            'flow-modal__header__fill__bar',
                            { 'flow-modal__header__fill__bar--green': this.index === 1 }
                        ]" />
                        <p :class="[
                            'flow-modal__header__fill__label',
                            { 'flow-modal__header__fill__label--green': this.index === 1 }
                        ]">Adicionar descrição</p>
                    </div>
                </div>
                <div class="flow-modal__header__title__container">
                    <h3>{{ this.index === 0 ? 'Selecionar fluxo' : 'Adicionar descrição no fluxo' }}</h3>
                    <p>{{ this.index === 0 ? 'Selecione o fluxo que deseja adicionar o Router' : 'Para ativar o Router, adicione uma descrição para o fluxo'}}</p>
                </div>
            </div>
            <div class="flow-modal__body">
                <div class="flow-modal__body__flow" v-if="this.index === 0">
                    <div>
                        <unnnicInput size="sm" iconLeftClickable="true" iconLeft="search-1"
                            placeholder="Pesquisar Fluxo" />
                    </div>
                    <div class="flow-modal__body__flow__list">
                        <div v-for="(item, index) in flows" :key="index" class="flow-modal__body__flow__list__item">
                            <UnnnicIcon icon="account_tree" size="sm" scheme="neutral-cloudy" />
                            <p>{{ item.name }}</p>
                        </div>
                    </div>
                </div>
                <div class="flow-modal__body_description" v-if="this.index === 1">
                    <UnnnicTextArea v-bind="$props" v-model="description" label="Descrição" />
                </div>
            </div>
            <div class="flow-modal__footer">
                <UnnnicButton slot="options" class="create-repository__container__button" type="tertiary"
                    @click="handleBackBtn">
                    Voltar
                </UnnnicButton>
                <UnnnicButton slot="options" size='large' @click="handleNextBtn()">
                    {{ this.index === 0 ? 'Avançar' : 'Ativar Router' }}
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
    },
    data() {
        return {
            index: 0,
            description: '',
            flowSelected: {
                name: '',
                uuid: ''
            },
            flows: [
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },                
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                },
                {
                    name: 'Nome do fluxo',
                    uuid: 'sjdfhskjhf32423'
                }
            ]
        }

    },
    methods: {
        handleNextBtn() {
            if (this.index === 0) this.index = 1
        },
        handleBackBtn() {
            this.index = 0
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

        &__fill {
            display: flex;
            align-items: flex-start;
            gap: $unnnic-spacing-xs;

            &__container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            &__bar {
                width: 7.8125rem;
                height: 0.5rem;
                border-radius: $unnnic-border-radius-pill;
                background: $unnnic-color-neutral-soft;

                &--green {
                    background: $unnnic-color-weni-600;
                }
            }

            &__label {
                color: $unnnic-color-neutral-clean;
                font-family: $unnnic-font-family-secondary;
                font-size: $unnnic-font-size-body-md;
                font-weight: $unnnic-font-weight-regular;
                line-height: $unnnic-line-height-md;

                &--green {
                    color: $unnnic-color-weni-700;
                }
            }

        }

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

    &__body {

        &__flow {
            display: flex;
            flex-direction: column;
            gap: $unnnic-spacing-sm;

            &__list {
                display: flex;
                flex-wrap: wrap;
                gap: $unnnic-spacing-ant;
                max-height: 300px;
                overflow-y: auto;

                &__item {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    align-self: stretch;
                    flex-basis: calc(50% - 6px);
                    gap: $unnnic-spacing-ant;
                    border-radius: $unnnic-border-radius-sm;
                    padding: $unnnic-spacing-ant;
                    border: 1px solid $unnnic-color-neutral-cleanest;
                    background: $unnnic-color-background-carpet;

                    &:hover {
                        border: 1px solid $unnnic-color-weni-500;
                        background: rgba(0, 222, 210, 0.16);
                    }

                    &__selected {
                        border: 1px solid $unnnic-color-weni-500;
                        background: rgba(0, 222, 210, 0.16);
                    }

                    p {
                        font-family: $unnnic-font-family-secondary;
                        font-size: $unnnic-font-size-body-gt;
                        font-weight: $unnnic-font-weight-regular;
                        line-height: $unnnic-line-height-md;
                        color: $unnnic-color-neutral-darkest;
                    }
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