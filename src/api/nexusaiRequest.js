import axios from 'axios';
import * as Sentry from '@sentry/browser';
import store from '../store';
import i18n from '../utils/plugins/i18n';
import { get } from 'lodash';

export default {
  get $http() {
    const client = axios.create({
      baseURL: runtimeVariables.get('NEXUS_API_BASE_URL'),
      headers: {
        ...(store.getters.authenticated
          ? { Authorization: `${store.getters.authToken}` }
          : {}),
      },
    });
    client.interceptors.response.use(
      (res) => res,
      (err) => {
        Sentry.captureException(err);

        if (get(err, 'config.hideGenericErrorAlert')) {
          throw err;
        }

        const statusCode = get(err, 'response.status');
        let defaultMessage;

        if ([500, 408].includes(statusCode)) {
          defaultMessage = i18n.global.t('internal_server_error');
        } else if (statusCode === 401) {
          defaultMessage = i18n.global.t('unauthorized');
        } else {
          defaultMessage = i18n.global.t('unexpected_error');
        }

        store.state.alert = {
          text: get(err, 'response.data.detail') || defaultMessage,
          type: 'error',
        };

        throw err;
      },
    );
    return client;
  },
};
