import request from '@/api/nexusaiRequest';
import { cleanParams } from '@/utils/http';

export const Monitoring = {
  messages: {
    async list({
      projectUuid,
      page,
      pageInterval,
      tag,
      text,
      started_day,
      ended_day,
    }) {
      const params = cleanParams({
        tag,
        text,
        started_day,
        ended_day,
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
        data: results.map(
          ({ id, created_at, message_text, tag, classification }) => ({
            created_at,
            id,
            text: message_text,
            tag,
            action_name: classification,
          }),
        ),
      };
    },

    async detail({ projectUuid, id }) {
      const { data } = await request.$http.get(
        `api/${projectUuid}/message-detail/${id}`,
      );

      return data;
    },

    async performance({ projectUuid, started_day, ended_day }) {
      const params = cleanParams({
        started_day,
        ended_day,
      });
      const { data } = await request.$http.get(
        `api/${projectUuid}/tags-analytics/`,
        {
          params,
        },
      );

      return data;
    },
  },
};
