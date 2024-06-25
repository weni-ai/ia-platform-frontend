import { AxiosError } from 'axios';
import { get } from 'lodash';
import store from '../store';

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof AxiosError) {
    const { reason } = event;

    const obstructiveErrorProducer = get(
      reason,
      'config.obstructiveErrorProducer',
      false,
    );

    const statusCode = get(reason, 'response.status');

    if (!obstructiveErrorProducer) {
      return;
    }

    if (statusCode === 401) {
      store.state.obstructiveError = 'unauthorized';
    } else {
      store.state.obstructiveError = 'default';
    }
  }
});
