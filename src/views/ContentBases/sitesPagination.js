import nexusaiAPI from '@/api/nexusaiAPI';
import { usePagination } from './pagination';

export function useSitesPagination({ contentBaseUuid }) {
  const loadSites = async (params) => {
    const { data } =
      await nexusaiAPI.intelligences.contentBases.sites.list(params);

    return {
      data: {
        results: data,
      },
    };
  };

  return usePagination({
    load: {
      request: loadSites,
      params: {
        contentBaseUuid,
      },
    },
    transform: (site) => ({
      ...site,
      extension_file: 'site',
      created_file_name: site.link,
      status:
        {
          Processing: 'processing',
          success: 'uploaded',
        }[site.status] || site.status,
    }),
  });
}
