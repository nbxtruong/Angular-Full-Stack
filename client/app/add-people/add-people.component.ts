import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Http, Request } from '@angular/http';

import { CatService } from '../services/cat.service';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-register',
  templateUrl: './add-people.component.html',
  styleUrls: ['./add-people.component.scss']
})
export class AddPeopleComponent implements OnInit {

  public webcam; // will be populated by ack-webcam [(ref)]
  public base64 = [];
  isLoading = false;
  photoLimit = 40;
  takePhoto = false;
  countPhoto = 0;
  randomUserID = Math.floor(1000 + Math.random() * 9000);
  addPeopleForm: FormGroup;
  options = { // Options for webcam
    audio: false,
    video: true,
    // width: 500,
    // height: 500,
    fallbackMode: 'callback',
    fallbackSrc: 'jscam_canvas_only.swf',
    fallbackQuality: 100,
    cameraType: 'front'
  };

  userid = new FormControl('', []);
  username = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(30),
    Validators.pattern('[a-zA-Z0-9_-\\s]*')
  ]);
  name = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(100),
    Validators.pattern('[a-zA-Z0-9_-\\s]*')
  ]);
  room = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  role = new FormControl('', [
    Validators.required
  ]);

  setClassUserid() {
    return {
      'has-danger': !this.userid.pristine && !this.userid.valid
    };
  }

  setClassUsername() {
    return {
      'has-danger': !this.username.pristine && !this.username.valid
    };
  }
  setClassName() {
    return {
      'has-danger': !this.name.pristine && !this.name.valid
    };
  }
  setClassRoom() {
    return {
      'has-danger': !this.room.pristine && !this.room.valid
    };
  }

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public toast: ToastComponent,
    private catService: CatService,
    public http: Http) { }

  ngOnInit() {
    this.addPeopleForm = this.formBuilder.group({
      userid: this.userid,
      username: this.username,
      name: this.name,
      room: this.room,
      role: this.role

    });
  }

  isValidForm() {
    if (!this.addPeopleForm.invalid && this.base64.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  addPeople() {
    this.isLoading = true;
    this.catService.addCat(this.addPeopleForm.value).subscribe(
      res => {
        this.toast.setMessage('you successfully added!', 'success');
        this.router.navigate(['/cats']);
        this.postPhotoData();
        // this.startTrainPhotos();
        // this.saveTrainPhotos();
      },
      error => {
        this.toast.setMessage('Username already exists', 'danger');
      }
    );
  }

  startTrainPhotos() {
    this.catService.trainCatPhotos().subscribe(
      res => {
        console.log(res);
        this.base64.length = 0;
      },
      error => {
        console.log(error);
        this.base64.length = 0;
      }
    );
  }

  saveTrainPhotos() {
    const messageBody = {
      fileName: 'trained.xml'
    };

    this.catService.saveTrainedCatPhotos(messageBody).subscribe(
      res => {
        console.log(res);
        this.base64.length = 0;
      },
      error => {
        console.log(error);
        this.base64.length = 0;
      }
    );
  }

  goBack() {
    this.router.navigate(['/cats']);
    this.base64.length = 0;
  }

  // Start photo prosessing
  // Base64 Generation
  genBase64() {
    console.log('Taking photos');
    console.log(this.countPhoto);
    this.webcam.getBase64()
      .then(base => {
        this.countPhoto++;
        this.base64.push(base);
        if (this.takePhoto && this.countPhoto < this.photoLimit) {
          setTimeout(() => {
            this.genBase64();
          }, 400);
        }
      })
      .catch(e => console.error(e));
    // this.paramet=;
  }

  autoTakePhoto() {
    this.takePhoto = true;
    this.genBase64();
  }

  stopTakingPhoto() {
    this.takePhoto = false;
  }

  closeCamera() {
    this.takePhoto = false;
    this.base64.length = 0;
  }

  // A pretend process that would post the webcam photo taken
  postFormData() {
    const catJson = this.addPeopleForm.value;
    for (let index = 0; index < this.base64.length; index++) {
      const messageBody = {
        image64: this.base64[index],
        imagename: 'photo' + [index]
      };

      this.catService.uploadCatPhotos(messageBody, catJson.userid).subscribe(
        res => {
          console.log(res);
          this.base64.length = 0;
        },
        error => {
          console.log(error);
          this.base64.length = 0;
        }
      );
    }
  }

  postPhotoData() {
    console.log(this.base64.length);
    if (this.base64.length === 0) {
      return;
    }
    const catJson = this.addPeopleForm.value;
    const messageBody = {
      image64: this.base64[0],
      imagename: 'photo' + [0]
    };
    this.catService.uploadCatPhotos(messageBody, catJson.userid).subscribe(
      res => {
        console.log(res);
        this.base64.shift();
        this.postPhotoData();
      },
      error => {
        console.log(error);
        this.base64.shift();
        this.postPhotoData();
      }
    );
  }

  resetPhotoArray() {
    this.base64.length = 0;
    this.countPhoto = 0;
  }

  onCamError(err) { }

  onCamSuccess() { }

  closeCamAction() { }
  // End photo processing

}
