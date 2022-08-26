<template>
  <div class="filter-evaluate-example">
    <div class="filter-evaluate-example__filters">
      <unnnic-input
        :message="errors.intent"
        :placeholder="$t('webapp.intent.search_sentence')"
        iconLeft="search-1"
        v-model="text"
        :debounce="debounceTime"
      />
      <div :class="wrapperClasses">
        <div class="filter-evaluate-example__filters__wrapper__text">
          {{ $t("webapp.dashboard.filter_by") }}:
        </div>
        <div>
          <unnnic-autocomplete
             :message="errors.intent"
             :openWithFocus="true"
             @input="inputFormatters"
             @focus="onInputClick('intent')"
             @blur="onInputClick('intent')"
             v-model="intent"
             :data="optionsIntents"
             :formatters="inputFormatters"
             :placeholder="$t('webapp.evaluate.all_intents')"
             :iconRight="isIntentInputActive ? 'arrow-button-up-1' : 'arrow-button-down-1'"
           />
        </div>
        <div>
          <unnnic-autocomplete
             :message="errors.entity"
             :openWithFocus="true"
             @input="inputFormatters"
             @focus="onInputClick('entity')"
             @blur="onInputClick('entity')"
             v-model="entity"
             :data="optionsEntities"
             :formatters="inputFormatters"
             :placeholder="$t('webapp.evaluate.all_entities')"
             :iconRight="isEntityInputActive ? 'arrow-button-up-1' : 'arrow-button-down-1'"
           />
        </div>
        <b-field v-if="languageFilter && languages">
          <b-select v-model="language" :placeholder="$t('webapp.evaluate.all_languages')" expanded>
            <option
              v-for="language in languages"
              :key="language.id"
              :selected="language.value === language"
              :value="language.value"
            >
              {{ language.title }}
            </option>
            <option :value="null">
              {{ $t("webapp.home.all_languages") }}
            </option>
          </b-select>
        </b-field>
        <b-field :message="errors.repository_version_name" v-show="hasVersion">
          <b-autocomplete
            v-if="versions"
            v-model="versionName"
            :loading="false && versionsList.loading"
            :data="optionsVersions"
            :placeholder="$t('webapp.inbox.all_versions')"
            open-on-focus
            dropdown-position="bottom"
          />
        </b-field>
      </div>
    </div>
  </div>
</template>
<script>
import { formatters, LANGUAGES } from '@/utils/index';
import { mapGetters } from 'vuex';
import _ from 'lodash';


