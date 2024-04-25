import { Router } from 'express';
import { loremIpsum } from 'lorem-ipsum';
import _ from 'lodash';

const router = Router();

const agent = {
  name: 'Marie',
  role: 'Joana',
  personality: 'Amigável',
  goal: loremIpsum({ count: 23, units: 'words' }),
};

const instructions = [
  {
    id: 13,
    instruction: loremIpsum({ count: 4, units: 'words' }),
  },
  {
    id: 14,
    instruction: loremIpsum({ count: 4, units: 'words' }),
  },
  {
    id: 15,
    instruction: loremIpsum({ count: 4, units: 'words' }),
  },
];

router
  .route('/api/:projectUuid/customization/')
  .get((req, res) => {
    res.json({
      agent: agent,
      instructions: instructions,
    });
  })
  .put((req, res) => {
    res.json({
      agent: _.pick(req.body.agent, ['name', 'role', 'personality', 'goal']),
      instructions: req.body.instructions
        .map((instruction) => _.pick(instruction, ['id', 'instruction']))
        .map((instruction) => ({
          id: instruction.id || Math.floor(Math.random() * 1e4),
          instruction: instruction.instruction,
        })),
    });
  })
  .delete((req, res) => {
    res.json({
      agent: agent,
      instructions: instructions.filter(
        ({ id }) => id !== Number(req.query.id),
      ),
    });
  });

export default router;
