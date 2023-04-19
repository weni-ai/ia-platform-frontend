<template>
  <div>
    <unnnic-select
      :label="$t('webapp.analyze_text.language')"
      :placeholder="$t('webapp.analyze_text.language')"
      v-model="language"
    >
      <option
        v-for="[option, label] in languageList"
        :key="option"
        :value="option"
        @select="language = option"
      >
        {{ label }}
      </option>
    </unnnic-select>
    <unnnic-text-area
      :label="$t('webapp.analyze_text.message')"
      :placeholder="$t('webapp.analyze_text.message_placeholder')"
      v-model="text"
    />
    <unnnic-tab initialTab="first" :tabs="tabs">
      <template slot="tab-head-first">
        cURL
      </template>
      <template slot="tab-panel-first">
        <highlighted-code
          :code="codes.curl"
          code-class="bash"
          :style="{ padding: '24px 0px' }" />
      </template>
      <template slot="tab-head-second">
        Python
      </template>
      <template slot="tab-panel-second">
        <highlighted-code
          :code="codes.python"
          code-class="python"
          :style="{ padding: '24px 0px' }" />
      </template>
      <template slot="tab-head-third">
        Javascript
      </template>
      <template slot="tab-panel-third">
        <highlighted-code
          :code="codes.javascript"
          code-class="javascript"
          :style="{ padding: '24px 0px' }"/>
      </template>
    </unnnic-tab>
  </div>
</template>

<script>
import HighlightedCode from '@/components/shared/HighlightedCode';
import { LANGUAGES } from '@/utils';

const components = {
  HighlightedCode,
};

export default {
  name: 'RequestGenerator',
  components,
  props: {
    authorizationUuid: {
      type: String,
      required: true,
    },
    defaultLanguageField: {
      type: String,
      default: LANGUAGES[Object.keys(LANGUAGES)[0]],
    },
  },
  data() {
    return {
      activeTab: 0,
      language: this.defaultLanguageField,
      text: '',
      tabs: ['first', 'second', 'third'],
    };
  },
  computed: {
    languageList() {
      return Object.keys(LANGUAGES)
        .map(lang => ([lang, LANGUAGES[lang]]));
    },
    text_escaped() {
      return {
        curl: this.text
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"'),
        python: this.text
          .replace(/\\/g, '\\\\')
          .replace(/'/g, '\\\''),
        javascript: this.text
          .replace(/\\/g, '\\\\')
          .replace(/'/g, '\\\''),
      };
    },
    codes() {
      return {
        curl: [
          `  curl --location '${runtimeVariables.get('VUE_APP_BOTHUB_NLP_BASE_URL')}v2/parse/' \\`,
          `  --header 'Authorization: ${this.authorizationUuid}' \\`,
          '  --header Content-Type: application/json \\',
          '  --data { ',
          `  "language": ${this.language}, `,
          `  "text": ${this.text_escaped.curl} `,
          '  } ',
        ].join('\n'),
        python: [
          'import requests',
          '',
          'data = {',
          `  'language': '${this.language}',`,
          `  'text': '${this.text_escaped.python}',`,
          '}',
          '',
          `headers = { 'Authorization': '${this.authorizationUuid}' }`,
          `r = requests.post('${runtimeVariables.get('VUE_APP_BOTHUB_NLP_BASE_URL')}v2/parse/', headers=headers, data=data)`,
          'print(r.json())',
        ].join('\n'),
        javascript: [
          'var data = new FormData();',
          `data.append('language', '${this.language}');`,
          `data.append('text', '${this.text_escaped.javascript}');`,
          '',
          'var request = new XMLHttpRequest();',
          'request.onload = function () {',
          '  console.log(JSON.parse(request.response));',
          '};',
          '',
          `request.open('POST', '${runtimeVariables.get('VUE_APP_BOTHUB_NLP_BASE_URL')}v2/parse/');`,
          `request.setRequestHeader('Authorization', '${this.authorizationUuid}');`,
          'request.send(data);',
        ].join('\n'),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/dist/unnnic.css";
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";

.unnnic-select {

  /deep/ .input {
    height: 46px;
  }
  /deep/ .dropdown {
    display: block;
  }
}

.unnnic-text-area {
  margin-top: $unnnic-spacing-stack-sm;

  /deep/ .label {
    margin-bottom: $unnnic-spacing-stack-xs;
  }
}

.tab {
  margin-top: $unnnic-spacing-stack-lg;
}
</style>
