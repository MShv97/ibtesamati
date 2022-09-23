require('./abilities') && require('./errors');
const { authorization } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action) => authorization({ action, subject: 'About' });

/***************************
 * @Router  /api/about     *
 ***************************/

router.patch('/', auth('update'), validator.update, handler.update);

router.get('/', validator.get, handler.get);

module.exports = router;
