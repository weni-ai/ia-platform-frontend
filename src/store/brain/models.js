import { WENIGPT_OPTIONS } from '@/utils';

export const models = [
  {
    name: 'WeniGPT',
    fields: [
      {
        type: 'select',
        name: 'version',
        default: WENIGPT_OPTIONS[0],
        options: WENIGPT_OPTIONS,
      },
      {
        type: 'naf-header',
        name: 'parameter',
      },
    ],
  },
  {
    name: 'ChatGPT',
    fields: [
      {
        type: 'select',
        name: 'version-gpt',
        default: 'gpt-4o',
        options: ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'],
      },
      {
        type: 'password',
        name: 'token',
      },
      {
        type: 'naf-header',
        name: 'parameter',
      },
    ],
  },
];
