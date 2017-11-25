import * as express from 'express';

import CatCtrl from './controllers/cat';
import DoorCtrl from './controllers/door';
import UserCtrl from './controllers/user';
import Cat from './models/cat';
import Door from './models/door';
import User from './models/user';
export default function setRoutes(app) {

  const router = express.Router();

  const catCtrl = new CatCtrl();
  const doorCtrl = new DoorCtrl();
  const userCtrl = new UserCtrl();

  // Cats
  router.route('/cats').get(catCtrl.getAll);
  router.route('/cats/count').get(catCtrl.count);
  router.route('/cat').post(catCtrl.insert);
  router.route('/cat/:id').get(catCtrl.get);
  router.route('/cat/:id').put(catCtrl.update);
  router.route('/cat/:id').delete(catCtrl.delete);
  // Door
  router.route('/doors').get(doorCtrl.getAll);
  router.route('/doors/count').get(doorCtrl.count);
  router.route('/door').post(doorCtrl.insert);
  router.route('/door/:id').get(doorCtrl.get);
  router.route('/door/:id').put(doorCtrl.update);
  router.route('/deleteDoor/:id').put(doorCtrl.deleteDoor);
  // Users
  router.route('/login').post(userCtrl.login);
  router.route('/users').get(userCtrl.getAll);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.insert);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/softDeleteUser/:id').put(userCtrl.softDelete);
  router.route('/user/:id').delete(userCtrl.delete);
  router.route('/face/train/start').post(userCtrl.train);
  router.route('/face/train/save').post(userCtrl.saveTrained);
  router.route('/face/image/save/:id').post(userCtrl.saveImage);
  router.route('/face/identify').post(userCtrl.identify);
  router.route('/face/image/delete/:id').post(userCtrl.deleteUser);
  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
}
