import nexusaiAPI from '@/api/nexusaiAPI';
import { usePagination } from './pagination';

export function useFilesPagination({ contentBaseUuid }) {
  return usePagination({
    loadNextFn: nexusaiAPI.intelligences.contentBases.files.list,
    params: {
      contentBaseUuid,
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
}
