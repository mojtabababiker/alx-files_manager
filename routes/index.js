/**
 * api routes module
 */
import * as AppController from '../controllers/AppController';
import postNew from '../controllers/UsersController';
import * as AuthController from '../controllers/AuthController';

export default function signApp(app) {
  app.get('/status', AppController.getStatus);

  app.get('/stats', AppController.getStats);

  // user endpoints
  app.post('/users', postNew);

  // auth endpoints
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', AuthController.getMe);
}
