const path = require('path');
const fs = require('fs');
const prisma = require('../utils/db');
const ffmpegUtils = require('../utils/ffmpeg');

// Upload a new video
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    // Get video information using FFmpeg
    const videoPath = req.file.path;
    let videoInfo;

    try {
      videoInfo = await ffmpegUtils.getVideoInfo(videoPath);
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError);
      // Fallback to default values if FFmpeg fails
      videoInfo = { duration: 0 };
    }

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        filename: req.file.originalname,
        filepath: videoPath,
        filesize: req.file.size,
        duration: videoInfo.duration,
        status: 'uploaded'
      }
    });

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video.id,
        title: video.title,
        duration: video.duration,
        status: video.status
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

// Get all videos
const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        status: true,
        createdAt: true
      }
    });

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

// Get a single video by ID
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        edits: true,
        subtitles: true
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
};

// Trim a video
const trimVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (startTime === undefined || endTime === undefined) {
      return res.status(400).json({ error: 'Start time and end time are required' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'Start time must be less than end time' });
    }

    // Get the video
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../uploads/processed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate output path
    const outputFilename = `trim_${Date.now()}_${path.basename(video.filepath)}`;
    const outputPath = path.join(outputDir, outputFilename);

    // Create edit record in database
    const edit = await prisma.edit.create({
      data: {
        type: 'trim',
        parameters: { startTime, endTime },
        status: 'processing',
        videoId: id
      }
    });

    // Perform the trim operation
    try {
      await ffmpegUtils.trimVideo(video.filepath, outputPath, startTime, endTime);

      // Update edit record with output path and status
      await prisma.edit.update({
        where: { id: edit.id },
        data: {
          outputPath,
          status: 'completed'
        }
      });

      res.json({
        message: 'Video trimmed successfully',
        edit: {
          id: edit.id,
          type: 'trim',
          parameters: { startTime, endTime },
          status: 'completed'
        }
      });
    } catch (ffmpegError) {
      // Update edit record with failed status
      await prisma.edit.update({
        where: { id: edit.id },
        data: {
          status: 'failed'
        }
      });

      throw ffmpegError;
    }
  } catch (error) {
    console.error('Error trimming video:', error);
    res.status(500).json({ error: 'Failed to trim video' });
  }
};

// Add subtitles to a video
const addSubtitles = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, startTime, endTime } = req.body;

    if (!text || startTime === undefined || endTime === undefined) {
      return res.status(400).json({ error: 'Text, start time, and end time are required' });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'Start time must be less than end time' });
    }

    // Get the video
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Create subtitle record in database
    const subtitle = await prisma.subtitle.create({
      data: {
        text,
        startTime,
        endTime,
        videoId: id
      }
    });

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../uploads/processed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate output path
    const outputFilename = `subtitle_${Date.now()}_${path.basename(video.filepath)}`;
    const outputPath = path.join(outputDir, outputFilename);

    // Create edit record in database
    const edit = await prisma.edit.create({
      data: {
        type: 'subtitle',
        parameters: { text, startTime, endTime },
        status: 'processing',
        videoId: id
      }
    });

    // Perform the subtitle operation
    try {
      await ffmpegUtils.addSubtitles(video.filepath, outputPath, [{
        text,
        startTime,
        endTime
      }]);

      // Update edit record with output path and status
      await prisma.edit.update({
        where: { id: edit.id },
        data: {
          outputPath,
          status: 'completed'
        }
      });

      res.json({
        message: 'Subtitles added successfully',
        subtitle,
        edit: {
          id: edit.id,
          type: 'subtitle',
          status: 'completed'
        }
      });
    } catch (ffmpegError) {
      // Update edit record with failed status
      await prisma.edit.update({
        where: { id: edit.id },
        data: {
          status: 'failed'
        }
      });

      throw ffmpegError;
    }
  } catch (error) {
    console.error('Error adding subtitles:', error);
    res.status(500).json({ error: 'Failed to add subtitles' });
  }
};

// Render final video with all edits
const renderVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the video with all completed edits
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        edits: {
          where: { status: 'completed' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.edits.length === 0) {
      return res.status(400).json({ error: 'No completed edits found for this video' });
    }

    // Update video status to processing
    await prisma.video.update({
      where: { id },
      data: { status: 'processing' }
    });

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../uploads/processed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate output path for final video
    const outputFilename = `final_${Date.now()}_${path.basename(video.filepath)}`;
    const outputPath = path.join(outputDir, outputFilename);

    // Render the final video
    try {
      await ffmpegUtils.renderVideo(video.filepath, outputPath, video.edits);

      // Update video status to ready
      await prisma.video.update({
        where: { id },
        data: {
          status: 'ready',
          filepath: outputPath // Update filepath to the final rendered video
        }
      });

      res.json({
        message: 'Video rendered successfully',
        video: {
          id: video.id,
          title: video.title,
          status: 'ready'
        }
      });
    } catch (ffmpegError) {
      // Update video status to uploaded (revert to original state)
      await prisma.video.update({
        where: { id },
        data: { status: 'uploaded' }
      });

      throw ffmpegError;
    }
  } catch (error) {
    console.error('Error rendering video:', error);
    res.status(500).json({ error: 'Failed to render video' });
  }
};

// Download a video
const downloadVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the video
    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.status !== 'ready' && !req.query.original) {
      return res.status(400).json({ error: 'Video is not ready for download' });
    }

    // Set the appropriate headers
    const filename = path.basename(video.filepath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Stream the file
    const fileStream = fs.createReadStream(video.filepath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: 'Failed to download video' });
  }
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  trimVideo,
  addSubtitles,
  renderVideo,
  downloadVideo
};
