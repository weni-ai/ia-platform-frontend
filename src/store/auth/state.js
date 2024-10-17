export default {
  token: null,
  org: null,
  project: null,
  connectOrgUuid: sessionStorage.getItem('orgUuid') || null,
  connectProjectUuid: sessionStorage.getItem('projectUuid') || null,
};
