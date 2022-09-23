require('./abilities') && require('./errors');
const { authorization, multerUpload } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action, opt = {}) => authorization({ action, subject: 'User', ...opt });
const upload = multerUpload('avatar');
const options = { nonVerified: true, nonActive: true, strict: false };

/************************
 * @Router  /api/user   *
 ************************/

router.post('/', auth('save'), upload, validator.save, handler.save);

router.post('/:id/activate', auth('activate'), validator.paramId, handler.activate(true));

router.post('/:id/deactivate', auth('activate'), validator.paramId, handler.activate(false));

router.patch('/mine', auth('update-mine'), upload, validator.updateMine, handler.updateMine);

router.patch('/password', auth('password'), validator.changePassword, handler.changePassword);

router.patch('/:id', auth('update'), upload, validator.update, handler.update);

router.delete('/:id/:fileId', auth('update'), validator.deleteFile, handler.deleteFile);

router.delete('/:id', auth('delete'), validator.paramId, handler.delete);

router.get('/mine', auth('view-mine', options), handler.getMine);

router.get('/metadata', handler.metadata);

router.get('/:id', auth('view'), validator.paramId, handler.getById);

router.get('/', auth('view'), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
