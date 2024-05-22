import { WENIGPT_OPTIONS } from './index.js';
import { differenceBy, cloneDeep, pick } from 'lodash';
import nexusaiAPI from '../api/nexusaiAPI.js';

export default {
  data() {
    return {
      brain: {
        isSavingChanges: false,
        isLoadingTunings: false,

        agent: {
          name: {
            current: '',
            old: '',
          },
          role: {
            current: '',
            old: '',
          },
          goal: {
            current: '',
            old: '',
          },
          personality: {
            current: '',
            old: '',
          },
        },

        instructions: {
          current: [],
          old: [],
        },

        tunings: {},
        tuningsOld: {},

        models: [
          {
            name: 'WeniGPT',
            fields: [
              {
                type: 'select',
                name: 'version',
                default: Object.keys(WENIGPT_OPTIONS)[0],
                options: Object.keys(WENIGPT_OPTIONS),
              },
              {
                type: 'naf-header',
                name: 'parameter',
              },
              {
                type: 'slider',
                name: 'temperature',
                default: 0.1,
                step: 0.05,
                min: 0,
                max: 1,
              },
              {
                type: 'slider',
                name: 'top_p',
                default: 0.95,
                step: 0.05,
                min: 0,
                max: 1,
              },
              {
                type: 'slider',
                name: 'top_k',
                default: 10,
                step: 1,
                min: 1,
                max: 100,
              },
            ],
          },
          {
            name: 'ChatGPT',
            fields: [
              {
                type: 'password',
                name: 'token',
              },
              {
                type: 'select',
                name: 'version-gpt',
                default: 'gpt-4o',
                options: ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'],
              },
              {
                type: 'select',
                name: 'language',
                default: 'por',
                options: ['por', 'eng', 'spa'],
              },
              {
                type: 'naf-header',
                name: 'parameter',
              },
              {
                type: 'slider',
                name: 'temperature',
                default: 0.1,
                step: 0.05,
                min: 0,
                max: 1,
              },
              {
                type: 'slider',
                name: 'top_p',
                default: 0.95,
                step: 0.05,
                min: 0,
                max: 1,
              },
            ],
          },
        ],
      },
    };
  },

  mounted() {
    if (this.isRouterView) {
      this.loadCustomization();
      this.loadTunings();
    }
  },

  computed: {
    brainHasCustomizationChanged() {
      return (
        Object.keys(this.brain.agent).some((key) => {
          const { current, old } = this.brain.agent[key];
          return current !== old;
        }) ||
        differenceBy(
          this.brain.instructions.current,
          this.brain.instructions.old,
          'instruction',
        ).length
      );
    },

    brainHasTuningsChanged() {
      return this.brainTuningsFields.some(
        ({ value, previousValue }) => value !== previousValue,
      );
    },

    brainTuningsFields() {
      const useValue = (field) => {
        const value = this.brain.tunings[field.name] || field.default;
        const previousValue =
          this.brain.tuningsOld[field.name] || field.default;

        return {
          ...field,
          value,
          previousValue,
        };
      };

      const model = useValue({
        type: 'radio',
        name: 'model',
        options: this.brain.models.map(({ name }) => name),
        default: this.brain.models[0].name,
      });

      return [model].concat([
        ...this.brain.models
          .find(({ name }) => name === model.value)
          .fields.map(useValue),
      ]);
    },
  },

  methods: {
    setInitialValues(type, data) {
      if (type === 'customization') {
        Object.keys(data.agent).forEach((key) => {
          this.brain.agent[key].old = this.brain.agent[key].current =
            data.agent[key] || '';
        });

        this.brain.instructions.current = data.instructions || [];

        if (this.brain.instructions.current.length === 0) {
          this.brain.instructions.current.push({
            instruction: '',
          });
        }

        this.brain.instructions.old = cloneDeep(
          this.brain.instructions.current,
        );
      } else if (type === 'tunings') {
        const handleName = (name) =>
          name === 'version' && data.model === 'ChatGPT' ? 'version-gpt' : name;
        const getValue = (name) => {
          const specialValues = ['temperature', 'top_p', 'top_k'];

          if (specialValues.includes(name)) {
            return Number(data.setup[name]);
          }

          if (name === 'version' && data.model === 'WeniGPT') {
            const option = Object.entries(WENIGPT_OPTIONS).find(
              ([_, value]) => value === data.setup[name],
            );
            return option ? option[0] : '';
          }

          return data.setup[name];
        };

        this.$set(this.brain.tunings, 'model', data.model);
        this.$set(this.brain.tuningsOld, 'model', data.model);

        Object.keys(data.setup).forEach((name) => {
          this.$set(this.brain.tunings, handleName(name), getValue(name));
          this.$set(this.brain.tuningsOld, handleName(name), getValue(name));
        });
      }
    },

    async loadCustomization() {
      const { data } = await nexusaiAPI.router.customization
        .read({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
        })
        .catch(() => {
          this.$store.state.alert = {
            type: 'error',
            text: this.$t('customization.invalid_get_data'),
          };
          return { data: null };
        });

      let currentData = data;

      if (currentData.agent === null) {
        currentData.agent = {
          name: '',
          role: '',
          goal: '',
          personality: '',
        };
      }

      this.setInitialValues('customization', currentData);
    },

    async loadTunings() {
      try {
        this.brain.isLoadingTunings = true;

        const { data } = await nexusaiAPI.router.tunings.read({
          projectUuid: this.$store.state.Auth.connectProjectUuid,
        });

        this.setInitialValues('tunings', data);
      } finally {
        this.brain.isLoadingTunings = false;
      }
    },

    async brainSaveChanges() {
      try {
        this.brain.isSavingChanges = true;

        const promises = [];

        if (this.brainHasCustomizationChanged) {
          const saveCustomization = async () => {
            const agent = Object.keys(this.brain.agent).reduce(
              (obj, key) => ({
                ...obj,
                [key]: this.brain.agent[key].current,
              }),
              {},
            );

            const currentValue = {
              agent,
              instructions: this.brain.instructions.current.filter(
                (e) => e.instruction,
              ),
            };

            const { data } = await nexusaiAPI.router.customization.edit({
              projectUuid: this.$store.state.Auth.connectProjectUuid,
              data: currentValue,
            });

            this.setInitialValues('customization', data);
          };

          promises.push(saveCustomization());
        }

        if (this.brainHasTuningsChanged) {
          const saveTunings = async () => {
            const handleFieldName = (name) =>
              name === 'version-gpt' ? 'version' : name;
            const handleFieldValue = (name, value) =>
              name === 'version' ? WENIGPT_OPTIONS[value] : value;

            const { data } = await nexusaiAPI.router.tunings.edit({
              projectUuid: this.$store.state.Auth.connectProjectUuid,
              values: this.brainTuningsFields.reduce(
                (values, field) => ({
                  ...values,
                  [handleFieldName(field.name)]: handleFieldValue(
                    field.name,
                    field.value,
                  ),
                }),
                {},
              ),
            });

            const fieldsChangeds = this.brainTuningsFields
              .filter(({ value, previousValue }) => value !== previousValue)
              .map((field) => pick(field, ['name', 'value', 'type']));

            this.setInitialValues('tunings', data);

            if (window.brainPreviewAddMessage) {
              fieldsChangeds.forEach((field) => {
                const name =
                  {
                    model: 'router.tunings.model',
                  }[field.name] || `router.tunings.fields.${field.name}`;

                window.brainPreviewAddMessage({
                  type: 'change',
                  name,
                  value:
                    field.type === 'password'
                      ? field.value.replace(/./g, '•')
                      : field.value,
                });
              });

              this.setInitialValues('tunings', data);
            }
          };

          promises.push(saveTunings());
        }

        await Promise.all(promises);

        this.$store.state.alert = {
          type: 'success',
          text: this.$t('router.tunings.changes_saved'),
        };
      } catch (error) {
        console.log('error', error);
      } finally {
        this.brain.isSavingChanges = false;
      }
    },
  },
};
