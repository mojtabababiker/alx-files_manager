/**
 * api routes module
 */
import * as AppController from '../controllers/AppController';
import postNew from '../controllers/UsersController';
import * as AuthController from '../controllers/AuthController';
import * as FilesController from '../controllers/FilesController';

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
  app.post('/files', FilesController.postUpload);
  app.get('/files', FilesController.getIndex);
  app.get('/files/:id', FilesController.getShow);
  app.put('/files/:id/publish', FilesController.putPublish);
  app.put('/files/:id/unpublish', FilesController.putUnpublish);
  app.get('/files/:id/data', FilesController.getFile);
}
