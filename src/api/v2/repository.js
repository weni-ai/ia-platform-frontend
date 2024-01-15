import request from '@/api/request';

export default {
  get(repositoryUuid) {
    return request.$http.get(`/v2/repository/${repositoryUuid}/`);
  },

  shortcut(ownerNickname, slug) {
    return request.$http.get(
      `/v2/repository-shortcut/${ownerNickname}/${slug}/`,
    );
  },

  create({
    name,
    description,
    language,
    repository_type,
    categories,
    organization,
    is_private,
  }) {
    return request.$http.post('v2/repository/repository-details/', {
      name,
      description,
      language,
      repository_type,
      categories,
      organization,
      is_private,
    });
  },
};
