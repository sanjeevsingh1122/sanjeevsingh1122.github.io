import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app.js';

dotenv.config();

const port = Number(process.env.PORT) || 4000;
const server = createServer(app);

server.listen(port, () => {
  console.log(`Turbo Notes backend running on http://localhost:${port}`);
});
