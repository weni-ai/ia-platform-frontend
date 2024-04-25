import { Router } from 'express';
import { loremIpsum } from 'lorem-ipsum';

const router = Router();

const brain = {
  uuid: 'a640973e-3217-405a-8441-af93b5d9de0b',
  created_at: '2024-04-23T20:02:47.722677Z',
  modified_at: null,
  is_active: true,
  title: loremIpsum({ count: 2, units: 'words' }),
  description: null,
  language: 'pt-br',
  is_router: true,
  created_by: 582,
  modified_by: null,
  intelligence: '0ba87928-8497-475a-8b82-663844e90b8b',
};

router.get('/api/:projectUuid/router/', (req, res) => {
  res.json(brain);
});

router.get('/api/:projectUuid/project', (req, res) => {
  const brain_on =
    req.query.mock_brain_on === 'false'
      ? false
      : req.query.mock_brain_on || false;

  res.json({
    uuid: req.params.projectUuid,
    name: brain.name,
    brain_on: Boolean(brain_on),
  });
});

export default router;
