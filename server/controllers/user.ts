import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

import User from '../models/user';
import BaseCtrl from './base';

import {FaceRecognizer} from '../face/facerecognizer';
const fr =new FaceRecognizer();
export default class UserCtrl extends BaseCtrl {
  model = User;

  login = (req, res) => {
    this.model.findOne({ email: req.body.email }, (err, user) => {
      if (!user) { return res.sendStatus(403); }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) { return res.sendStatus(403); }
        const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
        res.status(200).json({ token: token });
      });
    });
  }
  train = (req,res) =>{
    console.log("called");
    let rs=0;
    rs=fr.getcvImages();
    rs = fr.beginTraining();
    rs = fr.saveTrainingData();
    if(rs===3)
    {
      res.status(200).json({Reply:"Training started"});
    }
    else
    {
      res.status(403).json({Reply:"Oops,something wrong happened at our end"});
    }
  }
  saveTrained = (req,res) =>{
    let rs=0;
    rs=fr.saveTrainingData();   
    if(rs===3)
    {
      res.status(200).json({Reply:"Training started"});
    }
    else
    {
      res.status(403).json({Reply:"Oops,sorry!Something wrong happened at our end",ErrorStep:rs});
    }
  }
  saveImage = (req,res)=>{
    let rs = 0;
    let image64 = req.body.image64;
    let filename = req.body.imagename;
    let id = req.params.id;
    rs = fr.saveImage(image64,filename,id);
    if(rs===1)
    {
      res.status(200).json({Reply:"Image saved successfully"});
    }
    else
    {
      res.status(500).json({Reply:"Oops,sorry!Something wrong happened at our end"});
    }
  }
  identify=(req,res) =>{
    let image64 = req.body.image64;
    let filename = req.body.imagename;
    fr.faceIndentify(image64, filename, function(result) {
      res.status(200).json({id:result.id,conf:(100.0-result.confidence)});
    });
  }
  deleteUser= (req,res)=>{
    let id = req.params.id;
    fr.deleteUser(id);
    res.status(200).json({Reply:"User deleted"});
    setTimeout(function(){
      fr.beginTraining();
          },5000);
  }
}
