/* ═══════════════════════════════════════════════════════════════
   StudyWar Institute — Curriculum Data
   AI Bootcamp: 10 modules, 23 days of structured learning
   ═══════════════════════════════════════════════════════════════ */

export interface DaySchedule {
  day: number;
  title: string;
  learning: string;   // 9:30–11:30
  practice: string;   // 11:30–1:30
  build: string;      // 1:30–3:00
  xpReward: number;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  accentFrom: string;
  accentTo: string;
  days: DaySchedule[];
}

export const MODULES: Module[] = [
  /* ─── 1. Data Foundations ─── */
  {
    id: 'data-foundations',
    number: 1,
    title: 'Data Foundations',
    subtitle: 'NumPy, Pandas & Preprocessing',
    icon: '📊',
    accentFrom: '#00d4ff',
    accentTo: '#0099cc',
    days: [
      {
        day: 1,
        title: 'NumPy Essentials',
        learning: 'NumPy arrays, indexing, broadcasting & vectorized operations',
        practice: 'Matrix operations, statistical computations, array manipulation drills',
        build: 'Build a numerical data analyzer that processes CSV data with NumPy',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'Pandas Mastery',
        learning: 'DataFrames, Series, groupby, merge, pivot tables & time series',
        practice: 'Data wrangling challenges with real-world datasets',
        build: 'Build an interactive data explorer with filtering & aggregation',
        xpReward: 25,
      },
      {
        day: 3,
        title: 'Data Preprocessing',
        learning: 'Missing values, encoding, scaling, feature engineering, pipelines',
        practice: 'Clean & preprocess messy datasets end-to-end',
        build: 'Build an automated preprocessing pipeline for ML-ready data',
        xpReward: 25,
      },
    ],
  },

  /* ─── 2. Machine Learning ─── */
  {
    id: 'machine-learning',
    number: 2,
    title: 'Machine Learning',
    subtitle: 'Supervised & Unsupervised Learning',
    icon: '🤖',
    accentFrom: '#7c3aed',
    accentTo: '#5b21b6',
    days: [
      {
        day: 1,
        title: 'Supervised Learning I',
        learning: 'Linear/Logistic Regression, Decision Trees, evaluation metrics',
        practice: 'Train & evaluate classifiers on Iris, Titanic datasets',
        build: 'Build a student performance predictor with scikit-learn',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'Supervised Learning II',
        learning: 'Random Forest, SVM, XGBoost, hyperparameter tuning',
        practice: 'Kaggle-style model comparison & cross-validation',
        build: 'Build an end-to-end ML pipeline with model selection',
        xpReward: 25,
      },
      {
        day: 3,
        title: 'Unsupervised Learning',
        learning: 'K-Means, DBSCAN, PCA, dimensionality reduction',
        practice: 'Customer segmentation & anomaly detection exercises',
        build: 'Build a customer clustering dashboard',
        xpReward: 25,
      },
    ],
  },

  /* ─── 3. Applied AI ─── */
  {
    id: 'applied-ai',
    number: 3,
    title: 'Applied AI',
    subtitle: 'Recommendation Systems & NLP',
    icon: '🎯',
    accentFrom: '#ec4899',
    accentTo: '#be185d',
    days: [
      {
        day: 1,
        title: 'Recommendation Systems',
        learning: 'Collaborative filtering, content-based, hybrid approaches',
        practice: 'Build user-item matrices, compute similarity scores',
        build: 'Build a movie recommendation engine',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'Natural Language Processing',
        learning: 'Tokenization, TF-IDF, word embeddings, sentiment analysis',
        practice: 'Text classification & sentiment analysis on product reviews',
        build: 'Build a sentiment-aware text classifier',
        xpReward: 25,
      },
    ],
  },

  /* ─── 4. Deep Learning ─── */
  {
    id: 'deep-learning',
    number: 4,
    title: 'Deep Learning',
    subtitle: 'Neural Networks & Architectures',
    icon: '🧠',
    accentFrom: '#f97316',
    accentTo: '#ea580c',
    days: [
      {
        day: 1,
        title: 'Neural Network Fundamentals',
        learning: 'Perceptrons, activation functions, backpropagation, loss functions',
        practice: 'Build neural networks from scratch with NumPy',
        build: 'Build a handwritten digit classifier (MNIST)',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'CNNs & Computer Vision',
        learning: 'Convolutional layers, pooling, transfer learning, augmentation',
        practice: 'Image classification with pretrained models',
        build: 'Build an image classifier with TensorFlow/PyTorch',
        xpReward: 25,
      },
      {
        day: 3,
        title: 'RNNs & Sequence Models',
        learning: 'RNN, LSTM, GRU, sequence-to-sequence, attention mechanism',
        practice: 'Text generation & time series forecasting',
        build: 'Build a text generator using LSTM',
        xpReward: 25,
      },
    ],
  },

  /* ─── 5. Generative AI ─── */
  {
    id: 'generative-ai',
    number: 5,
    title: 'Generative AI',
    subtitle: 'Gemini API & RAG Systems',
    icon: '✨',
    accentFrom: '#00ff88',
    accentTo: '#059669',
    days: [
      {
        day: 1,
        title: 'Gemini API & Prompting',
        learning: 'Gemini API setup, prompt engineering, system instructions, multimodal',
        practice: 'Craft effective prompts, chain-of-thought, few-shot learning',
        build: 'Build a Gemini-powered AI assistant',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'RAG Systems',
        learning: 'Retrieval-Augmented Generation, vector stores, embeddings, chunking',
        practice: 'Build vector indexes with ChromaDB/FAISS',
        build: 'Build a RAG chatbot that answers from your documents',
        xpReward: 25,
      },
    ],
  },

  /* ─── 6. LangChain ─── */
  {
    id: 'langchain',
    number: 6,
    title: 'LangChain',
    subtitle: 'Chains, Memory & Tools',
    icon: '🔗',
    accentFrom: '#8b5cf6',
    accentTo: '#6d28d9',
    days: [
      {
        day: 1,
        title: 'LangChain Fundamentals',
        learning: 'Chains, prompts, output parsers, memory types, LangChain Expression Language',
        practice: 'Build sequential & parallel chains, conversational memory',
        build: 'Build a conversational AI with persistent memory',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'LangChain Advanced',
        learning: 'Tools, retrievers, agents in LangChain, LangSmith tracing',
        practice: 'Integrate external APIs as tools, build retrieval chains',
        build: 'Build a research assistant that searches & summarizes',
        xpReward: 25,
      },
    ],
  },

  /* ─── 7. Agents ─── */
  {
    id: 'agents',
    number: 7,
    title: 'Agents',
    subtitle: 'Autonomous AI Agents',
    icon: '🕵️',
    accentFrom: '#06b6d4',
    accentTo: '#0891b2',
    days: [
      {
        day: 1,
        title: 'Agent Fundamentals',
        learning: 'ReAct pattern, tool use, planning, function calling, agent loops',
        practice: 'Build agents that reason, plan & execute multi-step tasks',
        build: 'Build an autonomous coding agent',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'Advanced Agent Patterns',
        learning: 'Agent evaluation, error recovery, structured output, guardrails',
        practice: 'Implement retry logic, output validation, agent benchmarks',
        build: 'Build a production-ready agent with error handling',
        xpReward: 25,
      },
    ],
  },

  /* ─── 8. Multi-Agent Systems ─── */
  {
    id: 'multi-agent',
    number: 8,
    title: 'Multi-Agent Systems',
    subtitle: 'CrewAI & MCP',
    icon: '👥',
    accentFrom: '#f43f5e',
    accentTo: '#e11d48',
    days: [
      {
        day: 1,
        title: 'CrewAI',
        learning: 'Multi-agent orchestration, roles, tasks, processes, delegation',
        practice: 'Design agent crews with specialized roles & workflows',
        build: 'Build a content creation crew (researcher, writer, editor)',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'MCP & Agent Communication',
        learning: 'Model Context Protocol, inter-agent messaging, shared state',
        practice: 'Implement agent communication patterns & state sharing',
        build: 'Build a multi-agent system with MCP integration',
        xpReward: 25,
      },
    ],
  },

  /* ─── 9. Backend ─── */
  {
    id: 'backend',
    number: 9,
    title: 'Backend',
    subtitle: 'Flask & FastAPI',
    icon: '⚙️',
    accentFrom: '#eab308',
    accentTo: '#ca8a04',
    days: [
      {
        day: 1,
        title: 'Flask Fundamentals',
        learning: 'Flask routes, templates, REST APIs, middleware, authentication',
        practice: 'Build CRUD endpoints, handle errors, add auth middleware',
        build: 'Build a Flask REST API for an AI model serving endpoint',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'FastAPI & Async',
        learning: 'FastAPI, Pydantic models, async/await, WebSockets, deployment',
        practice: 'Build async endpoints, validate with Pydantic, add WebSocket support',
        build: 'Build a FastAPI backend with real-time AI inference',
        xpReward: 25,
      },
    ],
  },

  /* ─── 10. App Development ─── */
  {
    id: 'app-development',
    number: 10,
    title: 'App Development',
    subtitle: 'Streamlit, HuggingFace & Transformers',
    icon: '🚀',
    accentFrom: '#a855f7',
    accentTo: '#7e22ce',
    days: [
      {
        day: 1,
        title: 'Streamlit & HuggingFace',
        learning: 'Streamlit UI components, HuggingFace Spaces, model deployment',
        practice: 'Build interactive dashboards, deploy models to HuggingFace',
        build: 'Build & deploy a Streamlit AI app on HuggingFace Spaces',
        xpReward: 25,
      },
      {
        day: 2,
        title: 'Transformers & Production',
        learning: 'HuggingFace Transformers, fine-tuning, inference optimization',
        practice: 'Fine-tune a model, optimize with quantization & caching',
        build: 'Build a production AI app with a fine-tuned transformer model',
        xpReward: 25,
      },
    ],
  },
];

/* ─── Helper: compute totals ─── */
export const TOTAL_DAYS = MODULES.reduce((sum, m) => sum + m.days.length, 0);
export const TOTAL_XP = MODULES.reduce(
  (sum, m) => sum + m.days.reduce((s, d) => s + d.xpReward, 0),
  0
);
