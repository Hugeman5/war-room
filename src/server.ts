import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

let latestEngineData: any = {
  price: 0,
  bias: 'NEUTRAL',
  confidence: 0,
  score: 0,
  timestamp: 0,
};

app.get('/data', (req, res) => {
  res.json(latestEngineData);
});

app.post('/update', (req, res) => {
  latestEngineData = { ...latestEngineData, ...req.body };
  res.send({ success: true });
});

app.listen(PORT, () => {
  console.log(`🌐 Dashboard running at http://localhost:${PORT}`);
});
