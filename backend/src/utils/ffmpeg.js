const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Set FFmpeg and FFprobe paths from environment variables if available
try {
  // Check if FFmpeg is available
  let ffmpegAvailable = false;
  let ffprobeAvailable = false;

  try {
    // Try to execute FFmpeg to check if it's available
    const { execSync } = require('child_process');
    execSync('ffmpeg -version', { stdio: 'ignore' });
    ffmpegAvailable = true;
    console.log('FFmpeg is available in the system PATH');

    execSync('ffprobe -version', { stdio: 'ignore' });
    ffprobeAvailable = true;
    console.log('FFprobe is available in the system PATH');
  } catch (execError) {
    console.warn('FFmpeg/FFprobe not found in system PATH, using configured paths');
  }

  // Set paths from environment variables
  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    console.log(`FFmpeg path set to: ${process.env.FFMPEG_PATH}`);
  } else if (ffmpegAvailable) {
    ffmpeg.setFfmpegPath('ffmpeg');
    console.log('Using FFmpeg from system PATH');
  } else {
    console.warn('FFmpeg path not set and not found in PATH. Video processing features may not work.');
  }

  if (process.env.FFPROBE_PATH) {
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
    console.log(`FFprobe path set to: ${process.env.FFPROBE_PATH}`);
  } else if (ffprobeAvailable) {
    ffmpeg.setFfprobePath('ffprobe');
    console.log('Using FFprobe from system PATH');
  } else {
    console.warn('FFprobe path not set and not found in PATH. Video metadata extraction may not work.');
  }
} catch (error) {
  console.error('Error setting FFmpeg paths:', error.message);
  console.warn('The application will continue to run, but video processing features may be limited.');
}

/**
 * Get video information using FFmpeg
 * @param {string} filePath - Path to the video file
 * @returns {Promise<Object>} - Video metadata
 */
const getVideoInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return reject(new Error(`File not found: ${filePath}`));
      }

      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.error('FFprobe error:', err.message);
          // Return default values if FFprobe fails
          return resolve({
            duration: 0,
            size: fs.statSync(filePath).size,
            bitrate: 0,
            width: 0,
            height: 0,
            codec: 'unknown'
          });
        }

        try {
          const { format, streams } = metadata;
          const videoStream = streams.find(s => s.codec_type === 'video');

          resolve({
            duration: format.duration,
            size: format.size,
            bitrate: format.bit_rate,
            width: videoStream ? videoStream.width : null,
            height: videoStream ? videoStream.height : null,
            codec: videoStream ? videoStream.codec_name : null
          });
        } catch (parseError) {
          console.error('Error parsing metadata:', parseError.message);
          // Return default values if parsing fails
          resolve({
            duration: 0,
            size: fs.statSync(filePath).size,
            bitrate: 0,
            width: 0,
            height: 0,
            codec: 'unknown'
          });
        }
      });
    } catch (error) {
      console.error('Unexpected error in getVideoInfo:', error.message);
      // Return default values for any other errors
      resolve({
        duration: 0,
        size: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
        bitrate: 0,
        width: 0,
        height: 0,
        codec: 'unknown'
      });
    }
  });
};

/**
 * Trim a video using FFmpeg
 * @param {string} inputPath - Path to the input video
 * @param {string} outputPath - Path to save the output video
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @returns {Promise<string>} - Path to the trimmed video
 */
const trimVideo = (inputPath, outputPath, startTime, endTime) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(outputPath)
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
};

/**
 * Add subtitles to a video
 * @param {string} inputPath - Path to the input video
 * @param {string} outputPath - Path to save the output video
 * @param {Array} subtitles - Array of subtitle objects with text, startTime, and endTime
 * @returns {Promise<string>} - Path to the video with subtitles
 */
const addSubtitles = async (inputPath, outputPath, subtitles) => {
  // Create a temporary SRT file
  const srtPath = path.join(path.dirname(outputPath), `${path.basename(outputPath, path.extname(outputPath))}.srt`);

  // Generate SRT content
  let srtContent = '';
  subtitles.forEach((subtitle, index) => {
    const startTimeFormatted = formatTime(subtitle.startTime);
    const endTimeFormatted = formatTime(subtitle.endTime);

    srtContent += `${index + 1}\n`;
    srtContent += `${startTimeFormatted} --> ${endTimeFormatted}\n`;
    srtContent += `${subtitle.text}\n\n`;
  });

  // Write SRT file
  fs.writeFileSync(srtPath, srtContent);

  // Add subtitles to video
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-vf subtitles=${srtPath.replace(/\\/g, '\\\\')}`
      ])
      .output(outputPath)
      .on('end', () => {
        // Clean up SRT file
        fs.unlinkSync(srtPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        // Clean up SRT file if it exists
        if (fs.existsSync(srtPath)) {
          fs.unlinkSync(srtPath);
        }
        reject(err);
      })
      .run();
  });
};

/**
 * Format time in seconds to SRT format (HH:MM:SS,mmm)
 * @param {number} timeInSeconds - Time in seconds
 * @returns {string} - Formatted time
 */
const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

/**
 * Render final video with all edits
 * @param {string} inputPath - Path to the original video
 * @param {string} outputPath - Path to save the final video
 * @param {Array} edits - Array of edit operations to apply
 * @returns {Promise<string>} - Path to the final rendered video
 */
const renderVideo = async (inputPath, outputPath, edits) => {
  let currentInput = inputPath;
  let tempOutputPath;

  // Apply each edit sequentially
  for (const edit of edits) {
    tempOutputPath = path.join(
      path.dirname(outputPath),
      `temp_${Date.now()}_${path.basename(outputPath)}`
    );

    switch (edit.type) {
      case 'trim':
        const { startTime, endTime } = edit.parameters;
        await trimVideo(currentInput, tempOutputPath, startTime, endTime);
        break;

      case 'subtitle':
        await addSubtitles(currentInput, tempOutputPath, [edit.parameters]);
        break;

      default:
        throw new Error(`Unsupported edit type: ${edit.type}`);
    }

    // If not the first edit, delete the previous temp file
    if (currentInput !== inputPath && fs.existsSync(currentInput)) {
      fs.unlinkSync(currentInput);
    }

    // Update current input for next edit
    currentInput = tempOutputPath;
  }

  // Rename the final temp file to the desired output path
  fs.renameSync(currentInput, outputPath);

  return outputPath;
};

module.exports = {
  getVideoInfo,
  trimVideo,
  addSubtitles,
  renderVideo
};
