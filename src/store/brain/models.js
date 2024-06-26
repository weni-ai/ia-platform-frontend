import { WENIGPT_OPTIONS } from '../../utils';

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
      {
        type: 'slider',
        name: 'temperature',
        default: 0.1,
        step: 0.05,
        min: 0,
        max: 1,
      },
      {
        type: 'slider',
        name: 'top_p',
        default: 0.95,
        step: 0.05,
        min: 0,
        max: 1,
      },
      {
        type: 'slider',
        name: 'top_k',
        default: 10,
        step: 1,
        min: 1,
        max: 100,
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
        options: ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'],
      },
      {
        type: 'password',
        name: 'token',
      },
      {
        type: 'naf-header',
        name: 'parameter',
      },
      {
        type: 'slider',
        name: 'temperature',
        default: 0.1,
        step: 0.05,
        min: 0,
        max: 1,
      },
      {
        type: 'slider',
        name: 'top_p',
        default: 0.95,
        step: 0.05,
        min: 0,
        max: 1,
      },
    ],
  },
];
