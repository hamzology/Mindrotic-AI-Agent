const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { analyzeTask, executePlan } = require('./src/agent');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/analyze', analyzeTask);
app.get('/execute', executePlan);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});