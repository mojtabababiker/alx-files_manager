/**
 * api routes module
 */
import * as AppController from '../controllers/AppController';
import postNew from '../controllers/UsersController';
import * as AuthController from '../controllers/AuthController';
import { postUpload, getShow, getIndex } from '../controllers/FilesController';

export default function signApp(app) {
  app.get('/status', AppController.getStatus);

  app.get('/stats', AppController.getStats);

  // user endpoints
  app.post('/users', postNew);

  // auth endpoints
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', AuthController.getMe);

  // file endpoint
  app.post('/files', postUpload);
  app.get('/files', getIndex);
  app.get('/files/:id', getShow);
}
