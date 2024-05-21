import { differenceBy, cloneDeep } from 'lodash';
import nexusaiAPI from '../api/nexusaiAPI.js';

export default {
  data() {
    return {
      brain: {
        isSavingChanges: false,

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
      },
    };
  },

  mounted() {
    if (this.isRouterView) {
      this.loadCustomization();
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
