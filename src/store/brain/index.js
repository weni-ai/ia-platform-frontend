import { differenceBy, cloneDeep, pick } from 'lodash';
import { WENIGPT_OPTIONS } from '../../utils';
import nexusaiAPI from '../../api/nexusaiAPI.js';
import Vue from 'vue';
import i18n from '../../utils/plugins/i18n';

export default {
  state: {
    isSavingChanges: false,
    customizationStatus: 'waitingToLoad',
    tuningsStatus: 'waitingToLoad',

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

  getters: {
    brainHasCustomizationChanged(state) {
      return (
        Object.keys(state.agent).some((key) => {
          const { current, old } = state.agent[key];
          return current !== old;
        }) ||
        !!differenceBy(
          state.instructions.current,
          state.instructions.old,
          'instruction',
        ).length
      );
    },

    brainHasTuningsChanged(_state, getters) {
      return getters.brainTuningsFields.some(
        ({ value, previousValue }) => value !== previousValue,
      );
    },

    isBrainSaveButtonDisabled(_state, getters) {
      return (
        !getters.brainHasCustomizationChanged && !getters.brainHasTuningsChanged
      );
    },

    brainTuningsFields({ tunings, tuningsOld, models }) {
      const useValue = (field) => {
        const value = tunings[field.name] || field.default;
        const previousValue = tuningsOld[field.name] || field.default;

        return {
          ...field,
          value,
          previousValue,
        };
      };

      const model = useValue({
        type: 'radio',
        name: 'model',
        options: models.map(({ name }) => name),
        default: models[0].name,
      });

      return [model].concat([
        ...models.find(({ name }) => name === model.value).fields.map(useValue),
      ]);
    },
  },

  actions: {
    async loadBrainCustomization({ commit, state, rootState }) {
      if (state.customizationStatus !== 'waitingToLoad') {
        return;
      }

      try {
        state.customizationStatus = 'loading';

        const { data } = await nexusaiAPI.router.customization.read({
          projectUuid: rootState.Auth.connectProjectUuid,
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

        commit('setBrainCustomizationInitialValues', currentData);
      } catch (error) {
        rootState.alert = {
          type: 'error',
          text: i18n.t('customization.invalid_get_data'),
        };
      } finally {
        state.customizationStatus = 'loaded';
      }
    },

    async loadBrainTunings({ commit, state, rootState }) {
      if (state.tuningsStatus !== 'waitingToLoad') {
        return;
      }

      try {
        state.tuningsStatus = 'loading';

        const { data } = await nexusaiAPI.router.tunings.read({
          projectUuid: rootState.Auth.connectProjectUuid,
        });

        commit('setBrainTuningsInitialValues', data);
      } finally {
        state.tuningsStatus = 'loaded';
      }
    },

    async saveBrainChanges({ state, getters, commit, rootState }) {
      try {
        state.isSavingChanges = true;

        const promises = [];

        if (getters.brainHasCustomizationChanged) {
          const saveCustomization = async () => {
            const agent = Object.keys(state.agent).reduce(
              (obj, key) => ({
                ...obj,
                [key]: state.agent[key].current,
              }),
              {},
            );

            const currentValue = {
              agent,
              instructions: state.instructions.current.filter(
                (e) => e.instruction,
              ),
            };

            const { data } = await nexusaiAPI.router.customization.edit({
              projectUuid: rootState.Auth.connectProjectUuid,
              data: currentValue,
            });

            commit('setBrainCustomizationInitialValues', data);
          };

          promises.push(saveCustomization());
        }

        if (getters.brainHasTuningsChanged) {
          const saveTunings = async () => {
            const handleFieldName = (name) =>
              name === 'version-gpt' ? 'version' : name;
            const handleFieldValue = (name, value) =>
              name === 'version' ? WENIGPT_OPTIONS[value] : value;

            const { data } = await nexusaiAPI.router.tunings.edit({
              projectUuid: rootState.Auth.connectProjectUuid,
              values: getters.brainTuningsFields.reduce(
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

            const fieldsChangeds = getters.brainTuningsFields
              .filter(({ value, previousValue }) => value !== previousValue)
              .map((field) => pick(field, ['name', 'value', 'type']));

            commit('setBrainTuningsInitialValues', data);

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
            }
          };

          promises.push(saveTunings());
        }

        await Promise.all(promises);

        rootState.alert = {
          type: 'success',
          text: i18n.t('router.tunings.changes_saved'),
        };
      } catch (error) {
        console.log('error', error);
      } finally {
        state.isSavingChanges = false;
      }
    },
  },

  mutations: {
    setBrainCustomizationInitialValues(state, data) {
      Object.keys(data.agent).forEach((key) => {
        state.agent[key].old = state.agent[key].current = data.agent[key] || '';
      });

      state.instructions.current = data.instructions || [];

      if (state.instructions.current.length === 0) {
        state.instructions.current.push({
          instruction: '',
        });
      }

      state.instructions.old = cloneDeep(state.instructions.current);
    },

    setBrainTuningsInitialValues(state, data) {
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

      Vue.set(state.tunings, 'model', data.model);
      Vue.set(state.tuningsOld, 'model', data.model);

      Object.keys(data.setup).forEach((name) => {
        Vue.set(state.tunings, handleName(name), getValue(name));
        Vue.set(state.tuningsOld, handleName(name), getValue(name));
      });
    },
  },
};
