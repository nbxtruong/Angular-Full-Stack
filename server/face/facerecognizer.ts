import * as path from 'path';
import * as cv from 'opencv';
import * as cv2 from 'opencv2';
const fs = require('fs');
const FaceRecog = new cv2.FaceRecognizer();
var cvImages=[];
const trainingData= "./server/images/trainingData";
const trainingImage= "./server/images/trainingImage";
const trainingInput ="./server/images/inputImage";
const detectImage = "./server/images/detectImage";
const trainingTestOutput="./server/images/testOutput";
class FaceRecognizer {
  private processImageITV=null;
  private updateTrainingDataITV=null;
  private watchManualInputITV = null;
  private matArr=[];
  private retrainData=0;
  private training=0;
  private receivingImg=0;
  private reimportInput=1;
  public finding=0;
  private detectingObject=0;
  //private faceHeight=320;
  //private faceWidth=320;
  constructor(){
    cvImages=[];
    this.finding=0;
    this.checkServerFolder();
    if(fs.existsSync(trainingData+"/trained.xml"))
    {
      this.loadTrainingData();
    }
    else
    {
      
      this.beginTraining();
        
    }
    if(this.processImageITV===null)
    {
      this.processInputITV();
    }
    if(this.updateTrainingDataITV===null)
    {
      this.trainInputITV();
    }
    
    if(this.watchManualInputITV===null){
      this.watchInputITV();
    }
    //var input =  "./server/images/inputImage/";
    //var output =  "./server/images/trainingImage/";
    //this.grayScale(input,output);
  }
  watchInputITV(){
    var ptr = this;
    ptr.watchManualInputITV=setInterval(function(){
      if(ptr.training!=1 && ptr.receivingImg!=1 && ptr.reimportInput==1)
      {
        console.log("reading raw input");
        ptr.getInputImages();
      }
    },5000);
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
    var ext = image64.split(';')[0].match(/jpeg|png|gif/)[0];
    var data = image64.replace(/^data:image\/\w+;base64,/, "");
    var ptr=this;
    var detect =detectImage+"/"+imagename+"."+ext;
    var counter=0;
    ptr.finding=1;
    while(fs.existsSync(detect))
    {
      detect=detectImage+"/"+imagename+counter+"."+ext;
      counter++;
    }
    
    var buf = new Buffer(data, 'base64');
    fs.writeFile(detect,buf,function(err,data){
      cv2.readImage(detect, function (err, im) {
        if (err){
          callback({id:-1,confidence:0});
        }
        im.convertGrayscale();
        ptr.crop(im,function(imArr){
          if(imArr.length)
          {
            ptr.checkForEyes(imArr[0],function(checkedIm,rs){
                if(rs===1)
                {
                  // if(checkedIm.width()<ptr.faceWidth || checkedIm.height() <ptr.faceHeight)
                  // {
                  //   checkedIm.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_CUBIC);
                  
                  // }
                  // else
                  // {
                  //   checkedIm.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_AREA);
                  // }
                  let result = FaceRecog.predictSync(checkedIm);
                  checkedIm.save(detect);
                  ptr.finding=0;
                  callback(result);
                }
                else{ 
                  ptr.checkForNose(checkedIm,function(checkedNose,rs2){
                  if(rs2==1)
                  {
                    ptr.checkForMouth(checkedNose,function(checkedMouth,rs3){
                      if(rs3==1)
                      {
                        // if(checkedMouth.width()<ptr.faceWidth || checkedMouth.height() <ptr.faceHeight)
                        // {
                        //   checkedMouth.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_CUBIC);
                        // }
                        // else
                        // {
                        //   checkedMouth.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_AREA);
                        // }
                        let result = FaceRecog.predictSync(checkedIm);
                        checkedIm.save(detect);
                        ptr.finding=0;
                        ptr.detectingObject=0;
                        callback(result);
                      }
                      else
                      {
                        ptr.finding=0;
                        ptr.detectingObject=0;
                        callback({id:-1,confidence:0});
                      }
                    });
                  }
                  else
                  {
                    ptr.finding=0;
                    ptr.detectingObject=0;
                    callback({id:-1,confidence:0});
                  }
                });
                }
            });
          }
          else
          {
            let result ={id:-1,confidence:0};
            ptr.finding=0;
            callback(result);
          }
        });
      });
    });
  }

