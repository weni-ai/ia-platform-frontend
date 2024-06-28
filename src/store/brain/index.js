import { differenceBy, cloneDeep, pick, get } from 'lodash';
import { WENIGPT_OPTIONS } from '../../utils';
import { models } from './models.js';
import nexusaiAPI from '../../api/nexusaiAPI.js';
import Vue from 'vue';
import i18n from '../../utils/plugins/i18n';
import store from '../index.js';

function watchOnce(...args) {
  const unwatch = store.watch(args[0], () => {
    args[1]();
    unwatch();
  });
}

export default {
  state: {
    tabsWithError: null,
    isSavingChanges: false,
    customizationStatus: 'waitingToLoad',
    tuningsStatus: 'waitingToLoad',

    contentText: {
      uuid: null,
      current: '',
      old: '',
    },

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

    customizationErrorRequiredFields: {
      name: false,
      role: false,
      goal: false,
    },
  },

  getters: {
    hasBrainCustomizationChanged(state) {
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

    hasBrainTuningsChanged(_state, getters) {
      return getters.brainTuningsFields.some(
        ({ value, previousValue }) => value !== previousValue,
      );
    },

    hasBrainContentTextChanged(state) {
      return state.contentText.current !== state.contentText.old;
    },

    isBrainSaveButtonDisabled(state, getters) {
      const hasCustomizationErrorRequiredFields = Object.values(
        state.customizationErrorRequiredFields,
      ).includes(true);

      return (
        (!getters.hasBrainCustomizationChanged &&
          !getters.hasBrainTuningsChanged &&
          !getters.hasBrainContentTextChanged) ||
        hasCustomizationErrorRequiredFields
      );
    },

    brainTuningsFields({ tunings, tuningsOld }) {
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

    validateBrainCustomization({ state }) {
      const unfilledFields = ['name', 'role', 'goal'].filter(
        (property) => !state.agent[property].current,
      );

      unfilledFields.forEach((property) => {
        state.customizationErrorRequiredFields[property] = true;

        watchOnce(
          ({ Brain }) => Brain.agent[property].current,
          () => {
            state.customizationErrorRequiredFields[property] = false;
          },
        );
      });

      if (unfilledFields.length) {
        throw {
          tab: 'personalization',
        };
      }
    },

    async saveBrainCustomization({ state, commit, rootState }) {
      const agent = Object.keys(state.agent).reduce(
        (obj, key) => ({
          ...obj,
          [key]: state.agent[key].current,
        }),
        {},
      );

      const currentValue = {
        agent,
        instructions: state.instructions.current.filter((e) => e.instruction),
      };

      const { data } = await nexusaiAPI.router.customization.edit({
        projectUuid: rootState.Auth.connectProjectUuid,
        data: currentValue,
      });

      commit('setBrainCustomizationInitialValues', data);
    },

    async saveBrainContentText({ state, commit, rootState }) {
      if (state.contentText.uuid) {
        const { data: contentBaseTextData } =
          await nexusaiAPI.updateIntelligenceContentBaseText({
            contentBaseUuid: rootState.router.contentBaseUuid,
            contentBaseTextUuid: state.contentText.uuid,
            text: state.contentText.current,
            hideGenericErrorAlert: true,
          });

        commit('setBrainContentTextInitialValues', contentBaseTextData);
      } else {
        const { data: contentBaseTextData } =
          await nexusaiAPI.createIntelligenceContentBaseText({
            contentBaseUuid: rootState.router.contentBaseUuid,
            text: state.contentText.current,
            hideGenericErrorAlert: true,
          });

        commit('setBrainContentTextInitialValues', contentBaseTextData);
      }
    },

    async saveBrainTunings({ getters, commit, rootState }) {
      const handleFieldName = (name) =>
        name === 'version-gpt' ? 'version' : name;
      const handleFieldValue = (name, value) =>
        name === 'version'
          ? WENIGPT_OPTIONS.find((e) => e.name === value).model
          : value;

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
    },

    async saveBrainChanges({ state, getters, rootState, dispatch }) {
      try {
        getters.hasBrainCustomizationChanged &&
          (await dispatch('validateBrainCustomization'));

        state.isSavingChanges = true;

        const promises = [];

        if (getters.hasBrainCustomizationChanged) {
          promises.push(dispatch('saveBrainCustomization'));
        }

        if (getters.hasBrainTuningsChanged) {
          promises.push(dispatch('saveBrainTunings'));
        }

        if (getters.hasBrainContentTextChanged) {
          promises.push(dispatch('saveBrainContentText'));
        }

        const tabsWithError = (await Promise.allSettled(promises))
          .filter(({ status }) => status === 'rejected')
          .map(({ reason }) => get(reason, 'config.routerName'))
          .map(
            (routerName) =>
              ({
                'brain-customization-edit': 'personalization',
                'contentBase-text-create': 'content',
                'contentBase-text-edit': 'content',
                'brain-tunings-edit': 'tunings',
              }[routerName]),
          )
          .filter((tab) => tab);

        if (tabsWithError.length) {
          state.tabsWithError = tabsWithError;
        } else {
          rootState.alert = {
            type: 'success',
            text: i18n.t('router.tunings.changes_saved'),
          };
        }
      } catch (error) {
        const tabWithError = get(error, 'tab');

        if (tabWithError) {
          state.tabsWithError = [tabWithError];
        }
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
          const option = WENIGPT_OPTIONS.find(
            (value) => value.model === data.setup[name],
          );
          return option ? option.name : '';
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

    setBrainContentTextInitialValues(state, data) {
      state.contentText.uuid = data.uuid;
      state.contentText.current = state.contentText.old = data.text;
    },
  },
};
