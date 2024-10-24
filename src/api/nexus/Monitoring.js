import request from '@/api/nexusaiRequest';
import { cleanParams } from '@/utils/http';

export const Monitoring = {
  messages: {
    async list({ projectUuid, page, pageInterval, tag, text, started_day }) {
      const params = cleanParams({
        tag,
        text,
        started_day,
        page_size: pageInterval,
        page,
      });
      const {
        data: { results, count },
      } = await request.$http.get(`api/${projectUuid}/message_history/`, {
        params,
      });

      return {
        count,
        data: results.map(({ id, created_at, message_text, tag }) => ({
          created_at,
          id,
          text: message_text,
          tag,
        })),
      };
    },
  },
};
