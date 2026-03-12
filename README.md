# TalentMatch AI 🚀

TalentMatch AI is a powerful, rule-based resume and job description matching system designed to streamline the recruitment process. It intelligently parses resumes and job descriptions (JDs), identifies key skills, and calculates a compatibility score to help recruiters find the best candidates.

---

## 🌟 Key Features

- **Multi-Format Parsing**: Supports PDF, DOC, DOCX, and plain text for both resumes and JDs.
- **Intelligent Skill Extraction**: Automatically identifies and categorizes skills from uploaded documents.
- **Automated Matching**: Compares candidate skills against job requirements to generate a compatibility score.
- **Skill Gap Analysis**: Highlighting both present and missing skills to provide actionable insights.
- **Modern UI/UX**: Built with Next.js 14, Framer Motion, and Three.js for a sleek, responsive experience.
- **Secure Authentication**: Integrated with Clerk for seamless user management.
- **Detailed History**: Keep track of previous matching sessions and candidate analyses.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **State Management**: Zustand
- **Auth**: Clerk

### **Backend**
- **Runtime**: Node.js, TypeScript
- **Framework**: Express.js
- **Database**: Prisma (PostgreSQL / MongoDB)
- **File Handling**: Multer, PDF-parse, Mammoth (for DOCX)
- **Validation**: Joi
- **Logging**: Winston

---

## 📁 Project Structure

```text
TalentMatch-AI/
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App Router (pages & APIs)
│   │   ├── components/     # UI Components
│   │   ├── hooks/          # Custom React Hooks
│   │   └── lib/            # Utility functions & API Client
│   └── ...
├── src/                    # Express Backend
│   ├── routes/             # API Route Handlers
│   ├── services/           # Business Logic (parsers, matchers)
│   ├── types/              # TypeScript Definitions
│   └── app.ts              # Express Application Setup
├── prisma/                 # Database Schema & Seed scripts
├── uploads/                # Temporary file storage (gitignored)
└── ...
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- npm or yarn
- A PostgreSQL or MongoDB instance (for Prisma)

### **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yashu1412/TalentMatch-AI.git
   cd TalentMatch-AI
   ```

2. **Backend Setup**:
   ```bash
   # Install dependencies
   npm install

   # Setup environment variables
   cp .env.example .env
   # Edit .env with your database URL and other settings

   # Generate Prisma client and seed data
   npm run db:generate
   npm run db:seed

   # Start dev server
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd client
   # Install dependencies
   npm install

   # Setup environment variables
   cp .env.example .env
   # Edit .env with your Clerk keys and backend URL

   # Start Next.js dev server
   npm run dev
   ```

The application will be available at `http://localhost:3000` (Frontend) and `http://localhost:3002` (Backend).

---

## 📡 API Endpoints (Brief)

- `POST /api/parse/resume/file`: Upload and parse a resume file.
- `POST /api/parse/jd/text`: Parse a job description from raw text.
- `POST /api/match/single`: Execute matching between a parsed resume and JD.
- `GET /api/history`: Retrieve match analysis history.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any bugs or feature requests.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
