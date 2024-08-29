import VERBOSE_LANGUAGES from './verbose_languages';

export const languageListToDict = (list) =>
  list.reduce((current, lang) => {
    Object.assign(current, { [lang]: VERBOSE_LANGUAGES[lang] || lang });
    return current;
  }, {});

export const LANGUAGES = languageListToDict(
  runtimeVariables
    .get('VITE_SUPPORTED_LANGUAGES')
    .split('|')
    .map((v) => v.split(':')[0]),
);

export const WENIGPT_OPTIONS = JSON.parse(
  runtimeVariables.get('VITE_OPTIONS_WENIGPT'),
);

export const BRAIN_ROUTES = [
  { title: 'personalization', page: 'router-personalization', icon: 'person' },
  { title: 'content', page: 'router-content', icon: 'article' },
  { title: 'actions', page: 'router-actions', icon: 'bolt' },
  { title: 'tunings', page: 'router-tunings', icon: 'settings' },
];

export const createDownloadAnchor = ({ name, href }) => {
  const a = document.createElement('a');

  a.setAttribute('download', name);
  a.setAttribute('href', href);

  return a;
};
