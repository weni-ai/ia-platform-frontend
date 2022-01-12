const runtimeVariables = (() => ({
  VUE_APP_SUPPORTED_LANGUAGES: 'en|pt',
  VUE_APP_VERSION: '0.0.0',
  VUE_APP_BOTHUB_NLP_BASE_URL: 'http://localhost:2657/',
  VUE_APP_BOTHUB_WEBAPP_BASE_URL: 'http://localhost:8080/',

  get(name){
    return this[name] || process.env[name]
  }

}))();
export default runtimeVariables;


