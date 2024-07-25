import { describe, it, expect, vi, beforeEach } from 'vitest';
import repository from '@/api/repository';
import actions from '@/store/repository/actions';

vi.mock('@/api/repository', () => ({
  default: {
    getNewSchema: vi.fn(),
    getQAKnowledgeBases: vi.fn(),
    getQAKnowledgeBasesNext: vi.fn(),
    createQAKnowledgeBase: vi.fn(),
    editQAKnowledgeBase: vi.fn(),
    getQAKnowledgeBase: vi.fn(),
    deleteQAKnowledgeBase: vi.fn(),
    getQATexts: vi.fn(),
    createQAText: vi.fn(),
    updateQAText: vi.fn(),
    getVersions: vi.fn(),
    getFirstFiveVersions: vi.fn(),
    setDefaultVersion: vi.fn(),
    editVersion: vi.fn(),
    deleteVersion: vi.fn(),
    addNewVersion: vi.fn(),
    getAll: vi.fn(),
    search: vi.fn(),
    getProjectsWithFlows: vi.fn(),
    communityRepository: vi.fn(),
    get: vi.fn(),
    train: vi.fn(),
    debugParse: vi.fn(),
    searchLogs: vi.fn(),
    analyze: vi.fn(),
    getEditSchema: vi.fn(),
    getRepositoryInfo: vi.fn(),
    edit: vi.fn(),
    getLanguagesStatus: vi.fn(),
    voteUp: vi.fn(),
    voteDown: vi.fn(),
    repositoryStatusTraining: vi.fn(),
    updateAuthorizationRole: vi.fn(),
    getAuthorizationList: vi.fn(),
    getRequestAuthorizationSchema: vi.fn(),
    requestAuthorization: vi.fn(),
    getAuthorizationRequestsList: vi.fn(),
    approveRequestAuthorization: vi.fn(),
    removeAuthorization: vi.fn(),
    rejectRequestAuthorization: vi.fn(),
    repositoryRequirements: vi.fn(),
    repositoryMigrateData: vi.fn(),
    repositoryUploadRasa: vi.fn(),
    clone: vi.fn(),
  },
}));

