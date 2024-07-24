import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from '@/api/nexusaiRequest';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/api/utils/forceHttps', () => ({
  default: vi.fn((url) => `https://${url}`),
}));

describe('nexusaiAPI.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a question', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.question.create({
      contentBaseUuid: 'baseUUID',
      text: 'Sample Question',
      language: 'en',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/v1/wenigpt_question/quick-test',
      {
        content_base_uuid: 'baseUUID',
        text: 'Sample Question',
        language: 'en',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create feedback', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.question.feedback.create({
      contentBaseUuid: 'uuid1',
      questionUuid: 'question1',
      value: 'positive',
      feedback: 'good',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/uuid1/content-base-logs/question1',
      {
        value: 'positive',
        feedback: 'good',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list intelligences', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.listIntelligences({ orgUuid: 'org1' });

    expect(request.$http.get).toHaveBeenCalledWith('api/org1/intelligences/');
    expect(result).toEqual(mockResponse);
  });

  it('should list intelligences with next page', async () => {
    const mockResponse = { data: 'mockData' };
    const nextPageUrl = 'example.com/next-page';
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.listIntelligences({ next: nextPageUrl });

    expect(request.$http.get).toHaveBeenCalledWith(`https://${nextPageUrl}`);
    expect(result).toEqual(mockResponse);
  });

  it('should create intelligence', async () => {
    const mockResponse = { data: 'mockData' };

    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.createIntelligence({
      orgUuid: 'org1',
      name: 'Intelligence Name',
      description: 'Description',
    });

    expect(request.$http.post).toHaveBeenCalledWith('api/org1/intelligences/', {
      name: 'Intelligence Name',
      description: 'Description',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should read intelligence', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.readIntelligence({
      orgUuid: 'org1',
      intelligenceUuid: 'intelligence1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/org1/intelligences/intelligence1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should update intelligence', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.updateIntelligence({
      orgUuid: 'org1',
      intelligenceUuid: 'intelligence1',
      name: 'Updated Name',
      description: 'Updated Description',
    });

    expect(request.$http.put).toHaveBeenCalledWith(
      'api/org1/intelligences/intelligence1/',
      {
        name: 'Updated Name',
        description: 'Updated Description',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete intelligence', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.deleteIntelligence({
      orgUuid: 'org1',
      intelligenceUuid: 'intelligence1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      'api/org1/intelligences/intelligence1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create intelligence content base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.createIntelligenceContentBase({
      intelligenceUuid: 'intelligence1',
      title: 'Content Base Title',
      language: 'en',
      description: 'Description',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/intelligence1/content-bases/',
      {
        title: 'Content Base Title',
        language: 'en',
        description: 'Description',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should patch intelligence content base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.patchIntelligenceContentBase({
      intelligenceUuid: 'intelligence1',
      contentBaseUuid: 'contentBase1',
      title: 'Updated Title',
      language: 'en',
      description: 'Updated Description',
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/intelligence1/content-bases/contentBase1/',
      {
        title: 'Updated Title',
        language: 'en',
        description: 'Updated Description',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list intelligences content bases', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.listIntelligencesContentBases({
      intelligenceUuid: 'intelligence1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/intelligence1/content-bases/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list intelligences content bases with next page', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.listIntelligencesContentBases({
      next: 'nextPageUrl',
    });

    expect(request.$http.get).toHaveBeenCalledWith('https://nextPageUrl');
    expect(result).toEqual(mockResponse);
  });

  it('should read intelligence content base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.readIntelligenceContentBase({
      intelligenceUuid: 'intelligence1',
      contentBaseUuid: 'contentBase1',
      obstructiveErrorProducer: '',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/intelligence1/content-bases/contentBase1/',
      {
        obstructiveErrorProducer: '',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete intelligence content base', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.deleteIntelligenceContentBase({
      intelligenceUuid: 'intelligence1',
      contentBaseUuid: 'contentBase1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      'api/intelligence1/content-bases/contentBase1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create content base text', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.texts.create({
      contentBaseUuid: 'contentBase1',
      text: 'Sample Text',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-text/',
      {
        text: 'Sample Text',
      },
      {
        routerName: 'contentBase-text-create',
        hideGenericErrorAlert: false,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit content base text', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.texts.edit({
      contentBaseUuid: 'contentBase1',
      contentBaseTextUuid: 'text1',
      text: 'Updated Text',
    });

    expect(request.$http.put).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-text/text1/',
      {
        text: 'Updated Text',
      },
      {
        routerName: 'contentBase-text-edit',
        hideGenericErrorAlert: false,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create content base link', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.create({
      contentBaseUuid: 'contentBase1',
      link: 'https://example.com',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/',
      {
        link: 'https://example.com',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list content base links', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.list({
      contentBaseUuid: 'contentBase1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should read content base link', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.read({
      contentBaseUuid: 'contentBase1',
      uuid: 'link1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/link1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete content base link', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.sites.delete({
      contentBaseUuid: 'contentBase1',
      linkUuid: 'link1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-link/link1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create content base file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain',
    });

    const result = await nexusaiAPI.intelligences.contentBases.files.create({
      contentBaseUuid: 'contentBase1',
      file: file,
      extension_file: 'pdf',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/',
      expect.any(FormData),
      {
        onUploadProgress: undefined,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list content base files', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.list({
      contentBaseUuid: 'contentBase1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should read content base file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.read({
      contentBaseUuid: 'contentBase1',
      uuid: 'file1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/file1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete content base file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.delete({
      contentBaseUuid: 'contentBase1',
      fileUuid: 'file1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      'api/contentBase1/content-bases-file/file1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should download file', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.download({
      fileUuid: 'file1',
      file_name: 'filename.pdf',
    });

    expect(request.$http.post).toHaveBeenCalledWith('api/v1/download-file', {
      file_name: 'filename.pdf',
      content_base_file: 'file1',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should preview document', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.intelligences.contentBases.files.preview({
      projectUuid: 'project1',
      contentBaseUuid: 'contentBase1',
      fileUuid: 'file1',
      page: 1,
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/project1/document-preview/',
      {
        content_base_uuid: 'contentBase1',
        content_base_file_uuid: 'file1',
        page_number: 1,
      },
    );
    expect(result).toEqual(mockResponse);
  });
  it('should create a router', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.actions.create({
      projectUuid: 'project1',
      flowUuid: 'flow1',
      name: 'Flow Name',
      description: 'Flow Description',
    });

    expect(request.$http.post).toHaveBeenCalledWith('api/project1/flows/', {
      uuid: 'flow1',
      name: 'Flow Name',
      prompt: 'Flow Description',
      fallback: false,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should edit a router', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.actions.edit({
      projectUuid: 'project1',
      actionUuid: 'action1',
      description: 'Updated Description',
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/project1/flows/action1/',
      {
        prompt: 'Updated Description',
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete a router', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.actions.delete({
      projectUuid: 'project1',
      actionUuid: 'action1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      'api/project1/flows/action1/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list router flows', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.actions.flows.list({
      projectUuid: 'project1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project1/search-flows/',
      {
        params: {
          name: undefined,
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list router flows with name', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.actions.flows.list({
      projectUuid: 'project1',
      name: 'amazoninha',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project1/search-flows/',
      {
        params: {
          name: 'amazoninha',
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should list router flows with pagination', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.actions.flows.list({
      projectUuid: 'project1',
      next: 'nextPageUrl',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project1/search-flows/nextPageUrl',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit tunings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.tunings.edit({
      projectUuid: 'project1',
      values: { model: 'newModel', otherSetting: 'value' },
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/project1/llm/',
      {
        model: 'newModel',
        setup: { otherSetting: 'value' },
      },
      {
        routerName: 'brain-tunings-edit',
        hideGenericErrorAlert: true,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should restore default tunings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.tunings.restoreDefault({
      projectUuid: 'project1',
    });

    expect(request.$http.post).toHaveBeenCalledWith(
      'api/project1/llm-default/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should read advanced tunings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.tunings.advanced.read({
      projectUuid: 'project1',
    });

    expect(request.$http.get).toHaveBeenCalledWith('api/project1/project');
    expect(result).toEqual(mockResponse);
  });

  it('should edit advanced tunings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.patch.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.tunings.advanced.edit({
      projectUuid: 'project1',
      brain_on: true,
    });

    expect(request.$http.patch).toHaveBeenCalledWith('api/project1/project', {
      brain_on: true,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should read customization settings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.customization.read({
      projectUuid: 'project1',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project1/customization/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should edit customization settings', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.put.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.customization.edit({
      projectUuid: 'project1',
      data: { setting: 'value' },
    });

    expect(request.$http.put).toHaveBeenCalledWith(
      'api/project1/customization/',
      { setting: 'value' },
      {
        routerName: 'brain-customization-edit',
        hideGenericErrorAlert: true,
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('should delete customization setting', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.delete.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.customization.delete({
      projectUuid: 'project1',
      id: 'setting1',
    });

    expect(request.$http.delete).toHaveBeenCalledWith(
      `api/project1/customization/?id=setting1`,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create preview', async () => {
    const mockResponse = { data: 'mockData' };
    request.$http.post.mockResolvedValue(mockResponse);

    const result = await nexusaiAPI.router.preview.create({
      projectUuid: 'project1',
      text: 'Sample text',
      contact_urn: 'contact1',
    });

    expect(request.$http.post).toHaveBeenCalledWith('api/project1/preview/', {
      text: 'Sample text',
      contact_urn: 'contact1',
    });
    expect(result).toEqual(mockResponse);
  });
});
