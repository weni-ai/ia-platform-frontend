import nexusaiAPI from '@/api/nexusaiAPI';
import { useSitesPagination } from '@/views/ContentBases/sitesPagination.js';

vi.spyOn(nexusaiAPI.intelligences.contentBases.sites, 'list').mockResolvedValue(
  {
    data: [
      {
        uuid: '1',
        link: 'https://linkone.dev/',
        status: 'success',
        created_at: '2024-08-08T00:00:00.000000Z',
      },
      {
        uuid: '2',
        link: 'https://linktwo.dev/',
        status: 'fail',
        created_at: '2024-08-08T00:00:00.000000Z',
      },
      {
        uuid: '3',
        link: 'https://linkthree.dev/',
        status: 'success',
        created_at: '2024-08-08T00:00:00.000000Z',
      },
    ],
  },
);

describe('sitesPagination.js', () => {
  let sites;

  beforeEach(() => {
    vi.clearAllMocks();

    sites = useSitesPagination({ contentBaseUuid: '1234' });
  });

  it('status should be null', () => {
    expect(sites.status.value).toBe(null);
  });

  describe('when the user wants to load the first and only the one page', () => {
    it('status should be loading', () => {
      sites.loadNext();

      expect(sites.status.value).toBe('loading');
    });

    describe('when the first page is loaded and there is not a second page', () => {
      beforeEach(() => {
        sites.loadNext();
      });

      it('status should be complete', () => {
        expect(sites.status.value).toBe('complete');
      });

      it('data should be correct and transformed', () => {
        expect(sites.data.value).toEqual([
          {
            uuid: '1',
            link: 'https://linkone.dev/',
            status: 'uploaded',
            created_at: '2024-08-08T00:00:00.000000Z',
            extension_file: 'site',
            created_file_name: 'https://linkone.dev/',
          },
          {
            uuid: '2',
            link: 'https://linktwo.dev/',
            status: 'fail',
            created_at: '2024-08-08T00:00:00.000000Z',
            extension_file: 'site',
            created_file_name: 'https://linktwo.dev/',
          },
          {
            uuid: '3',
            link: 'https://linkthree.dev/',
            status: 'uploaded',
            created_at: '2024-08-08T00:00:00.000000Z',
            extension_file: 'site',
            created_file_name: 'https://linkthree.dev/',
          },
        ]);
      });
    });
  });
});
