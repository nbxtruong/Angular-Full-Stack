abstract class BaseCtrl {

  abstract model: any;

  // Get all
  getAll = (req, res) => {
    this.model.find({}, (err, docs) => {
      if (err) { return console.error(err); }
      res.json(docs);
    });
  }

  // Count all
  count = (req, res) => {
    this.model.count((err, count) => {
      if (err) { return console.error(err); }
      res.json(count);
    });
  }

  // Insert
  insert = (req, res) => {
    const obj = new this.model(req.body);
    obj.save((err, item) => {
      // 11000 is the code for duplicate key error
      if (err && err.code === 11000) {
        res.sendStatus(400);
      }
      if (err) {
        return console.error(err);
      }
      res.status(200).json(item);
    });
  }

  // Get by id
  get = (req, res) => {
    this.model.findOne({ _id: req.params.id }, (err, obj) => {
      if (err) { return console.error(err); }
      res.json(obj);
    });
  }

  // Update by id
  update = (req, res) => {
    this.model.findOneAndUpdate({ _id: req.params.id }, req.body, (err) => {
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  }

  // softDelete by id
  softDelete = (req, res) => {
    this.model.findOne({ _id: req.params.id }, (err, obj) => {
      if (err === null) {
        if ((req.body.role.localeCompare('user') === -1) && (req.body.role.localeCompare('admin') === -1) && (req.body.role.localeCompare('superAdmin') === -1)) {
          console.log('Who are you?');
          res.sendStatus(406);
        } else if (req.body.role === 'use' || req.body.role === null) {
          console.log('User can not use this API');
          res.sendStatus(406);
        } else if ((req.body.role === 'admin' && obj.role === 'admin') || (req.body.role === 'admin' && obj.role === 'superAdmin') || (req.body.role === 'superAdmin' && obj.role === 'superAdmin')) {
          console.log(req.body.role + 'can not delete ' + obj.role);
          res.sendStatus(406);
        } else {
          console.log('Deleted user name' + obj.username);
          obj.isDeleted = true;
          this.model.findOneAndUpdate({ _id: obj.id }, obj, (err) => {
            if (err) { return console.error(err); }
            res.sendStatus(200);
          });
        }
      } else { return console.error(err); }
    });
  }

  // Delete by id
  delete = (req, res) => {
    this.model.findOneAndRemove({ _id: req.params.id }, (err) => {
      if (err) { return console.error(err); }
      res.sendStatus(200);
    });
  }
}

export default BaseCtrl;
