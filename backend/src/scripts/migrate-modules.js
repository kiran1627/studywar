require('dotenv').config();
const mongoose = require('mongoose');
const Module = require('../models/Module');
const connectDB = require('../config/db');

const MODULE_META = [
  { id: 'data-foundations', title: 'Data Foundations', days: 3, order: 1, icon: '📊' },
  { id: 'machine-learning', title: 'Machine Learning', days: 3, order: 2, icon: '🤖' },
  { id: 'applied-ai', title: 'Applied AI', days: 2, order: 3, icon: '💡' },
  { id: 'deep-learning', title: 'Deep Learning', days: 3, order: 4, icon: '🧠' },
  { id: 'generative-ai', title: 'Generative AI', days: 2, order: 5, icon: '🎨' },
  { id: 'langchain', title: 'LangChain', days: 2, order: 6, icon: '🔗' },
  { id: 'agents', title: 'Agents', days: 2, order: 7, icon: '🕵️' },
  { id: 'multi-agent', title: 'Multi-Agent Systems', days: 2, order: 8, icon: '👥' },
  { id: 'backend', title: 'Backend', days: 2, order: 9, icon: '⚙️' },
  { id: 'app-development', title: 'App Development', days: 2, order: 10, icon: '📱' },
];

const migrateModules = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    for (const m of MODULE_META) {
      await Module.findOneAndUpdate(
        { id: m.id },
        m,
        { upsert: true, new: true }
      );
      console.log(`Migrated/Updated module: ${m.id}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateModules();