  beginTraining() {
    this.retrainData=1;
    this.matArr=[];
    cvImages=[];
    this.getcvImages();
    this.saveTrainingData();
    return 2;
  }

  saveTrainingData() {
    FaceRecog.saveSync(trainingData+'/trained.xml');
    return 3;
  }
  getInputImages(){
    var ptr=this;
    var fid = fs.readdirSync(trainingInput);
    for (let f in fid) {
      var files=fs.readdirSync(trainingInput+"/" + fid[f]);
      if(fs.existsSync(trainingImage+"/"+fid[f]))
      {
        continue;
      }
      else
      {
        files.forEach(function (fileName) {
          var filePath = path.join(trainingInput+"/" + fid[f] + "/", fileName);
          cv2.readImage(filePath, function (err, im) {
            if (err) throw err;
            if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');
            var label = parseInt(fid[f]);
            var nArr = {'im':im,'userImgFolder':trainingImage+"/"+fid[f],'fileName':fileName,'userID':fid[f]}
            if(!fs.existsSync(trainingImage+"/"+fid[f]))
            {
            fs.mkdirSync(trainingImage+"/"+fid[f]); 
            }
            ptr.matArr.push(nArr);
          });
        });
      }
    }
    return 1;
  }
  getcvImages() {
    var id = fs.readdirSync(trainingImage);
    for (let f in id) {
      fs.readdirSync(trainingImage+"/" + id[f]).forEach(function (fileName, index) {
        var filePath = path.join(trainingImage+"/" + id[f] + "/", fileName);
        cv2.readImage(filePath, function (err, im) {
          if (err) throw err;
          if (im.width() < 1 || im.height() < 1) throw new Error('Image has no size');
          var label = parseInt(id[f]);
          cvImages.push({'label':label,'img':im});
        });
      });
    }
    return 1;
  }
  saveImage(image64, imagename, id) {
    var ext = image64.split(';')[0].match(/jpeg|png|gif/)[0];
    var data = image64.replace(/^data:image\/\w+;base64,/, "");
    var ptr=this;
    ptr.receivingImg=1;
    var buf = new Buffer(data, 'base64');
    var filePath = trainingInput+"/" + id;
    var destPath = trainingImage+"/" + id;
    var testOutput = trainingInput+"/"+id;
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath);
    }
    
    if (!fs.existsSync(testOutput)) {
      fs.mkdirSync(testOutput);
    }
    filePath += "/" + imagename + "." + ext;
    fs.writeFile(filePath,buf,function(err,data){
      cv2.readImage(filePath,function(err,im){
        if(err) throw err;
        if(im.width() < 1 || im.height() < 1) throw new Error("Image has no size");
        var img =[];
        ptr.receivingImg=0;
        im.convertGrayscale();
        im.save(testOutput + "/" + imagename + "." + ext);
        ptr.matArr.push({'im':im,'userImgFolder':destPath,'fileName':imagename+"."+ext,'userID':id});
      });
    });
    return 1;
  }
  loadTrainingData() {
    FaceRecog.loadSync(trainingData+"/trained.xml");
  }

  deleteUser(id){
    var filePath = trainingImage+"/"+parseInt(id);
    this.deleteFolder(filePath);
    filePath = trainingInput+"/"+parseInt(id);
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

  trainInputITV(){
    var ptr=this;
    this.updateTrainingDataITV=setInterval(function(){
      if(cvImages.length!=0)
      {
        ptr.training=1;
        var cvImgs=[];
        console.log("training/updating data...");
        while(cvImages.length!=0)
        {
          cvImgs.push(new Array(parseInt(cvImages[0].label),cvImages[0].img));
          //console.log(parseInt(cvImages[0].label)+".."+cvImages[0].img);
          cvImages.shift();
        }
        if(ptr.retrainData===0)
        {
          FaceRecog.updateSync(cvImgs);
          ptr.saveTrainingData();
        }
        else
        {
          FaceRecog.trainSync(cvImgs);
          ptr.saveTrainingData();
          ptr.retrainData=0;
        }
        ptr.training=0;
      }
    },300);
  }
  processInputITV(){
    var ptr=this;
    ptr.processImageITV = setInterval(function(){
      if(ptr.matArr.length!=0 &&  ptr.detectingObject!=1)
      {
        console.log("Processing an image...");
        ptr.detectingObject=1;
        var mat = ptr.matArr[0].im;
        var userImgFolder = ptr.matArr[0].userImgFolder;
        var fileName = ptr.matArr[0].fileName;
        var userID = ptr.matArr[0].userID;
        ptr.matArr.shift();
        //Callback hell begins here


        ptr.crop(mat,function(imArr){
          if(imArr.length<1)
          {
            ptr.detectingObject=0;
          }
          else
          {
          for(var i=0;i<imArr.length;i++)
          {
            ptr.checkForEyes(imArr[i],function(checkedIm,rs1){
                if(rs1==1)
                {
                  var writePath =userImgFolder+"/"+i+fileName;
                  // if(checkedIm.width()<ptr.faceWidth || checkedIm.height() <ptr.faceHeight)
                  // {
                  //   checkedIm.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_CUBIC);
                  
                  // }
                  // else
                  // {
                  //   checkedIm.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_AREA);
                  // }
                  checkedIm.save(writePath);
                  cvImages.push({label:userID,img:checkedIm});
                  
                  
                  ptr.detectingObject=0;
                }
                else
                {
                  ptr.checkForNose(checkedIm,function(checkedNose,rs2){
                    if(rs2==1)
                    {
                      ptr.checkForMouth(checkedNose,function(checkedMouth,rs3){
                        if(rs3==1)
                        {
                          var writePath =userImgFolder+"/"+i+fileName;
                          // if(checkedMouth.width()<ptr.faceWidth || checkedMouth.height() <ptr.faceHeight)
                          // {
                          //   checkedMouth.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_CUBIC);
                          // }
                          // else
                          // {
                          //   checkedMouth.resize(ptr.faceWidth,ptr.faceHeight,0,0,cv2.INTER_AREA);
                          // }
                          checkedMouth.save(writePath);
                          cvImages.push({label:userID,img:checkedMouth});
                          ptr.detectingObject=0;
                        }
                        else
                        {
                          ptr.detectingObject=0;
                        }
                      });
                    }
                    else
                    {
                      ptr.detectingObject=0;
                    }
                  });
                }
            });
          }
        }
        });
      }
    },179);
  }
  crop(im,callback){
    var ptr=this;
    im.detectObject('./node_modules/opencv2/data/haarcascade_frontalface_alt2.xml',{},function(err,faces){
      if(err){
        ptr.detectingObject=0;
         throw err;
      }
      var results=[];
      for(var i=0;i<faces.length;i++)
      {
        var cropped=im.crop(faces[i].x,faces[i].y,faces[i].width,faces[i].height);
        results.push(cropped);
      }
      callback(results);
    });
  }
  checkForEyes(im,callback){
    var ptr=this;
    im.detectObject('./node_modules/opencv2/data/haarcascade_mcs_eyepair_big.xml',{},function(err,eye){
      if(err){      
        ptr.detectingObject=0;
      throw err;
      }
      
      if(eye.length<1)
      {
        callback(im,0);
      }
      else
      {
        callback(im,1);
      }
    });
  }
  checkForNose(im,callback){
    var ptr=this;
    im.detectObject('./node_modules/opencv2/data/haarcascade_mcs_nose.xml',{},function(err,nose){
      if(err){      
        ptr.detectingObject=0;
      throw err;
      }
      
      if(nose.length<1)
      {
        callback(im,0);
      }
      else
      {
        callback(im,1);
      }
    });
  }
  checkForMouth(im,callback){
    var ptr=this;
    im.detectObject('./node_modules/opencv2/data/haarcascade_mcs_mouth.xml',{},function(err,mouth){
      if(err){      
        ptr.detectingObject=0;
      throw err;
      }
      
      if(mouth.length<1)
      {
        callback(im,0);
      }
      else
      {
        callback(im,1);
      }
    });
  }
}
export {
  FaceRecognizer
};
