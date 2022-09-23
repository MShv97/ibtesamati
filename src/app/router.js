const { errorHandlers, FileRouter } = require('utils');
const router = require('express').Router();

/********************
 * @Router /api     *
 ********************/

router.get('/errors', errorHandlers.list);

router.use('/static', FileRouter);

router.use('/auth', require('./auth/router'));

router.use('/user', require('./user/router'));

router.use('/product', require('./product/router'));

router.use('/subscription', require('./subscription/router'));

router.use('/order', require('./order/router'));

router.use('/notification', require('./notification/router'));

router.use('/about', require('./about/router'));

module.exports = router;
