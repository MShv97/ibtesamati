require('./abilities') && require('./errors');
const { authorization } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action, strict = true) => authorization({ action, strict, subject: 'Order' });

/****************************
 * @Router  /api/order  	*
 ****************************/

router.post('/', auth('save'), validator.save, handler.save);

router.post('/calculate', auth('calculate', false), validator.calculate, handler.calculate);

router.post('/webhook', handler.webhook);

router.get('/metadata', handler.metadata);

router.get('/:id', auth('view'), validator.paramId, handler.getById);

router.get('/', auth('view'), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
