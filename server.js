/**
 * API app module
 */
import signApp from './routes/index';

const express = require('express');

// console.log(express);
// process.exit();
const app = express();
app.use(express.json());

// sign the app to the route blueprint
signApp(app);

app.listen(5000);
