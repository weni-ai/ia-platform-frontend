export default {
  token: null,
  org: null,
  project: null,
  connectOrgUuid: null,
  connectProjectUuid: sessionStorage.getItem('projectUuid') || null,
};
