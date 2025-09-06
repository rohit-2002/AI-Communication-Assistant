# AI-Powered Communication Assistant

A comprehensive MERN stack email management system with AI-powered response generation, sentiment analysis, priority-based processing, and automated email sending capabilities.

## 🚀 Features

### Core Functionality

- **Email Retrieval & Filtering**: Automatically fetches and filters support-related emails
- **Smart Categorization**: AI-powered sentiment analysis and priority detection
- **Context-Aware Responses**: Generates professional, empathetic replies using OpenAI GPT
- **Priority Queue**: Urgent emails are processed first with visual indicators
- **Information Extraction**: Extracts phone numbers, emails, products, and requirements
- **Status Tracking**: Track emails from pending → responded → resolved

### Dashboard & Analytics

- **Interactive Dashboard**: Real-time overview with key metrics and urgent email alerts
- **Comprehensive Analytics**: Sentiment trends, priority distribution, timeline analysis
- **Performance Metrics**: Response times, resolution rates, top senders
- **Visual Charts**: Bar charts, pie charts, line graphs for data visualization

### User Experience

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Live data refresh and status updates
- **Search & Filters**: Advanced filtering by priority, sentiment, status, category
- **Bulk Operations**: Update multiple emails simultaneously
- **Export Capabilities**: Download reports and analytics

## 🛠 Tech Stack

### Backend (Node.js)

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT-4 for response generation
- **Email Processing**: IMAP integration for real email fetching
- **NLP**: Natural language processing for sentiment analysis
- **Security**: Helmet, CORS, rate limiting

### Frontend (React)

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icon library
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns for formatting

### Development Tools

- **Package Manager**: npm
- **Build Tool**: Vite for fast development
- **Code Quality**: ESLint for linting
- **Environment**: dotenv for configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- OpenAI API key (optional, for AI features)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Health**: http://localhost:8000/api/health

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-communication-assistant

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Email (Optional - for real email fetching)
EMAIL_ADDRESS=your_email@example.com
EMAIL_PASSWORD=your_app_password
IMAP_SERVER=imap.gmail.com

# Security
JWT_SECRET=your_jwt_secret_here
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=AI Communication Assistant
```

## 🎯 Demo Mode

The application works immediately with sample data - no configuration required!

1. Start both backend and frontend servers
2. Click "Fetch New Emails" to load demo data
3. Explore the dashboard, email list, and analytics
4. Generate AI responses and manage email statuses

## 📊 Key Features Walkthrough

### Dashboard

- **Overview Cards**: Total emails, urgent count, pending/resolved status
- **Sentiment Analysis**: Visual pie chart of positive/negative/neutral emails
- **Priority Distribution**: Bar chart showing urgent vs normal emails
- **Recent Activity**: Timeline of latest email interactions
- **Quick Actions**: Direct access to urgent emails and common tasks

### Email Management

- **Advanced Filtering**: Filter by priority, sentiment, status, category
- **Search Functionality**: Full-text search across subject, sender, and content
- **Bulk Operations**: Update multiple email statuses simultaneously
- **AI Response Generation**: One-click AI response generation with context
- **Information Extraction**: Automatic extraction of contact details and requirements

### Analytics Dashboard

- **Timeline Analysis**: Email volume trends over time (day/week/month views)
- **Performance Metrics**: Response times, resolution rates, daily averages
- **Category Breakdown**: Performance analysis by email category
- **Top Senders**: Identify frequent correspondents and their patterns
- **Sentiment Trends**: Track customer satisfaction over time

### AI Features

- **Sentiment Analysis**: Automatic emotion detection in emails
- **Priority Detection**: Smart identification of urgent emails
- **Response Generation**: Context-aware, professional reply drafting
- **Information Extraction**: Automatic parsing of contact details and requirements
- **Batch Analysis**: Insights across multiple emails

## 🏗 Architecture

### Backend Structure

```
backend/
├── middleware/
│   └── errorHandler.js             # Centralized error handling
│
├── models/
│   └── Email.js                    # Email schema/model
│
├── routes/
│   ├── aiRoutes.js                 # AI-related API endpoints
│   ├── emailRoutes.js              # Email fetch/manage endpoints
│   ├── knowledgeBaseRoutes.js      # Knowledge base CRUD endpoints
│   └── statsRoutes.js              # Analytics/statistics endpoints
│
├── services/
│   ├── aiService.js                # AI integration logic (LLM calls)
│   ├── emailSender.js              # Handles email sending
│   └── emailService.js             # Business logic for email processing
│
├── utils/
│   └── logger.js                   # Logging helper
│
├── .env.example                    # Example environment variables
├── package.json                    # Dependencies & scripts
└── server.js                       # Main entry point (Express app + DB + routes)

```

### Frontend Structure

```
frontend/
├─ src/
│  ├─ components/
│  │  ├─ Analytics.jsx       # Dashboard analytics UI
│  │  ├─ Dashboard.jsx       # Main dashboard component
│  │  ├─ EmailDetail.jsx     # Email details view
│  │  ├─ EmailList.jsx       # List of emails
│  │  ├─ EmailSender.jsx     # Component to send emails
│  │  └─ Header.jsx          # App header/navigation
│  ├─ services/
│  │  └─ api.js              # API calls for backend
│  ├─ utils/
│  │  ├─ constants.js        # App constants
│  │  └─ helpers.js          # Helper functions
│  ├─ App.css                # Global styles
│  ├─ App.jsx                # Root React component
│  ├─ index.css              # Base CSS
│  └─ main.jsx               # App entry point
├─ index.html                # HTML template
├─ package.json              # Project dependencies & scripts

```

## 🔧 API Endpoints

### Email Management

- `GET /api/emails` - Get filtered emails
- `POST /api/emails/fetch` - Fetch new emails
- `POST /api/emails/:id/generate-response` - Generate AI response
- `PUT /api/emails/:id/status` - Update email status
- `POST /api/emails/bulk/update-status` - Bulk status update

### Analytics

- `GET /api/stats` - Comprehensive statistics
- `GET /api/stats/timeline/:period` - Timeline data
- `GET /api/stats/sentiment` - Sentiment analysis
- `GET /api/stats/performance` - Performance metrics

### AI Services

- `POST /api/ai/analyze-sentiment` - Analyze text sentiment
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/ai/analyze-batch` - Batch email analysis
- `GET /api/ai/capabilities` - AI service status

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Railway, DigitalOcean)

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, AWS S3)
3. Update API URL in environment variables


## 🙏 Acknowledgments

- OpenAI for GPT API
- MongoDB for database solutions
- React and Node.js communities
- Tailwind CSS for styling framework
- All contributors and testers

---

**Built with ❤️ for the hackathon challenge**
