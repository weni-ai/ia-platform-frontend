import qs from '../utils/QueryString.js';

import utils from './utils';

export default {
  search(repositoryUuid, query = {}) {
    const queryString = qs.stringify({
      repository_uuid: repositoryUuid,
      ...query,
    });
    return new utils.List(`/v1/updates/?${queryString}`);
  },
};
