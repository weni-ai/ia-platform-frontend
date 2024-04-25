import { Router } from 'express';

const router = Router();

router.get('/v2/account/my-profile/', (req, res) => {
  res.json({
    nickname: 'marie.joana@weni.ai',
    name: 'Marie Joana',
    locale: '',
    is_organization: false,
    biography: null,
    language: 'pt-br',
  });
});

export default router;
