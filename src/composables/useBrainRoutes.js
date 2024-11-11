import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

export default function useBrainRoutes() {
  const t = (value) => i18n.global.t(value);

  return computed(() => [
    {
      title: 'monitoring',
      description: t('router.monitoring.description'),
      page: 'router-monitoring',
      icon: 'bar_chart',
      preview: false,
    },
    {
      title: 'personalization',
      page: 'router-personalization',
      icon: 'person',
      preview: true,
    },
    {
      title: 'content',
      description: t('content_bases.description'),
      page: 'router-content',
      icon: 'article',
      preview: true,
    },
    {
      title: 'actions',
      description: t('router.actions.description'),
      page: 'router-actions',
      icon: 'bolt',
      preview: true,
    },
    {
      title: 'tunings',
      page: 'router-tunings',
      icon: 'settings',
      preview: true,
    },
  ]);
}
