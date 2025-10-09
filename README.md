# LingoEase Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [API Documentation](#api-documentation)
8. [Core Components](#core-components)
9. [Workflow](#workflow)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)
12. [Limitations](#limitations)

## Project Overview

**LingoEase** is an AI-powered language simplification application that helps users understand complex content by converting it into simpler, more accessible language. The application processes both text and audio/video content, simplifying vocabulary while maintaining the original meaning and intent.

### Mission

- **Simplify Language**: Transform complex text into easier-to-understand content
- **Amplify Understanding**: Make information more accessible to learners and non-native speakers

### Key Capabilities

- Text simplification using AI language models
- Audio transcription and simplification
- Text-to-speech generation with multiple voice options
- Vocabulary analysis and coverage metrics
- Support for multiple AI providers (OpenAI, Google)

## Features

### Core Features

1. **Multi-Input Support**

   - Direct text input
   - Audio file upload (MP3, WAV, M4A, etc.)

2. **AI-Powered Simplification**

   - Context-aware text simplification
   - Vocabulary level targeting (500/1000 most common words)
   - Candidate word replacement with synonyms
   - Preservation of original meaning and intent

3. **Audio Generation**

   - Multiple voice options (Alloy, Echo, Fable, etc.)
   - Various speaking styles (TED Talk, Teacher, Audiobook, etc.)
   - High-quality MP3 output
   - Downloadable audio files

4. **Analysis & Metrics**

   - Vocabulary coverage percentage
   - New word identification and highlighting
   - Text complexity analysis
   - Before/after comparison

5. **User Experience**
   - Step-by-step workflow
   - Real-time progress tracking
   - Responsive design
   - API key management

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React UI      │    │ • Transcribe    │    │ • OpenAI API    │
│ • State Mgmt    │    │ • Simplify      │    │ • Google AI     │
│ • File Upload   │    │ • TTS           │    │ • Upstash       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Input Processing**: User uploads text or audio
2. **Transcription**: Audio converted to text (if needed)
3. **Segmentation**: Text split into manageable chunks
4. **Analysis**: Identify complex words and find synonyms
5. **Simplification**: AI replaces complex words with simpler alternatives
6. **Audio Generation**: Simplified text converted to speech
7. **Output**: Display results with metrics and audio player

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5.0 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React, React Icons

### Backend

- **Runtime**: Node.js
- **API**: Next.js API Routes
- **AI Integration**: LangChain
- **Language Models**: OpenAI GPT, Google Gemini
- **NLP Processing**: Wink NLP
- **Vector Database**: Upstash Vector

### External Services

- **AI Providers**: OpenAI, Google AI
- **File Storage**: Vercel Blob
- **Vector Search**: Upstash Vector
- **Text-to-Speech**: OpenAI TTS

### Development Tools

- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Next.js

## Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- OpenAI API key or Google AI API key

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/chen-wenyi/lingoease/
   cd lingoease
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Upstash Vector Database
   UPSTASH_VECTOR_REST_URL=your_upstash_url
   UPSTASH_VECTOR_REST_TOKEN=your_upstash_token

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Configuration

### API Key Configuration

The application supports multiple AI providers:

#### OpenAI Configuration

- API Key format: `sk-...`
- Models: `gpt-4o-mini`, `gpt-4o-mini-transcribe`, `gpt-4o-mini-tts`
- Features: Text simplification, transcription, TTS

#### Google AI Configuration

- API Key format: `AIza...`
- Models: `gemini-2.5-flash`
- Features: Text simplification

### Output Options

#### Vocabulary Levels

- **Beginner**: Uses 500 most common English words
- **Elementary**: Uses 1000 most common English words

#### Voice Options

- Alloy, Echo, Fable, Onyx, Nova, Shimmer
- Each voice has distinct characteristics

#### Speaking Styles

- **TED Talk**: Inspiring, conversational, engaging
- **Teacher**: Clear, patient, educational
- **Audiobook**: Warm, engaging, narrative
- **Pronunciation Coach**: Slow, deliberate, educational

### Context Window

- Configurable context size for simplification
- Affects how much surrounding text is considered
- Default: 2 sentences before/after

## API Documentation

### Endpoints

#### POST `/api/transcribe`

Transcribes audio files to text.

**Request:**

- Content-Type: `multipart/form-data`
- Body: `blob` (file), `filename` (string)

**Response:**

```json
{
  "ok": boolean,
  "text": string,
  "error": string
}
```

#### POST `/api/tts`

Generates speech from text (legacy endpoint).

**Request:**

- Content-Type: `application/json`
- Body: `{ "content": string }`

**Response:**

- Audio file stream

### Server Actions

#### `simplify(model, chunks, candidateMap, contextWindowSize)`

Simplifies text chunks using AI models.

**Parameters:**

- `model`: AI model identifier
- `chunks`: Array of text chunks with new words
- `candidateMap`: Word replacement candidates
- `contextWindowSize`: Context window size

**Returns:** Array of simplified text chunks

#### `segment(text)`

Segments text into sentences using NLP.

**Parameters:**

- `text`: Input text string

**Returns:** Array of sentence strings

#### `analyzeAndFindCandidateWords(chunks, wordFreq)`

Analyzes text and finds synonym candidates.

**Parameters:**

- `chunks`: Text chunks to analyze
- `wordFreq`: Vocabulary frequency threshold (500/1000)

**Returns:** Analysis results with candidate word mappings

#### `tts(content, options)`

Generates speech from text.

**Parameters:**

- `content`: Text to convert to speech
- `options`: Voice and style options

**Returns:** Audio file URL and download URL

## Core Components

### UI Components

#### `Header`

- Application title and tagline
- Development mode detection
- Toast notifications

#### `StepIndicator`

- Multi-step workflow visualization
- Progress tracking
- Step validation

#### `Keyconfig`

- API key management
- Provider selection (OpenAI/Google)
- Key validation
- Multiple key support

#### `TextUpload`

- Text input interface
- Audio options configuration
- Simplification trigger

#### `AudioUpload`

- Audio file upload interface
- Supported format information
- Audio preview
- File management

#### `SimplifiedResult`

- Results display
- Tabbed interface (Simplified/Original)
- Audio player
- Vocabulary metrics
- Word highlighting

### State Management

#### Store Structure (`src/store/`)

- **configSlice.ts**: Main application state
- **index.ts**: Store configuration
- **typing.ts**: Type definitions

#### Key State Properties

- `currentStep`: Workflow step (0-3)
- `apikeys`: API key configurations
- `content`: Input text content
- `file`: Uploaded file
- `simplifiedResult`: Processing results
- `outputOptions`: Voice and style settings

### Utility Functions

#### `src/lib/utils.ts`

- `cn()`: Class name utility
- `timeId()`: Unique ID generation
- `getProviderFromApiKey()`: API provider detection

#### `src/actions/llm/utils.ts`

- `analyzeChunks()`: Text analysis and word identification
- Vocabulary filtering and lemmatization
- New word detection

## Workflow

### Step 1: API Key Configuration

1. User opens key configuration drawer
2. Selects or creates API key configuration
3. System validates API key
4. Key is stored and activated

### Step 2: Content Upload

1. User selects content type (text/audio)
2. For text: Direct input via textarea
3. For audio: File upload with preview
4. User configures output options (voice, style, level)

### Step 3: Processing

1. **Transcription** (if audio): Convert to text
2. **Segmentation**: Split text into sentences
3. **Analysis**: Identify complex words and find synonyms
4. **Simplification**: AI replaces complex words
5. **Audio Generation**: Convert simplified text to speech

### Step 4: Results

1. Display simplified text with highlighted new words
2. Show vocabulary coverage metrics
3. Provide audio player for generated speech
4. Allow comparison with original content

## Development Guide

### Project Structure

```
src/
├── actions/           # Server actions and API logic
│   ├── llm/          # AI/ML processing functions
│   └── keyValidation.ts
├── app/              # Next.js app router
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/       # React components
│   ├── ui/           # Reusable UI components
│   └── [feature].tsx # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── store/            # State management
├── typings/          # TypeScript type definitions
└── utils/            # Additional utilities
```

### Adding New Features

#### 1. New AI Provider

1. Add provider detection in `getProviderFromApiKey()`
2. Update API key validation
3. Add provider-specific model configurations
4. Update UI to show provider icons

#### 2. New Voice/Style Options

1. Add options to `OUTPUT_VOICES` or `OUTPUT_STYLES` in `typing.ts`
2. Update UI components to display new options
3. Ensure TTS service supports new options

#### 3. New Audio Format Support

1. Update file type validation
2. Add format information to upload component
3. Ensure transcription service supports format

### Code Style Guidelines

- Use TypeScript for all new code
- Follow React best practices
- Use Tailwind CSS for styling

## Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**

   - Link GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   Set in Vercel dashboard:

   ```
   UPSTASH_VECTOR_REST_URL
   UPSTASH_VECTOR_REST_TOKEN
   BLOB_READ_WRITE_TOKEN
   ```

3. **Deploy**
   - Automatic deployment on push to main
   - Preview deployments for pull requests

### Manual Deployment

1. **Build Application**

   ```bash
   pnpm build
   ```

2. **Start Production Server**
   ```bash
   pnpm start
   ```

### Environment Considerations

- Ensure all external service credentials are configured
- Set up proper CORS policies if needed
- Configure file upload limits
- Set up monitoring and logging

## Limitations

### File Upload Limitations

- **File Size Limit**: The application currently supports audio files up to 4.5MB in size
  - This limitation is due to Vercel's serverless function constraints
  - **Potential Solution**: Files could be uploaded to Vercel Blob storage first, which would resolve the size limitation
  - **Tradeoff**: Implementing Vercel Blob upload would add approximately 10 seconds to the upload process

### AI Provider Limitations

- **Gemini API Constraints**: Google's Gemini API has limited functionality compared to OpenAI
  - **No Transcription Support**: Gemini APIs do not provide audio transcription capabilities
  - **No Text-to-Speech Support**: Gemini APIs do not include TTS (Text-to-Speech) functionality
  - **Current Workaround**: The application falls back to OpenAI APIs for transcription and TTS even when using Gemini for text simplification
  - **Future Enhancement**: Integration with Google Cloud Speech-to-Text and Text-to-Speech APIs could provide full Gemini ecosystem support

### Technical Implications

- **Mixed Provider Usage**: When using Gemini as the primary AI provider, users still need an OpenAI API key for transcription and TTS features
- **Processing Pipeline**: The current implementation requires seamless switching between AI providers within a single workflow
- **Cost Considerations**: Using multiple AI providers may increase overall API costs for users

### Future Improvements

1. **File Upload Enhancement**

   - Implement Vercel Blob storage for large file handling
   - Add progress indicators for longer upload times
   - Provide file compression options for audio files

2. **Google Cloud Integration**

   - Integrate Google Cloud Speech-to-Text API for transcription
   - Implement Google Cloud Text-to-Speech for audio generation
   - Create unified Google ecosystem workflow

3. **User Experience**
   - Add clear warnings about file size limitations
   - Provide guidance on audio file optimization
   - Display provider capabilities in the UI

## License

This project is private and proprietary. All rights reserved.

---

_Last updated: Oct 2025_
