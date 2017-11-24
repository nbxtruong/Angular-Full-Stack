import Door from '../models/door';
import BaseCtrl from './base';

export default class DoorCtrl extends BaseCtrl {
  model = Door;

  insert = (req, res) => {
    const obj = new this.model(req.body);
    obj.save(function(err) {
      if (err) {
        if (err.obj === 'MongoError' && err.code === 11000) {
          return res.status(500).send({
            success: false
          });
        }
        // Some other error
        return res.status(500).send(err);
      }
      res.json({
        success: true
      });
    });
  }

  update = (req, res) => {
    this.model.findOneAndUpdate({ _id: req.params.id }, req.body, {runSettersOnQuery: true}, (err) => {
      if (err) { return res.status(500).send({ succes: false }); }
      res.sendStatus(200);
    });
  }

  deleteDoor = (req, res) => {
    this.model.findOne({ _id: req.params.id }, (err, obj) => {
      if (err === null) {
        if (obj.status === "Offline") {
          this.model.findOneAndUpdate({ _id: req.params.id }, req.body, (err) => {
            if (err) { return console.error(err); }
            res.sendStatus(200);
          });
        } else {res.sendStatus(403);}
      } else {return console.error(err);}
      console.log(obj);
    });
  }
}



