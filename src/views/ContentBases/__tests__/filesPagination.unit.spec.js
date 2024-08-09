import nexusaiAPI from '@/api/nexusaiAPI';
import { useFilesPagination } from '@/views/ContentBases/filesPagination.js';

const filesListRequest = vi.spyOn(
  nexusaiAPI.intelligences.contentBases.files,
  'list',
);

describe('filesPagination.js', () => {
  let files;

  beforeEach(() => {
    vi.resetAllMocks();

    filesListRequest.mockResolvedValueOnce({
      data: {
        next: 'cursor-to-the-next',
        previous: null,
        results: [
          {
            uuid: '1',
            extension_file: 'pdf',
            created_file_name: 'file_one',
            status: 'success',
            file_name: 'file_one.pdf',
            created_at: '2024-08-08T00:00:00.000000Z',
          },
          {
            uuid: '2',
            extension_file: 'pdf',
            created_file_name: 'file_two',
            status: 'fail',
            file_name: 'file_two.pdf',
            created_at: '2024-08-08T00:00:00.000000Z',
          },
        ],
      },
    });

    filesListRequest.mockResolvedValueOnce({
      data: {
        next: null,
        previous: 'cursor-to-the-previous',
        results: [
          {
            uuid: '3',
            extension_file: 'pdf',
            created_file_name: 'file_three',
            status: 'success',
            file_name: 'file_three.pdf',
            created_at: '2024-08-08T00:00:00.000000Z',
          },
        ],
      },
    });

    files = useFilesPagination({ contentBaseUuid: '1234' });
  });

  it('status should be null', () => {
    expect(files.status.value).toBe(null);
  });

  describe('when the user wants to load the first page', () => {
    it('status should be loading', () => {
      files.loadNext();

      expect(files.status.value).toBe('loading');
    });

    describe('when the first page is loaded and there is a second page', () => {
      beforeEach(() => {
        files.loadNext();
      });

      it('status should be null', () => {
        expect(files.status.value).toBe(null);
      });

      describe('when the user wants to load the second and last page', () => {
        beforeEach(() => {
          files.loadNext();
        });

        it('status should be complete', () => {
          expect(files.status.value).toBe('complete');
        });

        it('data should be correct and transformed', () => {
          expect(files.data.value).toEqual([
            {
              uuid: '1',
              extension_file: 'pdf',
              created_file_name: 'file_one',
              status: 'uploaded',
              file_name: 'file_one.pdf',
              created_at: '2024-08-08T00:00:00.000000Z',
            },
            {
              uuid: '2',
              extension_file: 'pdf',
              created_file_name: 'file_two',
              status: 'fail',
              file_name: 'file_two.pdf',
              created_at: '2024-08-08T00:00:00.000000Z',
            },
            {
              uuid: '3',
              extension_file: 'pdf',
              created_file_name: 'file_three',
              status: 'uploaded',
              file_name: 'file_three.pdf',
              created_at: '2024-08-08T00:00:00.000000Z',
            },
          ]);
        });
      });
    });
  });
});
