import fs from 'fs';
import path from 'path';

// Generate IDs
let idCounter = 1;
const genId = (prefix: string) => `${prefix}_${idCounter++}`;

const createChecklist = (subtopicTitle: string) => {
  return [
    { id: genId("chk"), title: "Learning Objective", type: "learning-objective", estimatedMinutes: 5, difficulty: "beginner", tags: [] },
    { id: genId("chk"), title: "Theory Checklist", type: "theory", estimatedMinutes: 30, difficulty: "beginner", tags: [] },
    { id: genId("chk"), title: "Practical Checklist", type: "practical", estimatedMinutes: 45, difficulty: "intermediate", tags: [] },
    { id: genId("chk"), title: "Mini Project", type: "mini-project", estimatedMinutes: 120, difficulty: "intermediate", tags: [] },
    { id: genId("chk"), title: "Practice Problems", type: "practice-problem", estimatedMinutes: 60, difficulty: "intermediate", tags: [] },
    { id: genId("chk"), title: "Interview Questions", type: "interview-question", estimatedMinutes: 30, difficulty: "advanced", tags: [] },
    { id: genId("chk"), title: "Revision Checklist", type: "revision-task", estimatedMinutes: 15, difficulty: "beginner", tags: [] },
    { id: genId("chk"), title: "Recommended Resources", type: "resource", estimatedMinutes: 10, difficulty: "beginner", tags: [] }
  ];
};

const makeSubtopics = (topicTitle: string, explicitSubtopics: string[] = []) => {
  const subs = explicitSubtopics.length > 0 ? explicitSubtopics : [topicTitle + " Basics"];
  return subs.map(sub => ({
    id: genId("sub"),
    title: sub,
    checklist: createChecklist(sub)
  }));
};

const makeTopics = (topicTitles: string[]) => {
  return topicTitles.map(t => ({
    id: genId("top"),
    title: t,
    subtopics: makeSubtopics(t)
  }));
};

const makeModules = (modulesData: any[]) => {
  return modulesData.map(m => ({
    id: genId("mod"),
    title: m.title,
    topics: makeTopics(m.topics)
  }));
};

