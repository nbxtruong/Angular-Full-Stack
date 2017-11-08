import * as path from 'path';
import * as cv2 from 'opencv2';
const fs = require('fs');
const FaceRecog = new cv2.FaceRecognizer();
var cvImages=[];
class FaceRecognizer {
  constructor(){
    cvImages=[];
    this.checkServerFolder();
    if(fs.existsSync("./server/images/trainingData/trained.xml"))
    {
      this.loadTrainingData();
    }
    else
    {
      this.beginTraining();
    }
    var input =  "./server/images/inputImage/";
    var output =  "./server/images/trainingImage/";
    this.grayScale(input,output);
  }
  checkServerFolder(){
    if(!fs.existsSync("./server/images"))
    {
      fs.mkdirSync("./server/images");
    }
    if(!fs.existsSync("./server/images/detectImage"))
    {
      fs.mkdirSync("./server/images/detectImage");
    }
    if(!fs.existsSync("./server/images/trainingImage"))
    {
      fs.mkdirSync("./server/images/trainingImage");
    }
    if(!fs.existsSync("./server/images/trainingData"))
    {
      fs.mkdirSync("./server/images/trainingData");
    }
    if(!fs.existsSync("./server/images/inputImage"))
    {
      fs.mkdirSync("./server/images/inputImage");
    }
    
  }
  grayScale(input,output){
    if(!fs.existsSync(input)){
      fs.mkdirSync(input);
    }
    
    if(!fs.existsSync(output)){
      fs.mkdirSync(output);
    }
    var id = fs.readdirSync(input);
    for (let f in id) {
      fs.readdirSync(input + id[f]).forEach(function (fileName, index) {
        var fileIn = input+ id[f] +"/" + fileName;
        var folderOut =output+ id[f];
        
        if(!fs.existsSync(fileIn)){
          throw new Error("Image doesnt exists");
        }
        if(!fs.existsSync(folderOut)){
          fs.mkdirSync(folderOut);
        }
        var fileOut = folderOut+"/"+fileName;
        cv2.readImage(fileIn, function (err, im) {
          if (err) throw err;
          if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');
          im.convertGrayscale();
          im.save(fileOut);
        });
      });
    }
  }
  faceIndentify(image64, imagename, callback) {
    var pathDetect = "./server/images/detectImage/"
    
    var ext = image64.split(';')[0].match(/jpeg|png|gif/)[0];
    var data = image64.replace(/^data:image\/\w+;base64,/, "");

    var detect =pathDetect+"detectthis."+ext;
    var buf = new Buffer(data, 'base64');
    fs.writeFile(detect,buf,function(err,data){
      console.log("Write complete");
      cv2.readImage(detect, function (err, im) {
        if (err) throw err;
        im.convertGrayscale();
        let result = FaceRecog.predictSync(im);
        callback(result);
      });
    });
  }

  beginTraining() {
    cvImages=[];
    this.getcvImages();
    if(cvImages.length>0){
      FaceRecog.trainSync(cvImages);
    }
    return 2;
  }

  saveTrainingData() {
    FaceRecog.saveSync('./server/images/trainingData/trained.xml');
    return 3;
  }

  getcvImages() {
    console.log("Reading trainingImage..");
    var targetfolderPath = "./server/images/trainingImage/";
    var id = fs.readdirSync(targetfolderPath);
    for (let f in id) {
      fs.readdirSync(targetfolderPath + id[f]).forEach(function (fpath, index) {
        var filePath = path.join(targetfolderPath + id[f] + "/", fpath);
        cv2.readImage(filePath, function (err, im) {
          if (err) throw err;
          if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');
          var label = parseInt(id[f]);
          var nArr = new Array(label,im);
          cvImages.push(nArr);
        });
      });
    }
    return 1;
  }

  trainOne(label, imgPath) {
    cv2.readImage(imgPath, function (err, im) {
      if (err) throw err;
      if (im.width() < 1 || im.height() < 1) throw new Error("Image has no size");
      var img = [];
      img.push(new Array(label, im));
      FaceRecog.trainSync(img);
      this.saveTrainingData();
    });
  }

  saveImage(image64, imagename, id) {
    var ext = image64.split(';')[0].match(/jpeg|png|gif/)[0];
    var data = image64.replace(/^data:image\/\w+;base64,/, "");
    var dis=this;
    var buf = new Buffer(data, 'base64');
    var filePath = "./server/images/inputImage/" + id;
    var destPath = "./server/images/trainingImage/" + id;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath);
    }
    destPath += "/" + imagename + "." + ext;
    filePath += "/" + imagename + "." + ext;
    fs.writeFile(filePath,buf,function(err,data){
      console.log("Write complete");
      cv2.readImage(filePath,function(err,im){
        if(err) throw err;
        if(im.width() < 1 || im.height() < 1) throw new Error("Image has no size");
        var img =[];
        im.convertGrayscale();
        im.save(destPath);
        var Arr = new Array(id,im);
        cvImages.push(Arr);
        dis.beginTraining();
      });
    });
    return 1;
  }
  loadTrainingData() {
    FaceRecog.loadSync("./server/images/trainingData/trained.xml");
  }

  deleteUser(id){
    var filePath = "./server/images/trainingImage"+"/"+parseInt(id);
    this.deleteFolder(filePath);
    filePath = "./server/images/inputImage"+"/"+parseInt(id);
    this.deleteFolder(filePath);
  }
  deleteFolder(Path){
    if(fs.existsSync(Path)){
      fs.readdirSync(Path).forEach(function(file,index){
        var currPath = Path +"/"+file;
        if(fs.lstatSync(currPath).isDirectory()){
          this.deleteFolder(currPath);
        }
        else{
          fs.unlinkSync(currPath);
        }
      });
      fs.rmdirSync(Path);
    }
  }
}

export {
  FaceRecognizer
};
