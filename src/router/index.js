import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import LandingPage from '@/views/LandingPage';
import SignUp from '@/views/auth/SignUp';
import SignIn from '@/views/auth/SignIn';
import RecoverPassword from '@/views/auth/RecoverPassword';
import Terms from '@/views/Terms';
import CreateRepository from '@/views/CreateRepository';
import ResetPassword from '@/components/ResetPassword';
import RepositoryContentBases from '@/views/repository/content/Bases';
import RepositoryContentBasesForm from '@/views/repository/content/BasesForm';
import RepositoryContentAdjustment from '@/views/repository/content/ContentAdjustments';
import RepositoryContentAPI from '@/views/repository/content/API';
import RepositoryContentTests from '@/views/repository/content/Tests';
import RepositoryHome from '@/views/repository/Home';
import RepositoryTrainings from '@/views/repository/Trainings';
import RepositoryDatabase from '@/views/repository/Database';
import RepositoryTranslate from '@/views/repository/Translate';
import RepositoryTranslateExternal from '@/views/repository/TranslateExternal';
import RepositoryTranslations from '@/views/repository/Translations';
import RepositorySettings from '@/views/repository/Settings';
import RepositoryIntegration from '@/views/repository/Integration';
import RepositoryEvaluateManual from '@/views/repository/EvaluateManual';
import RepositoryEvaluateAutomatic from '@/views/repository/EvaluateAutomatic';
import RepositoryResults from '@/views/repository/Results';
import RepositoryResult from '@/views/repository/Result';
import RepositoryVersions from '@/views/repository/Versions';
import RepositoryLog from '@/views/repository/Log';
import PhraseSuggestion from '@/views/repository/PhraseSuggestion';
import Entity from '@/views/repository/Entity';
import Intent from '@/views/repository/Intent';
import NotFound from '@/views/NotFound';
import SafariAlert from '@/views/SafariAlert';
import DashboardLayout from '@/layout/dashboard/DashboardLayout';
import DashboardExternalLayout from '@/layout/dashboard/DashboardExternalLayout';
import PaymentOptions from '@/views/payment/PaymentOptions';
import PaymentInfo from '@/views/payment/PaymentInfo';
import RouterPreviewFullPage from '@/views/repository/content/router/RouterPreviewFullPage';
import store from '../store';
import nexusaiAPI from '../api/nexusaiAPI';

Vue.use(Router);

