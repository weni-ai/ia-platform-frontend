import nexusaiAPI from '@/api/nexusaiAPI';
import { usePagination } from './pagination';
import { useIndexingProcess } from '@/views/ContentBases/indexingProcess.js';

export function useFilesPagination({ contentBaseUuid }) {
  const pagination = usePagination({
    load: {
      request: nexusaiAPI.intelligences.contentBases.files.list,
      params: {
        contentBaseUuid,
      },
    },
    transform: (file) => ({
      ...file,
      status:
        {
          Processing: 'processing',
          success: 'uploaded',
        }[file.status] || file.status,
    }),
  });

  useIndexingProcess(pagination.data, 'files', contentBaseUuid);

  return pagination;
}
