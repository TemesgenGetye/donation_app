const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load Swagger YAML file
const swaggerPath = path.join(__dirname, '../../swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Donation Platform - Unified API Documentation',
    customfavIcon: '/favicon.ico',
  })
);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Donation Platform - Unified API Documentation Server',
    version: '1.0.0',
    endpoints: {
      apiDocs: '/api-docs',
      donationService: 'http://localhost:3001',
      campaignService: 'http://localhost:3002',
    },
    services: {
      donation: {
        url: 'http://localhost:3001',
        docs: 'http://localhost:3001/api-docs',
        health: 'http://localhost:3001/health',
      },
      campaign: {
        url: 'http://localhost:3002',
        docs: 'http://localhost:3002/api-docs',
        health: 'http://localhost:3002/health',
      },
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-docs-server',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📚 API Documentation Server running on port ${PORT}`);
  console.log(`📖 Unified API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🏠 Home: http://localhost:${PORT}/`);
  console.log(`\n📋 Individual Service Docs:`);
  console.log(`   - Donation Service: http://localhost:3001/api-docs`);
  console.log(`   - Campaign Service: http://localhost:3002/api-docs`);
});

