/**
 * API app module
 */
import signApp from './routes/index';

const express = require('express');

const app = express();
app.use(express.json());

// sign the app to the route blueprint
signApp(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
