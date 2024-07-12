<template>
  <div class="column is-6 pt-0">
    <div>
      <div>
        <p
          slot="label"
          class="unnnic-form__label mt-0">
          <span class="is-rounded entity">
            {{ selectedText }}
          </span>
          {{ $t('webapp.result.is') }}
        </p>
        <Autocomplete
          v-model="entity"
          ref="entityInputField"
          id="tour-training-step-3"
          :options="filteredData"
          entityFormat
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatters } from '@/utils';
import Autocomplete from '../../Autocomplete.vue';

export default {
  name: 'EntityForm',
  model: {
    prop: 'entity',
  },
  components: {
    Autocomplete,
  },
  props: {
    entityClass: {
      type: String,
      required: true,
    },
    availableEntities: {
      type: Array,
      default: () => ([]),
    },
    text: {
      type: String,
      required: true,
    },
    selectedTextStart: {
      type: Number,
      required: true,
    },
    selectedTextEnd: {
      type: Number,
      required: true,
    },
    newEntity: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      entity: '',
    };
  },
  computed: {
    ...mapGetters([
      'activeTutorial',
    ]),
    entityFormatters() {
      return [
        formatters.bothubItemKey(),
      ];
    },
    filteredData() {
      return this.availableEntities || [];
    },
    selectedText() {
      return this.text.substring(this.selectedTextStart, this.selectedTextEnd);
    },
  },
  watch: {
    async entity() {
      if (!this.entity || this.entity.length <= 0) return;
      await this.$nextTick();
      this.entity = formatters.bothubItemKey()(this.entity);
      this.$emit('input', this.entity);
    },
  },
  async mounted() {
    await this.$nextTick();
    this.entity = this.newEntity ?? this.selectedText;
  },
  methods: {
    async removeEntity() {
      if (this.activeTutorial === 'training') return;
      await this.$nextTick;
      this.$emit('removeEntity');
    },
  },
};
</script>

<style lang="scss" scoped>

  .entity-form{
    margin-left: 0.3rem;
    margin-bottom: 1.5rem;

    &__label{
      margin-bottom: 6px;
      display: block;
    }
  }
  .entity {
    text-decoration: 1px solid #67738B underline;
  }
  :deep(.icon.is-right) {
    transform: translateY(-5%);
  }
  :deep(.hidden .unnnic-autocomplete__container-list) {
  display: none;
}
</style>
