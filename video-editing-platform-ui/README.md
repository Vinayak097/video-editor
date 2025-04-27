# Video Editing Platform UI

A browser-based video editing tool that allows users to upload videos, rearrange audio and cutscenes, add subtitles, text overlays, and styled images, preview the edited video in real-time, and export the final version.

## Features

- **Video Upload**: Drag-and-drop file upload with progress bar and thumbnail preview
- **Video Timeline**: Horizontal strip showing video frames with the ability to add/remove scenes and rearrange segments
- **Audio Management**: Audio waveform visualization with volume control and the ability to add background music
- **Subtitles & Text Overlay**: Add subtitle text with customizable timing, font, position, and styling
- **Image Overlay**: Upload and place static images over the video with resizable and draggable elements
- **Preview & Render**: Real-time preview with render and download functionality

## Tech Stack

- **Next.js** with App Router
- **React.js**
- **Tailwind CSS** with ShadCN UI components
- **Redux Toolkit** for state management
- **React Player** for video playback
- **React Dropzone** for drag-and-drop file uploads
- **React DnD** for timeline segment rearrangement

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/video-editing-platform-ui.git
   cd video-editing-platform-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Upload a Video**: Drag and drop a video file or click to browse files
2. **Edit Timeline**: Rearrange video segments by dragging them in the timeline
3. **Manage Audio**: Adjust volume levels or add background music
4. **Add Subtitles**: Enter text and set timing for subtitles
5. **Add Overlays**: Upload images or add text overlays to the video
6. **Preview**: Watch the video with all edits in real-time
7. **Render & Download**: Render the final video and download it

## Project Structure

```
video-editing-platform-ui/
├── app/                      # Next.js app directory
│   ├── components/           # React components
│   │   ├── audio/            # Audio management components
│   │   ├── layout/           # Layout components
│   │   ├── overlay/          # Image and text overlay components
│   │   ├── preview/          # Video preview components
│   │   ├── render/           # Render and export components
│   │   ├── subtitles/        # Subtitle components
│   │   ├── timeline/         # Timeline components
│   │   └── upload/           # Video upload components
│   ├── redux/                # Redux store and slices
│   │   ├── slices/           # Redux slices for different features
│   │   ├── provider.tsx      # Redux provider
│   │   └── store.ts          # Redux store configuration
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main page component
├── components/               # ShadCN UI components
├── lib/                      # Utility functions
├── public/                   # Static assets
└── ...                       # Configuration files
```

## Notes

- This is a frontend-only implementation with mock APIs for video processing
- Video rendering and processing are simulated with progress indicators
- The application uses client-side state management with Redux Toolkit
