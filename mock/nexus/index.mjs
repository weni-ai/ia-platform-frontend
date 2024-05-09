import { Router } from 'express';
import BrainGeneral from './Brain/General.mjs';
import BrainCustomization from './Brain/Customization.mjs';
import BrainActions from './Brain/Actions.mjs';
import _ from 'lodash';

const router = Router();

router.use('/', BrainGeneral);
router.use('/', BrainCustomization);
router.use('/', BrainActions);

export default router;
