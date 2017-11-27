import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

import User from '../models/user';
import BaseCtrl from './base';

import { FaceRecognizer } from '../face/facerecognizer';
const fr = new FaceRecognizer();
export default class UserCtrl extends BaseCtrl {
  model = User;

  login = (req, res) => {
    this.model.findOne({ username: req.body.username }, (err, user) => {
      if (!user) {
        return res.sendStatus(403);
      } else if (user.database === 'local') {
        user.comparePassword(req.body.password, (error, isMatch) => {
          if (!isMatch) { return res.sendStatus(403); }
          const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
          res.status(200).json({ token: token, user: user });
        });
      } else if (user.database === 'ldap') {
        var ldap = require('ldapjs');
        var assert = require('assert');

        var client = ldap.createClient({
          url: 'ldap://192.168.1.234:389'
        });

        client.bind('uid=' + req.body.username + ',ou=users,dc=tma,dc=com,dc=vn', req.body.password, function (err) {
          if (err) {
            console.log("Error: " + err);
            return res.sendStatus(403);
          } else {
            const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
            res.status(200).json({ token: token, user: user });
          }
        });
      }
    });
  }

  train = (req, res) => {
    fr.beginTraining();
    return res.status(200).json({ Reply: "Training started" });
  }

  saveTrained = (req, res) => {
    let rs = 0;
    rs = fr.saveTrainingData();
    if (rs === 3) {
      return res.status(200).json({ Reply: "Training started" });
    }
    else {
      return res.status(403).json({ Reply: "Oops,sorry!Something wrong happened at our end", ErrorStep: rs });
    }
  }

  saveImage = (req, res) => {
    let rs = 0;
    let image64 = req.body.image64;
    let filename = req.body.imagename;
    let id = req.params.id;
    rs = fr.saveImage(image64, filename, id);
    if (rs === 1) {
      return res.status(200).json({ Reply: "Image saved successfully" });
    }
    else {
      return res.status(500).json({ Reply: "Oops,sorry!Something wrong happened at our end" });
    }
  }

  identify = (req, res, next) => {
    let image64 = req.body.image64;
    let filename = req.body.imagename;
    let itv = setInterval(function () {
      if (fr.finding === 0) {
        fr.faceIndentify(image64, filename, function (result) {
          console.log("sending response..." + result.id + ".." + result.confidence);
          var rs = { id: result.id, conf: 100.0 - result.confidence };
          res.status(200).json({ id: rs.id, conf: rs.conf });
        });
        clearInterval(itv);
      }
    }, 200);
  }

  deleteUser = (req, res) => {
    let id = req.params.id;
    fr.deleteUser(id);
    setTimeout(function () {
      fr.beginTraining();
    }, 5000);
    return res.status(200).json({ Reply: "User deleted" });
  }
}
