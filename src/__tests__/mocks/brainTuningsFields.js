export const brainTuningsFields = [
  {
    type: 'radio',
    name: 'model',
    options: ['WeniGPT', 'ChatGPT'],
    default: 'WeniGPT',
    value: 'WeniGPT',
    previousValue: 'WeniGPT',
  },
  {
    type: 'select',
    name: 'version',
    default: {
      name: 'golfinho-1',
      description: 'router.tunings.fields.golfinho-1',
      model: 'golfinho-1',
    },
    options: [
      {
        name: 'golfinho-1',
        description: 'router.tunings.fields.golfinho-1',
        model: 'golfinho-1',
      },
      {
        name: 'shark-1',
        description: 'router.tunings.fields.shark-1',
        model: 'shark-1',
      },
    ],
    value: 'golfinho-1',
    previousValue: 'golfinho-1',
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
    value: 0.15,
    previousValue: 0.15,
  },
  {
    type: 'password',
    name: 'token',
  },
];
