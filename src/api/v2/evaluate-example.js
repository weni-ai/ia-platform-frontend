import qs from 'query-string';

import request from '@/api/request';
import utils from '@/api/utils';


export default {
  new(repository, repositoryVersion, text, language, entities, intent, isCorrected) {
    return request.$http.post(
      '/v2/repository/evaluate/',
      {
        repository,
        repository_version: repositoryVersion,
        text,
        language,
        entities,
        intent,
        is_corrected: isCorrected,
      },
    );
  },
  update(repository, version, text, language, entities, intent, id) {
    return request.$http.patch(
      `/v2/repository/evaluate/${id}/`,
      {
        repository,
        repository_version: version,
        text,
        language,
        entities,
        intent,
      },
    );
  },
  all(repositoryUuid) {
    return this.search(repositoryUuid);
  },
  get(repositoryUuid, repositoryVersion) {
    const queryString = qs.stringify({
      repository_uuid: repositoryUuid,
      repository_version: repositoryVersion,
    });
    return request.$http.get(`/v2/repository/evaluate?${queryString}`);
  },
  delete(exampleId, repositoryUuid) {
    return request.$http.delete(`/v2/repository/evaluate/${exampleId}/?repository_uuid=${repositoryUuid}`);
  },
  search(repositoryUuid, repositoryVersion, query = {}, perPage = 20) {
    const searchQuery = {
      repository_uuid: repositoryUuid,
      repository_version: repositoryVersion,
      ...query,
    };
    return new utils.Page('/v2/repository/evaluate/results/', perPage, searchQuery);
  },
  getResultsData(repositoryUuid, resultId) {
    return request.$http.get(`/v2/repository/evaluate/results/${resultId}/?repository_uuid=${repositoryUuid}`);
  },
  getAllResultsLog(repositoryUuid, resultId, page = 1) {
    return request.$http.get(`/v2/repository/evaluate/results/${resultId}/?repository_uuid=${repositoryUuid}&page_intent=${page}`);
  },
  allVersions(repositoryUuid, version, perPage = 20, type) {
    return new utils.Page('/v2/repository/evaluate/results/', perPage, { repository_uuid: repositoryUuid, repository_version: version, type });
  },
  async resultSearch(repositoryUuid, query = {}) {
    const queryString = qs.stringify({
      repository_uuid: repositoryUuid,
      ...query,
    });
    return request.$http.get(`/v2/repository/evaluate/results/1/?${queryString}`);
  },
  runEvaluate(repositoryUUID, version, type) {
    return request.$http.post(
      `v2/repository/repository-details/${repositoryUUID}/evaluate/`,
      {
        repository_version: version,
        evaluate_type: type
      },
    );
  },
  getResults(repositoryUuid, query = {}) {
    const queryString = qs.stringify({
      repository_uuid: repositoryUuid,
      ...query,
    });
    return request.$http.get(`/v2/repository/evaluate/results/?${queryString}`);
  },
};
