<template>
    <section class="customization__container">
        <div class="customization__container__persona">
            <section>
                <p class="customization-title">{{ $t('customization.title') }}</p>
                <p class="customization-sub_title">{{ $t('customization.sub_title') }}</p>
            </section>
            <div class="customization__form">
                <unnnic-form-element :label="$t('customization.fields.name')" class="customization__form-element">
                    <unnnic-input v-model="values.agent.name" :placeholder="$t('customization.placeholders.name')" />
                </unnnic-form-element>
                <unnnic-form-element :label="$t('customization.fields.occupation')" class="customization__form-element">
                    <unnnic-input v-model="values.agent.role"
                        :placeholder="$t('customization.placeholders.occupation')" />
                </unnnic-form-element>
            </div>
            <div class="customization__container__persona">
                <section>
                    <unnnic-label v-bind="$props" :label="$t('customization.fields.personality')"
                        class="customization__container__label" />
                    <div class="customization__personality">
                        <section :class="[
                            'customization__personality__item',
                            { 'customization__personality-selected': values.agent.personality === item?.value }
                        ]" v-for="(item, index) in personalities" :key="index" @click="handlePersonalitySelect(item)">
                            <p>{{ item.label }}</p>
                        </section>
                    </div>
                </section>
            </div>
            <div class="customization__container__persona">
                <unnnic-text-area v-bind="$props" v-model="values.agent.goal" :label="$t('customization.fields.goal')"
                    :placeholder="$t('customization.placeholders.goal')" />
            </div>
        </div>

        <div class="customization__container__instructions">
            <section>
                <p class="customization-title">{{ $t('customization.instructions.title') }}
                </p>
                <p class="customization-sub_title">{{ $t('customization.instructions.sub_title') }}</p>
            </section>
            <section class="customization__instructions" v-for="(instruction, index) in values?.instructions"
                :key="index">
                <unnnic-form-element :label="$t('customization.fields.instruction')"
                    class="customization__instructions-element">
                    <section class="customization__instructions__form_group">
                        <unnnic-input v-model="values.instructions[index].instruction"
                            :placeholder="$t('customization.placeholders.instruction')" />
                        <unnnic-button-icon v-bind="$props" icon="delete-1-1" class="btn-color" size="small"
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
                iconLeft="add-1" :disabled="hasChanged" :loading="saving" />
        </div>
        <unnnic-modal-next type="alert" icon="error" scheme="feedback-red"
            :title="$t('customization.instructions.modals.title')"
            :description="$t('customization.instructions.modals.description')"
            :actionPrimaryLabel="$t('customization.instructions.modals.remove_btn')"
            :actionSecondaryLabel="$t('customization.instructions.modals.back_btn')" v-show="showRemoveModal"
            @close="showRemoveModal = false" @click-action-primary="removeInstruction"
            :actionPrimaryLoading="removing" />

    </section>
</template>

<script>
import nexusaiAPI from '../../../../api/nexusaiAPI';

export default {
    data() {
        return {
            removeInstructions: [],
            currentInstruction: 0,
            showRemoveModal: false,
            saving: false,
            removing: false,
            values: {
                agent: {
                    name: '',
                    role: '',
                    goal: '',
                    personality: ''
                },
                instructions: [{
                    instruction: ''
                }]
            },
            oldValues: {
                agent: {
                    name: '',
                    role: '',
                    goal: '',
                    personality: ''
                },
                instructions: [{
                    instruction: ''
                }]
            },
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
    computed: {
        hasChanged() {
            const changedProperties = Object.keys(this.values).flatMap(key => {
                if (key === 'agent') {
                    return Object.keys(this.values.agent).filter(agentKey =>
                        this.values.agent[agentKey] !== this.oldValues.agent[agentKey]);
                } else if (key === 'instructions') {
                    const isValidText = this.values.instructions.some(v => v.instruction.length > 0);
                    if (this.values.instructions.length !== this.oldValues.instructions.length && isValidText) {
                        return key;
                    } else {
                        for (let i = 0; i < this.values.instructions.length; i++) {
                            const currentInstruction = this.values.instructions[i].instruction;
                            const oldInstruction = this.oldValues.instructions[i]?.instruction || '';
                            if (currentInstruction !== oldInstruction && isValidText) {
                                return key;
                            }
                        }
                    }
                }
                return [];
            });



            return changedProperties.length === 0;
        }
    },

    async created() {
        const { data } = await nexusaiAPI.router.customization.read({
            projectUuid: this.$store.state.Auth.connectProjectUuid,
        });

        let currentData = data;
        if (data.agent === null) {
            currentData.agent = {
                name: '',
                role: '',
                goal: '',
                personality: ''
            }
        }

        if (data.instructions.length === 0) {
            currentData.instructions = [{
                instruction: ''
            }]
        }
        this.setInitialValues(data)
    },
    methods: {
        setInitialValues(data) {
            this.values = data
            this.oldValues = JSON.parse(JSON.stringify(data));
        },
        addInstruction() {
            this.values.instructions.push({
                instruction: ''
            });
        },
        handleShowRemoveModal(index) {
            this.showRemoveModal = true
            this.currentInstruction = index
        },
        async removeInstruction() {
            try {
                this.removing = true;
                if (this.values.instructions[this.currentInstruction].id) {

                    await nexusaiAPI.router.customization.delete({
                        projectUuid: this.$store.state.Auth.connectProjectUuid,
                        id: this.values.instructions[this.currentInstruction].id
                    });
                    this.removeInstructions.push(this.values.instructions[this.currentInstruction])
                }
                this.values.instructions.splice(this.currentInstruction, 1);

                this.showRemoveModal = false;
                this.currentInstruction = null;

                this.$store.state.alert = {
                    type: 'success',
                    text: this.$t('customization.instructions.modals.success_message'),
                };
            } catch (e) {
                this.$store.state.alert = {
                    type: 'error',
                    text: this.$t('customization.instructions.modals.error_message'),
                };
            } finally {
                this.removing = false;
            }
        },
        async saveChanges() {
            try {
                this.saving = true;

                const currentValue = {
                    agent: this.values.agent,
                    instructions: this.values.instructions.filter(e => e.instruction)
                }

                const { data } = await nexusaiAPI.router.customization.edit({
                    projectUuid: this.$store.state.Auth.connectProjectUuid,
                    data: currentValue
                });

                this.setInitialValues(data)

                this.$store.state.alert = {
                    type: 'success',
                    text: this.$t('router.tunings.changes_saved'),
                };
            } finally {
                this.saving = false;
            }
        },
        handlePersonalitySelect(personality) {
            if (this.values.agent.personality === personality.value) {
                this.values.agent.personality = ''
            } else this.values.agent.personality = personality.value;
        }
    }

};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.customization {
    &-title {
        color: $unnnic-color-neutral-dark;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        font-weight: $unnnic-font-weight-bold;
        line-height: $unnnic-line-height-md;
        padding-bottom: $unnnic-spacing-xs;
    }

    &-sub_title {
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        ;
        font-size: $unnnic-font-size-body-gt;
        font-weight: $unnnic-font-weight-regular;
        line-height: $unnnic-line-height-md;
    }

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