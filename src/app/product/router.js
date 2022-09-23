require('./abilities') && require('./errors');
const { authorization, multerUpload } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action, opt = {}) => authorization({ action, subject: 'Product', ...opt });
const options = { nonVerified: true, nonActive: true, strict: false };
const upload = multerUpload('images');

/***************************
 * @Router  /api/product   *
 ***************************/

router.post('/', auth('save'), upload, validator.save, handler.save);

router.patch('/:id', auth('update'), validator.update, handler.update);

router.post('/:id/file', auth('update'), upload, validator.uploadFiles, handler.uploadFiles);

router.delete('/:id/:fileId', auth('update'), validator.deleteFile, handler.deleteFile);

router.delete('/:id', auth('delete'), validator.paramId, handler.delete);

router.get('/metadata', handler.metadata);

router.get('/:id', auth('view', options), validator.paramId, handler.getById);

router.get('/', auth('view', options), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
