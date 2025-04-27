const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const upload = require('../middlewares/upload');

// GET /api/videos - Get all videos
router.get('/', videoController.getAllVideos);

// GET /api/videos/:id - Get a single video by ID
router.get('/:id', videoController.getVideoById);

// POST /api/videos/upload - Upload a new video
router.post('/upload', upload.single('video'), videoController.uploadVideo);

// POST /api/videos/:id/trim - Trim a video
router.post('/:id/trim', videoController.trimVideo);

// POST /api/videos/:id/subtitles - Add subtitles to a video
router.post('/:id/subtitles', videoController.addSubtitles);

// POST /api/videos/:id/render - Render final video
router.post('/:id/render', videoController.renderVideo);

// GET /api/videos/:id/download - Download a video
router.get('/:id/download', videoController.downloadVideo);

module.exports = router;
