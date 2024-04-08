<template>
    <section class="customization__container">
        <div class="customization__container__persona">
            <p>{{ $t('customization.title') }}</p>
            <p>{{ $t('customization.sub_title') }}</p>
            <div class="customization__form">
                <unnnic-form-element :label="$t('customization.fields.name')" class="customization__form-element">
                    <unnnic-input v-model="title" :placeholder="$t('customization.placeholders.name')" />
                </unnnic-form-element>
                <unnnic-form-element :label="$t('customization.fields.occupation')" class="customization__form-element">
                    <unnnic-input v-model="title" :placeholder="$t('customization.placeholders.occupation')" />
                </unnnic-form-element>
            </div>
            <div class="customization__container__persona">
                <section>
                    <unnnic-label v-bind="$props" :label="$t('customization.fields.personality')"
                        class="customization__container__label" />
                    <div class="customization__personality">
                        <section :class="[
                            'customization__personality__item',
                            { 'customization__personality-selected': !!personalities_selected.find(e => e?.value === item?.value) }
                        ]" v-for="(item, index) in personalities" :key="index" @click="handlePersonalitySelect(item)">
                            <p>{{ item.label }}</p>
                        </section>
                    </div>
                </section>
            </div>
            <div class="customization__container__persona">
                <unnnic-text-area v-bind="$props" v-model="goal" :label="$t('customization.fields.goal')"
                    :placeholder="$t('customization.placeholders.goal')" />
            </div>
        </div>
        <div class="customization__container__instructions">
            <section>
                <p>{{ $t('customization.instructions.title') }}</p>
                <p>{{ $t('customization.instructions.sub_title') }}</p>
            </section>

            <section class="customization__instructions" v-for="(instruction, index) in instructions" :key="index">
                <unnnic-form-element :label="$t('customization.fields.instruction')"
                    class="customization__instructions-element">
                    <section class="customization__instructions__form_group">
                        <unnnic-input v-model="instructions[index]"
                            :placeholder="$t('customization.placeholders.instruction')" />
                        <unnnic-button-icon v-bind="$props" icon="delete-1-1" class="btn-color"
                            @click="handleShowRemoveModal(index)" />
                    </section>
                </unnnic-form-element>
            </section>


            <unnnic-button @click="addInstruction" size="large"
                :text="$t('customization.instructions.add_instruction_btn')" type="tertiary" iconLeft="add-1"
                :disabled="false" />

        </div>
        <div class="customization__footer">
            <unnnic-button @click="saveChanges" size="large" :text="$t('customization.save_btn')" type="primary"
                iconLeft="add-1" :disabled="false" />
        </div>
        <unnnic-modal-next type="alert" icon="error" scheme="feedback-red"
            :title="$t('customization.instructions.modals.title')"
            :description="$t('customization.instructions.modals.description')"
            :actionPrimaryLabel="$t('customization.instructions.modals.remove_btn')"
            :actionSecondaryLabel="$t('customization.instructions.modals.back_btn')" v-show="showRemoveModal"
            @close="showRemoveModal = false" @click-action-primary="removeInstruction" />
    </section>
</template>

<script>
export default {
    data() {
        return {
            title: '',
            goal: '',
            instructions: [''],
            currentInstruction: 0,
            showRemoveModal: false,
            personalities_selected: [],
            personalities: [{
                label: this.$t('customization.fields.personalities.friendly'),
                value: "Amigável"
            },
            {
                label: this.$t('customization.fields.personalities.cooperative'),
                value: "Cooperativo"
            },
            {
                label: this.$t('customization.fields.personalities.extrovert'),
                value: "Extrovertido"
            },
            {
                label: this.$t('customization.fields.personalities.generous'),
                value: "Generoso"
            },
            {
                label: this.$t('customization.fields.personalities.relaxed'),
                value: "Relaxado"
            },
            {
                label: this.$t('customization.fields.personalities.organized'),
                value: "Organizado"
            },
            {
                label: this.$t('customization.fields.personalities.systematic'),
                value: "Sistemático"
            },
            {
                label: this.$t('customization.fields.personalities.innovative'),
                value: "Inovador"
            },
            {
                label: this.$t('customization.fields.personalities.creative'),
                value: "Criativo"
            },
            {
                label: this.$t('customization.fields.personalities.intellectual'),
                value: "Intelectual"
            }
            ]
        }
    },
    methods: {
        addInstruction() {
            this.instructions.push('');
        },
        handleShowRemoveModal(index) {
            this.showRemoveModal = true
            this.currentInstruction = index
        },
        removeInstruction() {
            this.instructions.splice(this.currentInstruction, 1);
            this.showRemoveModal = false;
            this.currentInstruction = null;
        },
        saveChanges() {
            console.log('Instruções salvas:', this.instructions);
        },
        handlePersonalitySelect(personality) {
            const isPersonalityNotExist = !this.personalities_selected.find(e => e.value === personality.value)
            console.log(!this.personalities_selected.find(e => e?.value === personality?.value), personality)
            if (isPersonalityNotExist) this.personalities_selected.push(personality)
            console.log(this.personalities_selected)

        }
    }

};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.customization {
    &__container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        align-self: stretch;
        gap: $unnnic-spacing-md;

        &__persona {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: $unnnic-spacing-sm;

            &__label {
                margin-bottom: $unnnic-spacing-nano;
            }
        }

        &__instructions {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: $unnnic-spacing-sm;
            align-self: stretch;

            button {
                width: 100%;
            }
        }

    }

    &__form {
        display: flex;
        align-items: flex-start;
        gap: $unnnic-spacing-sm;
        align-self: stretch;

        &-element {
            width: 100%;
        }
    }

    &__personality {
        display: flex;
        flex-wrap: wrap;
        gap: $unnnic-spacing-xs;

        &__item {
            display: flex;
            padding: $unnnic-spacing-xs $unnnic-spacing-ant;
            border-radius: $unnnic-border-radius-sm;
            border: 1px solid $unnnic-color-neutral-cleanest;
            background-color: $unnnic-color-neutral-lightest;
            flex-direction: column;
            align-items: flex-start;
            cursor: pointer;

            p {
                color: $unnnic-color-neutral-darkest;
                font-family: $unnnic-font-family-secondary;
                font-size: $unnnic-font-size-body-gt;
                font-weight: $unnnic-font-weight-regular;
                line-height: $unnnic-line-height-md;
            }

        }

        &-selected,
        :hover {
            border-color: $unnnic-color-weni-300;
            background-color: $unnnic-color-weni-100;
        }
    }

    &__instructions {
        width: 100%;

        &__form_group {
            display: grid;
            grid-template-columns: 11.6fr 0.4fr;
            gap: $unnnic-spacing-nano;

            button {
                background-color: $unnnic-color-neutral-white !important;
            }
        }

        &-element {
            width: 100%;
        }
    }

    &__footer {
        width: 100%;
        border-top: 1px solid #E2E6ED;
        padding-top: $unnnic-spacing-md;

        button {
            width: 100%;
        }
    }
}
</style>