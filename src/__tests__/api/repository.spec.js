import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from '@/api/request';
import utils from '@/api/utils';
import repository from '@/api/repository';
import qs from '@/utils/QueryString.js';

vi.mock('@/api/request', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      options: vi.fn(),
    },
  },
}));

vi.mock('@/utils/QueryString.js', () => ({
  default: {
    stringify: vi.fn(),
  },
}));

vi.mock('@/api/utils', () => ({
  default: {
    Page: vi.fn().mockImplementation(() => ({})),
  },
}));

describe('repository.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get new schema', async () => {
    const mockData = { actions: { POST: { field1: 'value1' } } };
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await repository.getNewSchema();

    expect(request.$http.options).toHaveBeenCalledWith(
      '/v2/repository/repository-details',
    );
    expect(result).toEqual(mockData.actions.POST);
  });

  it('should get QA knowledge bases', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getQAKnowledgeBases('repoUUID', 1);

    expect(request.$http.get).toHaveBeenCalledWith(
      'v2/repository/qa/knowledge-base/',
      {
        params: {
          repository_uuid: 'repoUUID',
          limit: 20,
          offset: 20,
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get QA knowledge bases next', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getQAKnowledgeBasesNext({
      repositoryUUID: 'repoUUID',
      limit: 10,
      offset: 20,
      next: 'nextPageUrl',
    });

    expect(request.$http.get).toHaveBeenCalledWith('nextPageUrl');
    expect(result).toEqual(mockResponse);
  });

  it('should create QA knowledge base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.createQAKnowledgeBase(
      'repoUUID',
      'New Title',
    );

    expect(request.$http.post).toHaveBeenCalledWith(
      'v2/repository/qa/knowledge-base/',
      {
        repository: 'repoUUID',
        title: 'New Title',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit QA knowledge base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await repository.editQAKnowledgeBase(
      'repoUUID',
      'Updated Title',
      'kbID',
    );

    expect(request.$http.patch).toHaveBeenCalledWith(
      `v2/repository/qa/knowledge-base/kbID/`,
      { title: 'Updated Title' },
      { params: { repository_uuid: 'repoUUID' } },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get QA knowledge base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getQAKnowledgeBase('repoUUID', 'kbID');

    expect(request.$http.get).toHaveBeenCalledWith(
      'v2/repository/qa/knowledge-base/kbID/',
      {
        params: { repository_uuid: 'repoUUID' },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete QA knowledge base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await repository.deleteQAKnowledgeBase('repoUUID', 'kbID');

    expect(request.$http.delete).toHaveBeenCalledWith(
      'v2/repository/qa/knowledge-base/kbID/',
      {
        params: { repository_uuid: 'repoUUID' },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get QA texts', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getQATexts('repoUUID', 'kbID', 1);

    expect(request.$http.get).toHaveBeenCalledWith('v2/repository/qa/text/', {
      params: {
        repository_uuid: 'repoUUID',
        knowledge_base_id: 'kbID',
        limit: 20,
        offset: 20,
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it('should create QA text', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.createQAText(
      'repoUUID',
      'kbID',
      'Text',
      'en',
    );

    expect(request.$http.post).toHaveBeenCalledWith('v2/repository/qa/text/', {
      repository_uuid: 'repoUUID',
      knowledge_base: 'kbID',
      text: 'Text',
      language: 'en',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should update QA text', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await repository.updateQAText(
      'repoUUID',
      'kbID',
      'textID',
      'Updated Text',
      'en',
    );

    expect(request.$http.put).toHaveBeenCalledWith(
      `v2/repository/qa/text/textID/`,
      { knowledge_base: 'kbID', text: 'Updated Text', language: 'en' },
      { params: { repository_uuid: 'repoUUID' } },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get all repositories', async () => {
    const mockResponse = { data: 'mockData' };
    utils.Page.mockReturnValue(mockResponse);

    const result = await repository.getAll(10);

    expect(utils.Page).toHaveBeenCalledWith('/repository/repositories/', 10);
    expect(result).toEqual(mockResponse);
  });

  it('should get versions', async () => {
    const mockResponse = { data: 'mockData' };
    utils.Page.mockReturnValue(mockResponse);

    const result = await repository.getVersions(10, { some: 'query' });

    expect(utils.Page).toHaveBeenCalledWith('/v2/repository/version/', 10, {
      some: 'query',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should search logs', async () => {
    const mockResponse = { data: 'mockData' };
    utils.Page.mockReturnValue(mockResponse);

    const result = await repository.searchLogs(
      'repoLang',
      { query: 'search' },
      10,
    );

    expect(utils.Page).toHaveBeenCalledWith('/v2/repository/log/', 10, {
      repository_version_language: 'repoLang',
      query: 'search',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should make version default', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await repository.makeVersionDefault(
      'repoUUID',
      'versionUUID',
    );

    expect(request.$http.patch).toHaveBeenCalledWith(
      '/v2/repository/version/versionUUID/',
      {
        id: 'versionUUID',
        repository: 'repoUUID',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should add new version', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.addNewVersion(
      'repoUUID',
      'versionUUID',
      'New Version',
    );

    expect(request.$http.post).toHaveBeenCalledWith('/v2/repository/version/', {
      id: 'versionUUID',
      name: 'New Version',
      repository: 'repoUUID',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should get first five versions', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getFirstFiveVersions('repoUUID');

    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/repository/version/?repository=repoUUID&limit=5&ordering=-last_update`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should set default version', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await repository.setDefaultVersion('repoUUID', 'versionID');

    expect(request.$http.patch).toHaveBeenCalledWith(
      '/v2/repository/version/versionID/',
      {
        repository: 'repoUUID',
        id: 'versionID',
        is_default: true,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete version', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await repository.deleteVersion('versionID');

    expect(request.$http.delete).toHaveBeenCalledWith(
      '/v2/repository/version/versionID/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should search repositories', async () => {
    const mockResponse = { data: 'mockData' };
    qs.stringify.mockReturnValue('queryString');
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.search(10, 20);

    expect(qs.stringify).toHaveBeenCalledWith({ limit: 10, offset: 20 });
    expect(request.$http.get).toHaveBeenCalledWith(
      '/v2/repository/repositories/?queryString',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get community repositories', async () => {
    const mockResponse = { data: 'mockData' };
    qs.stringify.mockReturnValue('queryString');
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.communityRepository(
      20,
      0,
      'en',
      ['cat1'],
      true,
      false,
    );

    expect(qs.stringify).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      language: 'en',
      categories: ['cat1'],
      recommended: true,
      most_used: false,
    });
    expect(request.$http.get).toHaveBeenCalledWith(
      '/v2/repository/repositories/?queryString',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list public intelligences', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.listPublicIntelligences({
      next: 'nextUrl',
      params: { param: 'value' },
    });

    expect(request.$http.get).toHaveBeenCalledWith('nextUrl');
    expect(result).toEqual(mockResponse);
  });

  it('should search by organization', async () => {
    const mockResponse = { data: 'mockData' };
    utils.Page.mockReturnValue(mockResponse);

    const result = await repository.searchByOrg(
      'orgNickname',
      20,
      'searchText',
      ['cat1'],
      'en',
    );

    expect(utils.Page).toHaveBeenCalledWith(
      '/v2/repository/search-repositories/',
      20,
      {
        nickname: 'orgNickname',
        search: 'searchText',
        categories: ['cat1'],
        language: 'en',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit version', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await repository.editVersion(
      'repoUUID',
      'versionID',
      'Updated Version',
    );

    expect(request.$http.patch).toHaveBeenCalledWith(
      '/v2/repository/version/versionID/',
      {
        name: 'Updated Version',
        repository: 'repoUUID',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.get('ownerNickname', 'slug');

    expect(request.$http.get).toHaveBeenCalledWith(
      '/v1/repository/ownerNickname/slug/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should train repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.train('repoUUID', 'version', 'language');

    expect(request.$http.post).toHaveBeenCalledWith(
      `/v2/repository/repository-details/${'repoUUID'}/train/`,
      { repository_version: 'version', language: 'language' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should analyze repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.analyze(
      'repoUUID',
      'version',
      'language',
      'text',
    );

    expect(request.$http.post).toHaveBeenCalledWith(
      `/v2/repository/repository-details/${'repoUUID'}/analyze/`,
      { repository_version: 'version', language: 'language', text: 'text' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get repository info', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getRepositoryInfo('repoUUID', 'version');

    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/repository/info/${'repoUUID'}/${'version'}`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get projects with flows', async () => {
    const mockResponse = { data: 'mockData' };
    qs.stringify.mockReturnValue('queryString');
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getProjectsWithFlows('projectUUID');

    expect(qs.stringify).toHaveBeenCalledWith({ project_uuid: 'projectUUID' });
    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/repository/repositories/list_project_organizatiton/?queryString`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should debug parse repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.debugParse(
      'repoUUID',
      'version',
      'language',
      'text',
    );

    expect(request.$http.post).toHaveBeenCalledWith(
      `/v2/repository/repository-details/${'repoUUID'}/debug_parse/`,
      { repository_version: 'version', language: 'language', text: 'text' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get edit schema', async () => {
    const mockData = { actions: { PUT: { field1: 'value1' } } };
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await repository.getEditSchema('repoUuid');

    expect(request.$http.options).toHaveBeenCalledWith(
      `/v2/repository/repository-details/${'repoUuid'}/`,
    );
    expect(result).toEqual(mockData.actions.PUT);
  });

  it('should edit repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await repository.edit(
      'ownerNickname',
      'slug',
      'name',
      'newSlug',
      'language',
      ['category1'],
      'description',
      true,
      'algorithm',
      false,
      true,
      false,
      true,
      'repoUuid',
    );

    expect(request.$http.patch).toHaveBeenCalledWith(
      `/v2/repository/repository-details/${'repoUuid'}/`,
      {
        name: 'name',
        slug: 'newSlug',
        language: 'language',
        categories: ['category1'],
        description: 'description',
        is_private: true,
        algorithm: 'algorithm',
        use_competing_intents: false,
        use_name_entities: true,
        use_analyze_char: false,
        use_transformer_entities: true,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get languages status', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.getLanguagesStatus('repoUUID', 'version');

    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/repository/info/${'repoUUID'}/${'version'}/languagesstatus/`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should vote on repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.vote('ownerNickname', 'slug', 1);

    expect(request.$http.post).toHaveBeenCalledWith(
      `/v1/repository/ownerNickname/slug/vote/`,
      {
        vote: 1,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should vote up on repository', async () => {
    const mockResponse = { data: 'mockData' };
    vi.spyOn(repository, 'vote').mockResolvedValue(mockResponse);

    const result = await repository.voteUp('ownerNickname', 'slug');

    expect(repository.vote).toHaveBeenCalledWith('ownerNickname', 'slug', 1);
    expect(result).toEqual(mockResponse);
  });

  it('should vote down on repository', async () => {
    const mockResponse = { data: 'mockData' };
    vi.spyOn(repository, 'vote').mockResolvedValue(mockResponse);

    const result = await repository.voteDown('ownerNickname', 'slug');

    expect(repository.vote).toHaveBeenCalledWith('ownerNickname', 'slug', -1);
    expect(result).toEqual(mockResponse);
  });

  it('should update authorization role', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await repository.updateAuthorizationRole(
      'repoUUID',
      'userNickname',
      'role',
    );

    expect(request.$http.patch).toHaveBeenCalledWith(
      `/v2/repository/authorizations/${'repoUUID'}/${'userNickname'}/`,
      {
        role: 'role',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get authorization list', async () => {
    const mockResponse = { data: 'mockData' };
    utils.Page.mockReturnValue(mockResponse);

    const result = await repository.getAuthorizationList('repoUUID', 10);

    expect(utils.Page).toHaveBeenCalledWith(
      '/v2/repository/authorizations/',
      10,
      {
        repository: 'repoUUID',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get request authorization schema', async () => {
    const mockData = { actions: { POST: { field1: 'value1' } } };
    request.$http.options.mockResolvedValue({ data: mockData });

    const result = await repository.getRequestAuthorizationSchema();

    expect(request.$http.options).toHaveBeenCalledWith(
      '/v2/repository/authorization-requests/',
    );
    expect(result).toEqual(mockData.actions.POST);
  });

  it('should request authorization', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.requestAuthorization('repoUUID', 'text');

    expect(request.$http.post).toHaveBeenCalledWith(
      '/v2/repository/authorization-requests/',
      {
        repository: 'repoUUID',
        text: 'text',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should remove authorization', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await repository.removeAuthorization('repoUUID', 'id');

    expect(request.$http.delete).toHaveBeenCalledWith(
      `/v2/repository/authorization-requests/${'id'}/`,
      {
        repository: 'repoUUID',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get authorization requests list', async () => {
    const mockResponse = { data: 'mockData' };
    utils.Page.mockReturnValue(mockResponse);

    const result = await repository.getAuthorizationRequestsList(
      'repoUUID',
      20,
    );

    expect(utils.Page).toHaveBeenCalledWith(
      '/v2/repository/authorization-requests/',
      20,
      {
        repository_uuid: 'repoUUID',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should approve request authorization', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await repository.approveRequestAuthorization(
      'repoUUID',
      'id',
    );

    expect(request.$http.put).toHaveBeenCalledWith(
      `/v2/repository/authorization-requests/${'id'}/`,
      {
        repository: 'repoUUID',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should reject request authorization', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await repository.rejectRequestAuthorization('id');

    expect(request.$http.delete).toHaveBeenCalledWith(
      `/v2/repository/authorization-requests/${'id'}/`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get repository status training', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);
    qs.stringify.mockReturnValue(
      'repository_uuid=repoUUID&repository_version=repoVersion&type_processing=0',
    );

    const result = await repository.repositoryStatusTraining(
      'repoUUID',
      'repoVersion',
    );

    expect(request.$http.get).toHaveBeenCalledWith(
      '/v2/repository/task-queue/?repository_uuid=repoUUID&repository_version=repoVersion&type_processing=0',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get repository requirements', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await repository.repositoryRequirements(
      'repoUUID',
      'repoVersion',
      'repoLanguage',
    );

    expect(request.$http.get).toHaveBeenCalledWith(
      `/v2/repository/train/info/${'repoUUID'}/${'repoVersion'}/${'repoLanguage'}`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should migrate repository data', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.repositoryMigrateData(
      'repoVersion',
      'AuthToken',
      'Language',
      'Classifier',
    );

    expect(request.$http.post).toHaveBeenCalledWith(
      '/v2/repository/repository-migrate/',
      {
        repository_version: 'repoVersion',
        auth_token: 'AuthToken',
        language: 'Language',
        classifier: 'Classifier',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should upload rasa file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await repository.repositoryUploadRasa(
      'formData',
      'repoVersion',
      'repoUUID',
    );

    expect(request.$http.put).toHaveBeenCalledWith(
      `/v2/repository/upload-rasa-file/${'repoUUID'}/${'repoVersion'}/`,
      'formData',
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should clone repository', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await repository.clone('repoUUID', 'ownerId');

    expect(request.$http.post).toHaveBeenCalledWith(
      '/v2/repository/clone-repository/',
      {
        repository: 'repoUUID',
        owner: 'ownerId',
      },
    );
    expect(result).toEqual(mockResponse);
  });
});