describe('@/store/repository/actions', () => {
  const commit = vi.fn();
  const dispatch = vi.fn();
  const store = { commit, dispatch };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNewRepositorySchema should call repository.getNewSchema', async () => {
    const mockResponse = { data: 'schema' };
    repository.getNewSchema.mockResolvedValue(mockResponse);

    const result = await actions.getNewRepositorySchema();
    expect(result).toBe(mockResponse);
    expect(repository.getNewSchema).toHaveBeenCalled();
  });

  it('getQAKnowledgeBases should call repository.getQAKnowledgeBases', () => {
    const params = { repositoryUUID: 'uuid', page: 1 };
    actions.getQAKnowledgeBases(store, params);
    expect(repository.getQAKnowledgeBases).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.page,
    );
  });

  it('getQAKnowledgeBasesNext should call repository.getQAKnowledgeBasesNext', () => {
    const params = { nextPageToken: 'token' };
    actions.getQAKnowledgeBasesNext(store, params);
    expect(repository.getQAKnowledgeBasesNext).toHaveBeenCalledWith(params);
  });

  it('createQAKnowledgeBase should call repository.createQAKnowledgeBase', () => {
    const params = { repositoryUUID: 'uuid', title: 'title' };
    actions.createQAKnowledgeBase(store, params);
    expect(repository.createQAKnowledgeBase).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.title,
    );
  });

  it('editQAKnowledgeBase should call repository.editQAKnowledgeBase', () => {
    const params = { repositoryUUID: 'uuid', title: 'title', id: 'id' };
    actions.editQAKnowledgeBase(store, params);
    expect(repository.editQAKnowledgeBase).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.title,
      params.id,
    );
  });

  it('getQAKnowledgeBase should call repository.getQAKnowledgeBase', () => {
    const params = { repositoryUUID: 'uuid', id: 'id' };
    actions.getQAKnowledgeBase(store, params);
    expect(repository.getQAKnowledgeBase).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.id,
    );
  });

  it('deleteQAKnowledgeBase should call repository.deleteQAKnowledgeBase', () => {
    const params = { repositoryUUID: 'uuid', id: 'id' };
    actions.deleteQAKnowledgeBase(store, params);
    expect(repository.deleteQAKnowledgeBase).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.id,
    );
  });

  it('getQATexts should call repository.getQATexts', () => {
    const params = { repositoryUUID: 'uuid', knowledgeBaseId: 'id', page: 1 };
    actions.getQATexts(store, params);
    expect(repository.getQATexts).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.knowledgeBaseId,
      params.page,
    );
  });

  it('createQAText should call repository.createQAText', () => {
    const params = {
      repositoryUUID: 'uuid',
      knowledgeBaseId: 'id',
      text: 'text',
      language: 'en',
    };
    actions.createQAText(store, params);
    expect(repository.createQAText).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.knowledgeBaseId,
      params.text,
      params.language,
    );
  });

  it('updateQAText should call repository.updateQAText', () => {
    const params = {
      repositoryUUID: 'uuid',
      knowledgeBaseId: 'id',
      id: 'id',
      text: 'text',
      language: 'en',
    };
    actions.updateQAText(store, params);
    expect(repository.updateQAText).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.knowledgeBaseId,
      params.id,
      params.text,
      params.language,
    );
  });

  it('getVersions should call repository.getVersions', () => {
    const params = { limit: 10, query: 'query' };
    actions.getVersions(store, params);
    expect(repository.getVersions).toHaveBeenCalledWith(
      params.limit,
      params.query,
    );
  });

  it('getFirstFiveVersions should call repository.getFirstFiveVersions', () => {
    const params = 'uuid';
    actions.getFirstFiveVersions(store, params);
    expect(repository.getFirstFiveVersions).toHaveBeenCalledWith(params);
  });

  it('setDefaultVersion should call repository.setDefaultVersion', () => {
    const params = { repositoryUuid: 'uuid', id: 'id' };
    actions.setDefaultVersion(store, params);
    expect(repository.setDefaultVersion).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.id,
    );
  });

  it('editVersion should call repository.editVersion', () => {
    const params = { repositoryUuid: 'uuid', id: 'id', name: 'name' };
    actions.editVersion(store, params);
    expect(repository.editVersion).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.id,
      params.name,
    );
  });

  it('deleteVersion should call repository.deleteVersion', () => {
    const params = 'id';
    actions.deleteVersion(store, params);
    expect(repository.deleteVersion).toHaveBeenCalledWith(params);
  });

  it('addNewVersion should call repository.addNewVersion', () => {
    const params = {
      repositoryUUID: 'uuid',
      versionUUID: 'version',
      name: 'name',
    };
    actions.addNewVersion(store, params);
    expect(repository.addNewVersion).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.versionUUID,
      params.name,
    );
  });

  it('getAllRepositories should call repository.getAll', () => {
    const params = 20;
    actions.getAllRepositories(params);
    expect(repository.getAll).toHaveBeenCalledWith(params);
  });

  it('searchRepositories should call repository.search', () => {
    const params = { limit: 10, offset: 0 };
    actions.searchRepositories(store, params.limit, params.offset);
    expect(repository.search).toHaveBeenCalledWith(params.limit, params.offset);
  });

  it('searchProjectWithFlow should call repository.getProjectsWithFlows', () => {
    const params = { projectUUID: 'uuid' };
    actions.searchProjectWithFlow(store, params);
    expect(repository.getProjectsWithFlows).toHaveBeenCalledWith(
      params.projectUUID,
    );
  });

  it('getCommunityRepository should call repository.communityRepository', () => {
    const params = {
      limit: 10,
      offset: 0,
      language: 'en',
      categories: [],
      recommended: true,
      most_used: false,
    };
    actions.getCommunityRepository(
      store,
      params.limit,
      params.offset,
      params.language,
      params.categories,
      params.recommended,
      params.most_used,
    );
    expect(repository.communityRepository).toHaveBeenCalledWith(
      params.limit,
      params.offset,
      params.language,
      params.categories,
      params.recommended,
      params.most_used,
    );
  });

  it('getRepository should call repository.get', () => {
    const params = { ownerNickname: 'owner', slug: 'slug' };
    actions.getRepository(store, params);
    expect(repository.get).toHaveBeenCalledWith(
      params.ownerNickname,
      params.slug,
    );
  });

  it('trainRepository should call repository.train', () => {
    const params = {
      repositoryUuid: 'uuid',
      repositoryVersion: 'version',
      repositoryLanguage: 'en',
    };
    actions.trainRepository(store, params);
    expect(repository.train).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.repositoryVersion,
      params.repositoryLanguage,
    );
  });

  it('debugParse should call repository.debugParse', () => {
    const params = {
      repositoryUUID: 'uuid',
      repositoryVersion: 'version',
      language: 'en',
      text: 'text',
    };
    actions.debugParse(store, params);
    expect(repository.debugParse).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.repositoryVersion,
      params.language,
      params.text,
    );
  });

  it('searchLogs should call repository.searchLogs', () => {
    const params = {
      repositoryVersionLanguage: 'en',
      query: 'query',
      limit: 10,
    };
    actions.searchLogs(store, params);
    expect(repository.searchLogs).toHaveBeenCalledWith(
      params.repositoryVersionLanguage,
      params.query,
      params.limit,
    );
  });

  it('analyzeText should call repository.analyze', () => {
    const params = {
      repositoryUUID: 'uuid',
      repositoryVersion: 'version',
      language: 'en',
      text: 'text',
    };
    actions.analyzeText(store, params);
    expect(repository.analyze).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.repositoryVersion,
      params.language,
      params.text,
    );
  });

  it('getEditRepositorySchema should call repository.getEditSchema', async () => {
    const params = { repositoryUuid: 'uuid', repositoryVersion: 'version' };
    const mockResponse = { data: 'edit-schema' };
    repository.getEditSchema.mockResolvedValue(mockResponse);

    const result = await actions.getEditRepositorySchema(store, params);
    expect(result).toBe(mockResponse);
    expect(repository.getEditSchema).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.repositoryVersion,
    );
  });

  it('getTrainingStatus should call repository.getRepositoryInfo and return correct data', async () => {
    const params = { repositoryUUID: 'uuid', version: 'version' };
    const mockResponse = {
      data: {
        ready_for_train: true,
        requirements_to_train: ['requirement'],
        languages_warnings: ['warning'],
        examples__count: 10,
        evaluate_languages_count: 5,
        intents_list: ['intent'],
      },
    };
    repository.getRepositoryInfo.mockResolvedValue(mockResponse);

    const result = await actions.getTrainingStatus(store, params);
    expect(result).toEqual(mockResponse.data);
    expect(repository.getRepositoryInfo).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.version,
    );
  });

  it('editRepository should call repository.edit', () => {
    const params = {
      ownerNickname: 'owner',
      repositorySlug: 'slug',
      name: 'name',
      slug: 'new-slug',
      language: 'en',
      categories: ['cat'],
      description: 'desc',
      is_private: true,
      algorithm: 'algo',
      use_competing_intents: true,
      use_name_entities: true,
      use_analyze_char: true,
      use_transformer_entities: true,
      repositoryUuid: 'uuid',
    };
    actions.editRepository(store, params);
    expect(repository.edit).toHaveBeenCalledWith(
      params.ownerNickname,
      params.repositorySlug,
      params.name,
      params.slug,
      params.language,
      params.categories,
      params.description,
      params.is_private,
      params.algorithm,
      params.use_competing_intents,
      params.use_name_entities,
      params.use_analyze_char,
      params.use_transformer_entities,
      params.repositoryUuid,
    );
  });

  it('getRepositoryLanguagesStatus should call repository.getLanguagesStatus', () => {
    const params = { repositoryUUID: 'uuid', version: 'version' };
    actions.getRepositoryLanguagesStatus(store, params);
    expect(repository.getLanguagesStatus).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.version,
    );
  });

  it('repositoryVoteUp should call repository.voteUp', () => {
    const params = { ownerNickname: 'owner', slug: 'slug' };
    actions.repositoryVoteUp(store, params);
    expect(repository.voteUp).toHaveBeenCalledWith(
      params.ownerNickname,
      params.slug,
    );
  });

  it('repositoryVoteDown should call repository.voteDown', () => {
    const params = { ownerNickname: 'owner', slug: 'slug' };
    actions.repositoryVoteDown(store, params);
    expect(repository.voteDown).toHaveBeenCalledWith(
      params.ownerNickname,
      params.slug,
    );
  });

  it('getRepositoryStatusTraining should call repository.repositoryStatusTraining', () => {
    const params = { repositoryUUID: 'uuid', repositoryVersion: 'version' };
    actions.getRepositoryStatusTraining(store, params);
    expect(repository.repositoryStatusTraining).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.repositoryVersion,
    );
  });

  it('repositoryUpdateAuthorizationRole should call repository.updateAuthorizationRole', () => {
    const params = {
      repositoryUuid: 'uuid',
      userNickname: 'user',
      newRole: 'role',
    };
    actions.repositoryUpdateAuthorizationRole(store, params);
    expect(repository.updateAuthorizationRole).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.userNickname,
      params.newRole,
    );
  });

  it('setRepositoryTraining should call commit with updateRepositoryTraining', () => {
    const payload = { training: true };
    actions.setRepositoryTraining({ commit }, payload);
    expect(commit).toHaveBeenCalledWith('updateRepositoryTraining', payload);
  });

  it('repositoryAuthorizationList should call repository.getAuthorizationList', () => {
    const params = { repositoryUuid: 'uuid', limit: 20 };
    actions.repositoryAuthorizationList(store, params);
    expect(repository.getAuthorizationList).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.limit,
    );
  });

  it('getRequestRepositoryAuthorizationSchema should call repository.getRequestAuthorizationSchema', async () => {
    const mockResponse = { data: 'request-schema' };
    repository.getRequestAuthorizationSchema.mockResolvedValue(mockResponse);

    const result = await actions.getRequestRepositoryAuthorizationSchema();
    expect(result).toBe(mockResponse);
    expect(repository.getRequestAuthorizationSchema).toHaveBeenCalled();
  });

  it('requestRepositoryAuthorization should call repository.requestAuthorization', () => {
    const params = { repositoryUuid: 'uuid', text: 'text' };
    actions.requestRepositoryAuthorization(store, params);
    expect(repository.requestAuthorization).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.text,
    );
  });

  it('repositoryAuthorizationRequestsList should call repository.getAuthorizationRequestsList', () => {
    const params = { repositoryUuid: 'uuid' };
    actions.repositoryAuthorizationRequestsList(store, params);
    expect(repository.getAuthorizationRequestsList).toHaveBeenCalledWith(
      params.repositoryUuid,
    );
  });

  it('approveRequestAuthorization should call repository.approveRequestAuthorization', () => {
    const params = { repositoryUuid: 'uuid', id: 'id' };
    actions.approveRequestAuthorization(store, params);
    expect(repository.approveRequestAuthorization).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.id,
    );
  });

  it('removeAuthorization should call repository.removeAuthorization', () => {
    const params = { repositoryUuid: 'uuid', id: 'id' };
    actions.removeAuthorization(store, params);
    expect(repository.removeAuthorization).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.id,
    );
  });

  it('rejectRequestAuthorization should call repository.rejectRequestAuthorization', () => {
    const params = { id: 'id' };
    actions.rejectRequestAuthorization(store, params);
    expect(repository.rejectRequestAuthorization).toHaveBeenCalledWith(
      params.id,
    );
  });

  it('setUpdateVersionsState should call commit with updateVersionsState', () => {
    const payload = { version: 'v1' };
    actions.setUpdateVersionsState({ commit }, payload);
    expect(commit).toHaveBeenCalledWith('updateVersionsState', payload);
  });

  it('setUpdateRepository should call commit with updateRepository', () => {
    const payload = { repository: 'repo' };
    actions.setUpdateRepository({ commit }, payload);
    expect(commit).toHaveBeenCalledWith('updateRepository', payload);
  });

  it('setRepository should call commit with setRepository', () => {
    const payload = { repository: 'repo' };
    actions.setRepository({ commit }, payload);
    expect(commit).toHaveBeenCalledWith('setRepository', payload);
  });

  it('setRequirements should call commit with updateRequirements', () => {
    const payload = { requirements: 'reqs' };
    actions.setRequirements({ commit }, payload);
    expect(commit).toHaveBeenCalledWith('updateRequirements', payload);
  });

  it('setRepositoryRelatedUuid should call commit with SET_REPOSITORY_RELATED_UUID', async () => {
    const payload = { relatedUuid: 'uuid' };
    await actions.setRepositoryRelatedUuid({ commit }, payload);
    expect(commit).toHaveBeenCalledWith('SET_REPOSITORY_RELATED_UUID', payload);
  });

  it('setRepositoryVersion should call commit with setRepositoryVersion', () => {
    const payload = { version: 'v1' };
    actions.setRepositoryVersion({ commit }, payload);
    expect(commit).toHaveBeenCalledWith('setRepositoryVersion', payload);
  });

  it('resetRepositoryVersion should call commit with resetVersion', () => {
    actions.resetRepositoryVersion({ commit });
    expect(commit).toHaveBeenCalledWith('resetVersion');
  });

  it('getRepositoryRequirements should call repository.repositoryRequirements', () => {
    const params = {
      repositoryUuid: 'uuid',
      version: 'version',
      repositoryLanguage: 'en',
    };
    actions.getRepositoryRequirements(store, params);
    expect(repository.repositoryRequirements).toHaveBeenCalledWith(
      params.repositoryUuid,
      params.version,
      params.repositoryLanguage,
    );
  });

  it('setMigrateIntelligence should call repository.repositoryMigrateData', () => {
    const params = {
      repositoryVersion: 'version',
      AuthToken: 'token',
      Language: 'en',
      Classifier: 'classifier',
    };
    actions.setMigrateIntelligence(store, params);
    expect(repository.repositoryMigrateData).toHaveBeenCalledWith(
      params.repositoryVersion,
      params.AuthToken,
      params.Language,
      params.Classifier,
    );
  });

  it('setUploadRasaDataset should call repository.repositoryUploadRasa', () => {
    const params = {
      formData: 'data',
      repositoryVersion: 'version',
      repositoryUUID: 'uuid',
    };
    actions.setUploadRasaDataset(store, params);
    expect(repository.repositoryUploadRasa).toHaveBeenCalledWith(
      params.formData,
      params.repositoryVersion,
      params.repositoryUUID,
    );
  });

  it('cloneRepository should call repository.clone', () => {
    const params = { repositoryUUID: 'uuid', ownerId: 'owner' };
    actions.cloneRepository(store, params);
    expect(repository.clone).toHaveBeenCalledWith(
      params.repositoryUUID,
      params.ownerId,
    );
  });
});
