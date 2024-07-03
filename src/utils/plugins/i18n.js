import * as VueI18n from 'vue-i18n';

import en from '../../locales/en.json';
import ptbr from '../../locales/pt_br.json';
import es from '../../locales/es.json';

const languages = {
  'en-US': en,
  'pt-BR': ptbr,
  es,
};

const numberFormats = {
  'en-US': {
    currency: {
      style: 'currency',
      currency: 'BRL',
      currencyDisplay: 'symbol',
    },
  },
  'pt-BR': {
    currency: {
      style: 'currency',
      currency: 'BRL',
      currencyDisplay: 'symbol',
    },
  },
  es: {
    currency: {
      style: 'currency',
      currency: 'BRL',
      currencyDisplay: 'symbol',
    },
  },
};

const messages = Object.assign(languages);

const i18n = VueI18n.createI18n({
  locale: navigator.language || navigator.userLanguage,
  fallbackLocale: 'en-US',
  messages,
  numberFormats,
});

export default i18n;
