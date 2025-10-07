# PrepSmart 📚✨

> AI-Powered Collaborative Lesson Plan & Content Generator

PrepSmart is an innovative educational platform that empowers teachers to create engaging lesson plans and educational content effortlessly. With real-time collaboration features and AI-powered content generation, PrepSmart streamlines the workflow for educators and educational institutions.

## 🌟 Features

### Core Features
- 🤖 **AI Lesson Plan Generator** - Generate comprehensive lesson plans tailored to your curriculum and student needs
- 🔄 **Real-time Collaboration** - Collaborate with colleagues on lesson plans and content in real-time using Liveblocks
- 📚 **Template Library** - Access pre-designed templates for different subjects and grade levels
- ✅ **Approval Workflow** - Streamline your approval process with built-in workflow tools
- 🎯 **Content Generation** - AI-powered content creation using Google's Gemini AI
- 📄 **PDF Integration** - Upload and process PDF textbooks for enhanced content generation
- 🔍 **Vector Search** - Intelligent search and retrieval using embeddings and vector database
- 👥 **Multi-role Support** - Support for Teachers, HODs, and collaborative workflows

### Technical Features
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌙 **Dark Mode Support** - Toggle between light and dark themes
- 🔐 **Secure Authentication** - Built with Supabase Auth
- 📊 **Real-time Updates** - Live collaboration and instant synchronization
- 🚀 **Modern Tech Stack** - Built with Next.js, FastAPI, and PostgreSQL

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Real-time Collaboration**: Liveblocks + Yjs
- **Rich Text Editor**: Tiptap
- **UI Components**: Custom components with Lucide React icons
- **Authentication**: Supabase Auth
- **State Management**: React Context + Hooks

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with Supabase
- **Vector Database**: pgvector for embeddings
- **AI/ML**: Google Gemini AI for content generation
- **File Processing**: PDFPlumber for PDF text extraction
- **Authentication**: Supabase (server-side)

### Database Schema
- **Users**: User profiles and authentication
- **Templates**: Lesson plan templates
- **User Templates**: Custom user-created templates
- **Drafts**: Work-in-progress content with versioning
- **Vector Tables**: Embeddings for smart content retrieval

## �🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.12+
- PostgreSQL database (Supabase recommended)
- Google AI API key (for Gemini)
- Liveblocks account (for real-time collaboration)

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_API_KEY=your_google_gemini_api_key
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key
```

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Hacker-Ring/PrepSmart.git
cd PrepSmart
```

#### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

#### 3. Set up Database
Run the SQL files in the `backend/` directory to set up your database tables:
```sql
-- Run these in your PostgreSQL/Supabase SQL editor
-- 1. create_draft_submissions_table.sql
-- 2. create_draft_versions_table.sql
-- 3. create_profile.sql
-- 4. create_profiles_table.sql
-- 5. profile_picture_storage.sql
```

#### 4. Initialize Vector Database
```bash
cd backend
python scripts/ingest_textbooks.py   # Process and embed PDF textbooks
python scripts/ingest_templates.py   # Process template data
```

#### 5. Start Development Servers

**Backend:**
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
PrepSmart/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── auth/           # Authentication pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   │   ├── teacher/    # Teacher-specific pages
│   │   │   │   ├── hod/        # HOD-specific pages
│   │   │   │   └── profile/    # User profile pages
│   │   │   └── api/            # API routes
│   │   ├── components/         # Reusable React components
│   │   │   ├── CollaborativeEditor.tsx
│   │   │   ├── CollaboratorList.tsx
│   │   │   ├── HistorySidebar.tsx
│   │   │   └── ...
│   │   ├── context/            # React Context providers
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   └── package.json
├── backend/                     # FastAPI Backend
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   │   ├── collaborators.py
│   │   │   ├── drafts.py
│   │   │   └── templates.py
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── llm.py              # AI/ML integration
│   │   ├── supabase_vector.py  # Vector database operations
│   │   └── embed_user_template.py
│   ├── scripts/                # Utility scripts
│   │   ├── ingest_textbooks.py
│   │   ├── ingest_templates.py
│   │   └── test_pg_connection.py
│   ├── pdfs/                   # Sample PDF textbooks
│   ├── requirements.txt        # Python dependencies
│   └── *.sql                   # Database schema files
├── render.yaml                 # Render deployment config
└── package.json               # Root package.json
```

## 🎯 Key Components

### CollaborativeEditor
Real-time collaborative rich text editor built with Tiptap and Liveblocks:
- Multi-user editing with live cursors
- Rich formatting options
- Markdown support
- Version history tracking

### Template System
Flexible template management:
- Pre-built curriculum templates
- Custom user templates
- AI-powered content suggestions
- Template sharing and collaboration

### AI Content Generation
Intelligent content creation using:
- RAG (Retrieval Augmented Generation)
- Vector similarity search
- Contextual content suggestions
- Curriculum-aligned outputs

### Approval Workflow
Streamlined review process:
- Draft submissions
- Multi-level approvals
- Comment and feedback system
- Version tracking

## 🚀 Deployment

### Backend (Render)
## Project Environment & Setup

- **Language & Version:** Python 3.11
- **Branch:** `main`
- **Region:** Asia (for better Supabase latency)

### Build Command

```bash
pip install -r requirements.txt
```

### Start Command

```bash
uvicorn src.main:app --host 0.0.0.0 --port 10000
```
### Frontend (Vercel)
Deploy the frontend to Vercel:

```bash
cd frontend
npm run build
# Deploy to Vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use proper error handling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the provided SQL schema files
3. Enable pgvector extension
4. Configure Row Level Security (RLS) policies
5. Set up authentication providers

### Liveblocks Setup
1. Create a Liveblocks account
2. Create a new project
3. Get your API keys
4. Configure authentication

### Google AI Setup
1. Get a Google AI API key
2. Enable the Gemini API
3. Configure rate limits and usage

## 📊 Features Roadmap

### Completed ✅
- Real-time collaborative editing
- AI content generation
- Template management
- User authentication
- PDF processing
- Vector search

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Hacker-Ring Organization**
- Repository: [PrepSmart (Cogniverse)](https://github.com/Hacker-Ring/Cogniverse)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for database and authentication
- [Liveblocks](https://liveblocks.io) for real-time collaboration
- [Tiptap](https://tiptap.dev) for the rich text editor
- [Google AI](https://ai.google.dev) for Gemini API
- [Vercel](https://vercel.com) and [Render](https://render.com) for deployment platforms

---

**Happy Teaching! 🎓✨**

For support or questions, please open an issue on GitHub or contact the development team.