let nextFromRedirect = '';

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landingPage',
      component: LandingPage,
      beforeEnter: async (to, from, next) => {
        if (store.getters.authenticated) {
          next('/home');
        } else {
          next();
        }
      },
    },
    {
      path: '/terms',
      name: 'Terms',
      component: Terms,
    },
    {
      path: '/signin',
      name: 'signIn',
      component: SignIn,
      beforeEnter: async (to, from, next) => {
        if (store.getters.authenticated) {
          next('/home');
        } else {
          next();
        }
      },
    },
    {
      path: '/loginexternal/:token/:org/:project',
      name: 'externalLogin',
      component: null,
      beforeEnter: async (to, from, next) => {
        const { token, org, project } = to.params;
        store.dispatch('externalLogin', { token: token.replace('+', ' ') });
        store.dispatch('orgSelected', { org });
        store.dispatch('projectSelected', { project });

        store.state.Auth.connectOrgUuid = to.query?.org_uuid;
        store.state.Auth.connectProjectUuid = to.query?.project_uuid;

        sessionStorage.setItem('orgUuid', store.state.Auth.connectOrgUuid);

        sessionStorage.setItem(
          'projectUuid',
          store.state.Auth.connectProjectUuid,
        );

        const nextPath = to.query.next || to.query.next_from_redirect;

        if (nextPath) {
          nextFromRedirect = to.query.next_from_redirect;
          next(nextPath);
        } else {
          next('/home');
        }
      },
    },
    {
      path: '/recoverpassword',
      name: 'recoverpassword',
      component: RecoverPassword,
      beforeEnter: async (to, from, next) => {
        if (store.getters.authenticated) {
          next('/home');
        } else {
          next();
        }
      },
    },
    {
      path: '/signup',
      name: 'signUp',
      component: SignUp,
      beforeEnter: async (to, from, next) => {
        if (store.getters.authenticated) {
          next('/home');
        } else {
          next();
        }
      },
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/new/',
      name: 'new',
      component: CreateRepository,
    },
    {
      path: '/reset-password/:nickname/:token/',
      component: ResetPassword,
    },
    {
      path: '/external',
      name: 'external',
      component: DashboardExternalLayout,
      children: [
        {
          path: ':ownerNickname/:slug/translate/:token',
          name: 'repository-translate-external',
          component: RepositoryTranslateExternal,
        },
      ],
    },
    {
      path: '/brain/preview',
      name: 'brain-preview-full-page',
      component: RouterPreviewFullPage,
      beforeEnter: async (to, from, next) => {
        store.dispatch('externalLogin', { token: `Bearer ${to.query?.token}` });
        store.dispatch('projectSelected', { project: to.query?.project_uuid });

        store.state.Auth.connectProjectUuid = to.query?.project_uuid;

        sessionStorage.setItem(
          'projectUuid',
          store.state.Auth.connectProjectUuid,
        );

        next();
      },
    },
    {
      path: '/router',
      name: 'router',
      component: RepositoryContentBasesForm,
      redirect: () => {
        return { name: 'router-personalization' };
      },
      async beforeEnter(_to, _from, next) {
        const { data } = await nexusaiAPI.router.read({
          projectUuid: store.state.Auth.connectProjectUuid,
        });

        store.state.router.contentBaseUuid = data.uuid;
        store.state.router.intelligenceUuid = data.intelligence;

        next();
      },
      children: [
        {
          path: 'personalization',
          name: 'router-personalization',
        },
        {
          path: 'content',
          name: 'router-content',
        },
        {
          path: 'actions',
          name: 'router-actions',
        },
        {
          path: 'tunings',
          name: 'router-tunings',
        },
      ],
    },
    {
      path: '/intelligences/:intelligenceUuid',
      name: 'intelligence-home',
      component: RepositoryContentBases,
    },
    {
      path: '/intelligences/:intelligenceUuid/edit',
      name: 'intelligence-edit',
      component: RepositoryContentAdjustment,
    },
    {
      path: '/intelligences/:intelligenceUuid/bases/:contentBaseUuid/edit',
      name: 'intelligence-content-base-edit',
      component: RepositoryContentBasesForm,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardLayout,
      children: [
        {
          path: ':ownerNickname/:slug/content/bases',
          name: 'repository-content-bases',
          component: RepositoryContentBases,
        },
        {
          path: ':ownerNickname/:slug/content/bases/new',
          name: 'repository-content-bases-new',
          component: RepositoryContentBasesForm,
        },
        {
          path: ':ownerNickname/:slug/content/api',
          name: 'repository-content-api',
          component: RepositoryContentAPI,
        },
        {
          path: ':ownerNickname/:slug/content/tests',
          name: 'repository-content-tests',
          component: RepositoryContentTests,
        },
        {
          path: ':ownerNickname/:slug/',
          name: 'repository-summary',
          component: RepositoryHome,
        },
        {
          path: ':ownerNickname/:slug/training/',
          name: 'repository-training',
          component: RepositoryTrainings,
        },
        {
          path: ':ownerNickname/:slug/suggestions/',
          name: 'repository-suggestion',
          component: PhraseSuggestion,
        },
        {
          path: ':ownerNickname/:slug/database/',
          name: 'repository-database',
          component: RepositoryDatabase,
        },
        {
          path: ':ownerNickname/:slug/translate/',
          name: 'repository-translate',
          component: RepositoryTranslate,
        },
        {
          path: ':ownerNickname/:slug/translations/',
          name: 'repository-translations-status',
          component: RepositoryTranslations,
        },
        {
          path: ':ownerNickname/:slug/Integration/',
          name: 'repository-integration',
          component: RepositoryIntegration,
        },
        {
          path: ':ownerNickname/:slug/settings/',
          name: 'repository-settings',
          component: RepositorySettings,
        },
        {
          path: ':ownerNickname/:slug/evaluate/manual',
          name: 'repository-test-manual',
          component: RepositoryEvaluateManual,
        },
        // {
        //   path: ':ownerNickname/:slug/evaluate/automatic',
        //   name: 'repository-test-automatic',
        //   component: RepositoryEvaluateAutomatic,
        // },
        {
          path: ':ownerNickname/:slug/log/',
          name: 'repository-log',
          component: RepositoryLog,
        },
        {
          path: ':ownerNickname/:slug/results/',
          name: 'repository-results',
          component: RepositoryResults,
        },
        {
          path: ':ownerNickname/:slug/entitylist/:entity_id',
          name: 'repository-entitylist',
          component: Entity,
        },
        {
          path: ':ownerNickname/:slug/intentlist/:intent',
          name: 'repository-intentlist',
          component: Intent,
        },
        {
          path: ':ownerNickname/:slug/result/:resultId/',
          name: 'repository-result',
          component: RepositoryResult,
        },
        // ...((runtimeVariables.get('VUE_APP_VERSION_ENABLED'))
        //   ? [{
        //     path: ':ownerNickname/:slug/versions/',
        //     name: 'repository-versions',
        //     component: RepositoryVersions,
        //   }] : []),
      ],
    },
    ...(runtimeVariables.get('VUE_APP_BOTHUB_WEBAPP_PAYMENT_ENABLED')
      ? [
          {
            path: '/payment-options',
            name: 'payment-options',
            component: PaymentOptions,
            beforeEnter: async (to, from, next) => {
              if (!store.getters.authenticated) {
                next('/signin');
              } else {
                next();
              }
            },
          },
          {
            path: '/payment-info',
            name: 'payment-info',
            component: PaymentInfo,
            beforeEnter: async (to, from, next) => {
              if (!store.getters.authenticated) {
                next('/signin');
              } else {
                next();
              }
            },
          },
        ]
      : []),
    {
      path: '/tutorial',
      name: 'Tutorial',
      component: DashboardLayout,
      children: [
        {
          path: 'training/',
          name: 'tutorial-training',
          component: RepositoryTrainings,
        },
        {
          path: 'quick-test/',
          name: 'tutorial-quick-test',
          component: RepositoryHome,
        },
        {
          path: 'evaluate/',
          name: 'tutorial-evaluate',
          component: RepositoryEvaluateManual,
        },
        {
          path: 'inbox/',
          name: 'tutorial-inbox',
          component: RepositoryLog,
        },
        {
          path: 'translate/',
          name: 'tutorial-translate',
          component: RepositoryTranslate,
        },
        {
          path: 'integrate/',
          name: 'tutorial-integrate',
          component: RepositoryIntegration,
        },
      ],
    },
    {
      path: '*',
      name: '404',
      component: NotFound,
      beforeEnter(to, _from, next) {
        if (to.fullPath === nextFromRedirect) {
          next();
        } else {
          const bearerToken = window.localStorage
            .getItem('authToken')
            .replace(' ', '+');

          const intelligenceOrgId = store.state.Auth.org;
          const orgUuid = sessionStorage.getItem('orgUuid');
          const projectUuid = sessionStorage.getItem('projectUuid');

          const path = `/loginexternal/${bearerToken}/${intelligenceOrgId}/${projectUuid}/`;

          const redirectUrl = new URL(
            path,
            runtimeVariables.get('INTELLIGENCE_NEXT_URL'),
          );

          redirectUrl.searchParams.append('org_uuid', orgUuid);
          redirectUrl.searchParams.append('project_uuid', projectUuid);
          redirectUrl.searchParams.append('next_from_redirect', to.fullPath);

          location.href = redirectUrl.toString();
        }
      },
    },
    {
      path: '/safariAlert/',
      name: 'safari-alert',
      component: SafariAlert,
    },
  ],
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

router.afterEach((to, from) => {
  window.parent.postMessage(
    {
      event: 'changePathname',
      pathname: window.location.pathname,
    },
    '*',
  );
});

export default router;
