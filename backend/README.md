# Video Editing Platform Backend

A scalable and modular backend service for a web-based video editing platform. This API allows users to upload videos, apply editing operations (trimming, subtitle overlay), and download the rendered video.

![Video Editing Platform](https://via.placeholder.com/800x400?text=Video+Editing+Platform)

## Project Overview

This project implements a RESTful API for a video editing platform that allows:
- Uploading video files
- Applying various editing operations (trimming, subtitles)
- Rendering the final video with all edits
- Downloading the processed video

The backend is designed to be consumed by a frontend video editor application.

## Features

- Video upload and storage
- Video trimming/cutting
- Subtitle overlay
- Final video rendering
- Video download

## Tech Stack

- Node.js
- Express.js
- PostgreSQL with Prisma ORM
- FFmpeg for video processing
- Multer for file uploads

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- FFmpeg installed on your system

## Installation

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/video-editing-platform.git
   cd video-editing-platform
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Install FFmpeg**

   **Windows**:
   - Download from [FFmpeg.org](https://ffmpeg.org/download.html) or use [gyan.dev builds](https://www.gyan.dev/ffmpeg/builds/)
   - Extract the archive to a location like `C:\ffmpeg`
   - Add the bin directory (e.g., `C:\ffmpeg\bin`) to your system PATH:
     - Right-click on "This PC" or "My Computer" and select "Properties"
     - Click on "Advanced system settings"
     - Click on "Environment Variables"
     - Under "System variables", find the "Path" variable, select it and click "Edit"
     - Click "New" and add the path to the bin directory
     - Click "OK" on all dialogs to save the changes
   - **Important**: Restart your terminal or computer for the PATH changes to take effect
   - Verify installation by running `ffmpeg -version` in a new terminal window

   **macOS**:
   - Install via Homebrew: `brew install ffmpeg`

   **Linux**:
   - Ubuntu/Debian: `sudo apt install ffmpeg`
   - CentOS/RHEL: `sudo yum install ffmpeg`

4. **Set up PostgreSQL**
   - Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
   - Create a database named `video_editing_db`

5. **Configure environment variables**
   Create a `.env` file in the root directory with the following:

   For development with SQLite (easier setup):
   ```
   PORT=3000
   DATABASE_URL="file:./dev.db"
   FFMPEG_PATH="ffmpeg"
   FFPROBE_PATH="ffprobe"
   ```

   For production with PostgreSQL:
   ```
   PORT=3000
   DATABASE_URL="postgresql://username:password@localhost:5432/video_editing_db"
   FFMPEG_PATH="ffmpeg"
   FFPROBE_PATH="ffprobe"
   ```

   - Replace `username` and `password` with your PostgreSQL credentials
   - For Windows, use double backslashes in paths if using full paths: `C:\\ffmpeg\\bin\\ffmpeg.exe`
   - If FFmpeg is in your PATH, you can use just the executable names as shown above

6. **Initialize the database**
   ```
   npm run setup
   ```

## Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Documentation

The API is documented using Swagger UI. Once the server is running, you can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

### API Endpoints

#### Video Upload
- **POST** `/api/videos/upload`
  - Upload a new video file
  - Request: Form data with `video` file and optional `title` and `description`
  - Response: Video metadata

#### Get All Videos
- **GET** `/api/videos`
  - Get a list of all uploaded videos
  - Response: Array of video objects

#### Get Video by ID
- **GET** `/api/videos/:id`
  - Get details of a specific video
  - Response: Video object with edits and subtitles

#### Trim Video
- **POST** `/api/videos/:id/trim`
  - Trim a video to specified start and end times
  - Request: JSON with `startTime` and `endTime` in seconds
  - Response: Edit operation details

#### Add Subtitles
- **POST** `/api/videos/:id/subtitles`
  - Add subtitles to a video
  - Request: JSON with `text`, `startTime`, and `endTime`
  - Response: Subtitle and edit operation details

#### Render Final Video
- **POST** `/api/videos/:id/render`
  - Render the final video with all edits
  - Response: Video details with updated status

#### Download Video
- **GET** `/api/videos/:id/download`
  - Download the final rendered video
  - Response: Video file stream

## Testing with Postman

1. **Import the Swagger JSON**
   - Open Postman
   - Click "Import" > "Raw text/file" > Browse to `swagger.json`
   - This will create a collection with all API endpoints

2. **Testing Video Upload**
   - Select the "Upload a new video" request
   - In the "Body" tab, select "form-data"
   - Add a key `video` with type "File" and select a video file
   - Add optional keys `title` and `description` with type "Text"
   - Click "Send"

3. **Testing Video Editing**
   - After uploading a video, copy the video ID from the response
   - Use this ID in the URL for other requests (trim, subtitles, render, download)

## Project Structure

```
video-editing-platform/
├── prisma/                  # Prisma ORM schema and migrations
├── src/
│   ├── controllers/         # Request handlers
│   ├── middlewares/         # Express middlewares
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   └── index.js             # Application entry point
├── uploads/                 # Video storage
│   ├── original/            # Original uploaded videos
│   └── processed/           # Processed videos
├── .env                     # Environment variables
├── package.json             # Project dependencies
├── setup.js                 # Database setup script
└── swagger.json             # API documentation
```

## Switching to PostgreSQL for Production

The application is configured to use SQLite for development and testing, but for production, you should switch to PostgreSQL:

1. **Install PostgreSQL** if not already installed
2. **Create a database** named `video_editing_db`
3. **Update the .env file** to use the PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/video_editing_db"
   ```
4. **Update the Prisma schema** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. **Push the schema to the database**:
   ```
   npx prisma db push
   ```

## Future Enhancements

- Add user authentication and authorization
- Implement cloud storage (AWS S3)
- Add background processing with a queue system (BullMQ/Redis)
- Add more video editing operations (filters, transitions, etc.)
- Implement video preview generation

## License

ISC

## Author

Your Name

## Acknowledgments

- FFmpeg for video processing
- Prisma for database ORM
- Express.js for API framework
