let express = require('express');
let router = express.Router();
let upload = require('../config/multer.config.js');

const fileWorker = require('../controllers/auth.controller');

router.post('/api/file/upload', upload.single("file"), fileWorker.uploadFile);

// router.get('/api/auth/all', fileWorker.listAllFiles);

// router.get('/api/auth/:id', fileWorker.downloadFile);

module.exports = router;