// Raw structure from prompt
const phasesData = [
  {
    title: "PHASE 1 — Engineering Mindset",
    description: "Foundational mindset and tools.",
    modules: [
      { title: "Developer Fundamentals", topics: ["Mindset", "Problem Solving"] },
      { title: "Git & GitHub", topics: ["Version Control", "Branching"] },
      { title: "Linux & Terminal", topics: ["Commands", "Permissions"] },
      { title: "VS Code Mastery", topics: ["Extensions", "Shortcuts"] },
      { title: "Debugging", topics: ["Techniques", "Tools"] },
      { title: "Documentation", topics: ["Markdown", "Writing Docs"] }
    ]
  },
  {
    title: "PHASE 2 — Python Programming",
    description: "Core language mastery.",
    modules: [
      { title: "Module 1 — Python Fundamentals", topics: ["Variables", "Data Types", "Operators", "Input & Output", "Type Conversion"] },
      { title: "Module 2 — Control Flow", topics: ["if/elif/else", "loops", "break/continue/pass"] },
      { title: "Module 3 — Functions", topics: ["Parameters & Arguments", "Return values", "Scope", "Lambda", "Recursion"] },
      { title: "Module 4 — Data Structures", topics: ["List", "Tuple", "Dictionary", "Set"] },
      { title: "Module 5 — Object Oriented Programming", topics: ["Classes & Objects", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "Magic Methods"] },
      { title: "Module 6 — Advanced Python", topics: ["Decorators", "Generators", "Context Managers", "Asyncio", "Typing"] },
      { title: "Module 7 — Testing", topics: ["pytest", "Mocking", "Fixtures"] }
    ]
  },
  {
    title: "PHASE 3 — Problem Solving & Data Structures",
    description: "Algorithmic thinking and core DSA.",
    modules: [
      { title: "Complexity Analysis", topics: ["Big O", "Time/Space Complexity"] },
      { title: "Arrays & Strings", topics: ["Two Pointers", "Sliding Window"] },
      { title: "Hashing", topics: ["Hash Maps", "Hash Sets"] },
      { title: "Linked Lists", topics: ["Singly Linked List", "Fast & Slow Pointers"] },
      { title: "Trees & Graphs", topics: ["Binary Trees", "BST", "DFS", "BFS"] },
      { title: "Advanced Algorithms", topics: ["Recursion", "Backtracking", "Dynamic Programming", "Greedy"] }
    ]
  },
  {
    title: "PHASE 4 — Backend Engineering",
    description: "Building scalable web services.",
    modules: [
      { title: "HTTP", topics: ["Requests & Responses", "Methods & Status Codes", "Headers & Cookies"] },
      { title: "REST APIs", topics: ["CRUD", "Routing", "Pagination & Filtering", "API Versioning"] },
      { title: "Express.js", topics: ["Middleware", "Error Handling", "Folder Structure"] },
      { title: "Authentication", topics: ["Sessions", "JWT", "OAuth", "RBAC"] },
      { title: "Security", topics: ["CORS", "CSRF", "XSS", "Rate Limiting", "Password Hashing"] }
    ]
  },
  {
    title: "PHASE 5 — Databases",
    description: "Data storage and management.",
    modules: [
      { title: "SQL", topics: ["Schema Design", "Relationships", "Normalization", "Indexes", "Transactions", "Joins"] },
      { title: "MongoDB", topics: ["Documents", "Aggregation", "Indexing"] },
      { title: "Redis", topics: ["Caching", "Pub/Sub"] }
    ]
  },
  {
    title: "PHASE 6 — Software Engineering",
    description: "Architecture and clean code.",
    modules: [
      { title: "Principles", topics: ["SOLID", "DRY", "KISS"] },
      { title: "Architecture", topics: ["Clean Architecture", "Repository Pattern", "Dependency Injection"] },
      { title: "Practices", topics: ["Design Patterns", "Refactoring", "CI/CD"] }
    ]
  },
  {
    title: "PHASE 7 — Computer Science Fundamentals",
    description: "OS, Networks, and DBMS.",
    modules: [
      { title: "Operating Systems", topics: ["Processes & Threads", "Scheduling", "Memory"] },
      { title: "Computer Networks", topics: ["TCP/IP", "DNS", "HTTPS", "WebSockets"] },
      { title: "DBMS", topics: ["ACID", "Isolation Levels", "Locking"] }
    ]
  },
  {
    title: "PHASE 8 — Cloud & DevOps",
    description: "Deploying and maintaining systems.",
    modules: [
      { title: "Containers", topics: ["Docker", "Docker Compose"] },
      { title: "Orchestration", topics: ["Kubernetes Basics"] },
      { title: "Cloud & Infrastructure", topics: ["AWS Fundamentals", "GitHub Actions", "Nginx"] }
    ]
  },
  {
    title: "PHASE 9 — System Design",
    description: "Scaling distributed systems.",
    modules: [
      { title: "Concepts", topics: ["Scalability", "Load Balancer", "Cache", "Microservices", "Event Driven Architecture"] },
      { title: "Projects", topics: ["URL Shortener", "Chat Application", "Instagram", "Uber"] }
    ]
  },
  {
    title: "PHASE 10 — AI Engineering",
    description: "Integrating LLMs and AI into systems.",
    modules: [
      { title: "Machine Learning Basics", topics: ["Regression", "Classification"] },
      { title: "Deep Learning", topics: ["Neural Networks", "Transformers"] },
      { title: "LLMs", topics: ["Tokens & Embeddings", "Attention", "Fine-tuning"] },
      { title: "AI Application", topics: ["Prompt Engineering", "Vector Databases", "RAG", "AI Agents", "Evaluation"] }
    ]
  },
  {
    title: "PHASE 11 — Cyber Security Fundamentals",
    description: "Defending applications.",
    modules: [
      { title: "Fundamentals", topics: ["OWASP Top 10", "Cryptography Basics"] },
      { title: "Application Security", topics: ["JWT Security", "API Security"] }
    ]
  },
  {
    title: "PHASE 12 — Open Source & GitHub",
    description: "Collaborating in the open.",
    modules: [
      { title: "Workflow", topics: ["Git Workflow", "Issues & PRs", "Code Reviews"] }
    ]
  },
  {
    title: "PHASE 13 — Career Preparation",
    description: "Landing the job.",
    modules: [
      { title: "Profile", topics: ["Resume", "GitHub Profile", "Portfolio"] },
      { title: "Interviews", topics: ["Behavioral Interviews", "Mock Interviews", "Salary Negotiation"] }
    ]
  }
];

const roadmap = {
  id: "roadmap_1",
  title: "AI Backend Engineer",
  description: "The complete path to becoming a production-ready AI Backend Engineer.",
  phases: phasesData.map(p => ({
    id: genId("phase"),
    title: p.title,
    description: p.description,
    modules: makeModules(p.modules)
  }))
};

const outputPath = path.resolve(import.meta.dirname, '../data/roadmap.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(roadmap, null, 2));

console.log(`Successfully generated roadmap data at ${outputPath}`);
