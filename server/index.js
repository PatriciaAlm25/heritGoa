// ═══════════════════════════════════════════════════════════════
// HeritGoa Express Server — Entry Point
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import heritageAnalysisRouter from './routes/heritageAnalysis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (http://localhost:5173 & http://localhost:3000)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'HeritGoa AI Intelligence Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/heritage', heritageAnalysisRouter);

app.listen(PORT, () => {
  console.log(`\n🏛️  HeritGoa Server running on http://localhost:${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👉 Analysis Endpoint: POST http://localhost:${PORT}/api/heritage/analyze\n`);
});
