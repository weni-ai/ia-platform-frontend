import { describe, it, expect, vi, beforeEach } from 'vitest';
import router from '@/router';
import store from '@/store';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/views/Home.vue', () => ({
  default: {
    template: '<div>Home</div>',
  },
}));
vi.mock('@/views/repository/content/Bases.vue', () => ({
  default: {
    template: '<div>RepositoryContentBases</div>',
  },
}));
vi.mock('@/views/ContentBases/Form.vue', () => ({
  default: {
    template: '<div>ContentBasesForm</div>',
  },
}));
vi.mock('@/views/Brain/Brain.vue', () => ({
  default: {
    template: '<div>Brain</div>',
  },
}));
vi.mock('@/views/repository/content/ContentAdjustments.vue', () => ({
  default: {
    template: '<div>RepositoryContentAdjustment</div>',
  },
}));
vi.mock('@/views/Brain/RouterPreviewFullPage.vue', () => ({
  default: {
    template: '<div>RouterPreviewFullPage</div>',
  },
}));
vi.mock('@/views/NotFound.vue', () => ({
  default: {
    template: '<div>NotFound</div>',
  },
}));

global.window.localStorage = {
  getItem: vi.fn((key) => {
    if (key === 'authToken') return 'some-auth-token';
    return null;
  }),
  setItem: vi.fn(),
};

global.window.sessionStorage = {
  getItem: vi.fn((key) => {
    if (key === 'orgUuid') return 'some-org-uuid';
    if (key === 'projectUuid') return 'some-project-uuid';
    return null;
  }),
  setItem: vi.fn(),
};

global.window.location = {
  href: '',
  pathname: '',
};

global.location = {
  assign: vi.fn(() => {}),
};

describe('router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(store, 'dispatch').mockImplementation(() => Promise.resolve());
  });

  it('should create router with history mode', () => {
    expect(router.options.history.location).toBe(import.meta.env.BASE_URL);
  });

  it('should redirect to home if no nextPath is provided in external login', async () => {
    const to = {
      params: { token: 'token', org: 'org', project: 'project' },
      query: {},
    };
    const next = vi.fn();
    await router.options.routes[0].beforeEnter(to, null, next);
    expect(next).toHaveBeenCalledWith({ path: '/home', replace: true });
  });

  it('should handle brain preview full page route correctly', async () => {
    const to = {
      query: { token: 'token', project_uuid: 'project_uuid' },
    };
    const next = vi.fn();
    await router.options.routes[2].beforeEnter(to, null, next);
    expect(store.dispatch).toHaveBeenCalledWith('externalLogin', {
      token: 'Bearer token',
    });
    expect(store.dispatch).toHaveBeenCalledWith('projectSelected', {
      project: 'project_uuid',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should handle /router route correctly', async () => {
    const data = {
      uuid: 'contentBaseUuid',
      intelligence: 'intelligenceUuid',
    };
    vi.spyOn(nexusaiAPI.router, 'read').mockResolvedValue({ data });
    const next = vi.fn();
    await router.options.routes[3].beforeEnter({}, {}, next);
    expect(store.state.router.contentBaseUuid).toBe(data.uuid);
    expect(store.state.router.intelligenceUuid).toBe(data.intelligence);
    expect(next).toHaveBeenCalled();
  });

  it('should redirect 404 route to loginexternal', async () => {
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'Bearer token';
      return null;
    });
    window.sessionStorage.getItem.mockImplementation((key) => {
      if (key === 'orgUuid') return 'some-org-uuid';
      if (key === 'projectUuid') return 'some-project-uuid';
      return null;
    });

    global.runtimeVariables.get = (key) => {
      if (key === 'INTELLIGENCE_LEGACY_URL') return 'http://example.com';
      return '';
    };

    const to = { fullPath: '/some-path' };
    const from = {};
    const next = vi.fn();

    await router.options.routes
      .find((r) => r.name === '404')
      .beforeEnter(to, from, next);

    expect(window.location.href).toBe(
      'http://example.com/loginexternal/Bearer+token/null/some-project-uuid/?org_uuid=some-org-uuid&project_uuid=some-project-uuid&next_from_redirect=%2Fsome-path',
    );
  });

  it('should handle redirection correctly in /loginexternal route', async () => {
    const to = {
      params: { token: 'token', org: 'org', project: 'project' },
      query: { next_from_redirect: '/redirect-path' },
    };
    const next = vi.fn();

    await router.options.routes[0].beforeEnter(to, null, next);

    expect(next).toHaveBeenCalledWith({
      path: '/redirect-path',
      replace: true,
    });
  });

  it('should redirect /router to router-personalization', async () => {
    const to = {};
    const from = {};
    const next = vi.fn();

    await router.options.routes[3].beforeEnter(to, from, next);

    expect(next).toHaveBeenCalled();
    expect(router.options.routes[3].redirect()).toStrictEqual({
      name: 'router-personalization',
    });
  });

  it('should redirect 404 route to next()', async () => {
    const to = { fullPath: '/redirect-path' };
    const from = {};
    const next = vi.fn();

    await router.options.routes
      .find((r) => r.name === '404')
      .beforeEnter(to, from, next);

    expect(next).toHaveBeenCalled();
  });
});
