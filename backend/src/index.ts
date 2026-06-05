import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { apiRouter, errorHandler } from './routes.js';
import { ensureSeeded } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openapiPath = path.join(__dirname, '..', 'openapi.yaml');

ensureSeeded();

const app = express();
app.use(cors());
app.use(express.json());

const openapi = YAML.load(openapiPath);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/api/openapi.json', (_req, res) => res.json(openapi));

app.use('/api', apiRouter);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
});