export default {
  name: 'SentenceFilters',
  props: {
    debounceTime: {
      type: Number,
      default: 750
    },
    intents: {
      type: Array,
      default: null
    },
    entities: {
      type: Array,
      default: null
    },
    versions: {
      type: Array,
      default: null
    },
    languageFilter: {
      type: Boolean,
      default: null
    },
    hasVersion: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      text: '',
      lastSearch: '',
      intent: '',
      entity: '',
      versionName: '',
      language: null,
      setTimeoutId: null,
      errors: {},
      isIntentInputActive: false,
      isEntityInputActive: false
    };
  },
  computed: {
    ...mapGetters({
      repository: 'getCurrentRepository'
    }),
    wrapperClasses() {
      const fieldCount = [
        this.languageFilter,
        this.entities,
        this.hasVersion ? this.versions : ''
      ].reduce((counter, condition) => (condition ? counter + 1 : counter), 1);

      return [
        'filter-evaluate-example__filters__wrapper',
        `filter-evaluate-example__filters__wrapper__has-${fieldCount}-fields`
      ];
    },
    languages() {
      return Object.keys(this.repository.evaluate_languages_count).map((lang, index) => ({
        id: index + 1,
        value: lang,
        title: `${LANGUAGES[lang]}`
      }));
    },
    filterIntents() {
      if (this.intents !== null) {
        return this.intents.filter(
          intent => intent
            .toString()
            .toLowerCase()
            .indexOf(this.intent.toLowerCase()) >= 0
        );
      }
      return [];
    },
    optionsIntents() {
      return this.filterIntents.map(intent => intent);
    },
    filterEntities() {
      if (this.entities !== null) {
        return this.entities.filter(
          entity => entity.value
            .toString()
            .toLowerCase()
            .indexOf(this.entity.toLowerCase()) >= 0
        );
      }
      return [];
    },
    optionsEntities() {
      return this.filterEntities.map(entity => entity.value);
    },
    optionsVersions() {
      if (!this.versions) return null;
      return this.versions.map(version => version.name);
    },
    inputFormatters() {
      const formattersList = [formatters.bothubItemKey()];
      formattersList.toString = () => 'inputFormatters';
      return formattersList;
    }
  },
  watch: {
    text(value) {
      const text = value.trim();
      if (this.lastSearch === text) return;
      this.lastSearch = text;
      this.$emit('textData', this.text);
      this.emitText(this.text);
    },
    intent(value) {
      const intent = formatters.bothubItemKey()(value);
      this.intent = intent;
      this.emitIntent(this.intent);
    },
    entity(value) {
      const entity = formatters.bothubItemKey()(value);
      this.entity = entity;
      this.emitEntity(this.entity);
    },
    language: _.debounce(function emitLanguage(value) {
      this.$emit('querystringformatted', { language: value });
    }, 500),
    versionName(value) {
      const versionName = formatters.versionItemKey()(value);
      if (this.versionName === versionName) return;
      this.$nextTick(() => {
        this.versionName = versionName;
      });
      this.emitVersion(versionName);
    }
  },
  mounted() {
    this.setDefaultLanguage();
  },
  methods: {
    emitText: _.debounce(function emitIntent(text) {
      this.$emit('querystringformatted', { search: text });
    }, 500),
    emitIntent: _.debounce(function emitIntent(intent) {
      this.$emit('querystringformatted', { intent });
    }, 500),
    emitEntity: _.debounce(function emitEntity(entity) {
      this.$emit('querystringformatted', { entity });
    }, 500),
    emitVersion: _.debounce(function emitVersion(version) {
      this.$emit('querystringformatted', { repository_version_name: version });
    }, 500),

    setDefaultLanguage() {
      if (!this.hasVersion) {
        this.language = this.repository.language;
      }
    },
    onInputClick(target) {
      if (target === 'intent') this.isIntentInputActive = !this.isIntentInputActive
      if (target === 'entity') this.isEntityInputActive = !this.isEntityInputActive
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";

.filter-evaluate-example {
  width: 100%;
  margin: 0 auto 1.8rem;

  &__filters {
    margin: 1rem 0;
    display: grid;
    grid-template-columns: 35% 1fr;
    grid-gap: 3rem;
    height: 36px;

    @media (max-width: 800px) {
      grid-template-columns: 1fr;
    }

    /deep/ input {
      height: auto;
    }

    &__input-text {
      align-self: center;
    }

    &__wrapper {
      display: grid;
      grid-gap: 1rem;

      &__has-2-fields {
        grid-template-columns: 1fr 1fr 1fr;

        @media (max-width: 800px) {
          grid-template-columns: 1fr;
        }
      }

      &__has-3-fields {
        grid-template-columns: 1fr 2fr 2fr 2fr;

        @media (max-width: 800px) {
          grid-template-columns: 1fr;
        }
      }

      &__has-4-fields {
        grid-template-columns: 1fr 2fr 2fr 2fr 2fr;

        @media (max-width: 800px) {
          grid-template-columns: 1fr;
        }
      }

      &__text {
        white-space: nowrap;
        align-self: center;
        justify-self: right;
        font-family: 'Lato';
        font-size: 14px;
      }

    }
  }

  &__text {
    margin-top: 0.5rem;
  }
}
</style>
