import { Router } from 'express';
import { v4 as createUUID } from 'uuid';
import { loremIpsum } from 'lorem-ipsum';
import _ from 'lodash';

const router = Router();

const flows = [];

for (let i = 0; i < 9; i++) {
  flows.push({
    uuid: createUUID(),
    name: loremIpsum({ count: 3, units: 'words' }),
  });
}

router
  .route('/api/:projectUuid/flows/')
  .post((req, res) => {
    res.json({
      ..._.pick(req.body, ['uuid', 'name', 'prompt', 'fallback']),
      content_base: 'a640973e-3217-405a-8441-af93b5d9de0b',
    });
  })
  .get((req, res) => {
    if (req.query.mock__state === 'empty') {
      return res.json([]);
    }

    const actions = [];

    for (let i = 0; i < 5; i++) {
      actions.push({
        uuid: createUUID(),
        name: loremIpsum({ count: 3, units: 'words' }),
        prompt: loremIpsum({ count: 8, units: 'words' }),
        fallback: false,
        content_base: 'a640973e-3217-405a-8441-af93b5d9de0b',
      });
    }

    res.json(actions);
  });

router
  .route('/api/:projectUuid/flows/:actionUuid/')
  .patch((req, res) => {
    res.json({
      uuid: req.params.actionUuid,
      name: loremIpsum({ count: 3, units: 'words' }),
      prompt: req.body.prompt,
      fallback: false,
      content_base: 'a640973e-3217-405a-8441-af93b5d9de0b',
    });
  })
  .delete((req, res) => {
    res.send();
  });

router.get('/api/:projectUuid/search-flows/', (req, res) => {
  if (req.query.mock__state === 'empty') {
    return res.json({ count: 0, next: null, previous: null, results: [] });
  }

  if (req.query.name) {
    const flowsFiltered = flows.filter(({ name }) =>
      name.includes(req.query.name),
    );

    return res.json({
      count: flowsFiltered.length,
      next: null,
      preview: null,
      results: flowsFiltered,
    });
  }

  const page = req.query.page || 1;
  const page_size = 5;

  res.json({
    count: flows.length,
    next:
      page * 5 + 1 <= flows.length
        ? `?page=${Number(page) + 1}&page_size=${page_size}&project=${
            req.params.projectUuid
          }`
        : null,
    preview: null,
    results: flows.slice(
      (page - 1) * page_size,
      (page - 1) * page_size + page_size,
    ),
  });
});

export default router;
