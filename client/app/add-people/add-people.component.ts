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

  public webcam;//will be populated by ack-webcam [(ref)]
  public base64 = [];

  addPeopleForm: FormGroup;
  username = new FormControl('', [
    Validators.required,
    Validators.minLength(7),
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

  // Options for webcam
  options = {
    audio: false,
    video: true,
    // width: 500,
    // height: 500,
    fallbackMode: 'callback',
    fallbackSrc: 'jscam_canvas_only.swf',
    fallbackQuality: 100,
    cameraType: 'front'
  }

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public toast: ToastComponent,
    private catService: CatService,
    public http: Http) { }

  ngOnInit() {
    this.addPeopleForm = this.formBuilder.group({
      username: this.username,
      name: this.name,
      room: this.room,
      role: this.role
    });
  }

  setClassUsername() {
    return { 'has-danger': !this.username.pristine && !this.username.valid };
  }
  setClassName() {
    return { 'has-danger': !this.name.pristine && !this.name.valid };
  }
  setClassRoom() {
    return { 'has-danger': !this.room.pristine && !this.room.valid };
  }

  addPeople() {
    this.catService.addCat(this.addPeopleForm.value).subscribe(
      res => {
        this.toast.setMessage('you successfully added!', 'success');
        this.router.navigate(['/cats']);
      },
      error => {
        this.toast.setMessage('Username already exists', 'danger');
      }
    );
    this.postFormData();
  }

  goBack() {
    this.router.navigate(['/cats']);
    this.base64.length = 0;
  }

  // Start photo prosessing
  // Base64 Generation
  genBase64() {
    this.webcam.getBase64()
      .then(base => this.base64.push(base))
      .catch(e => console.error(e))
  }

  //A pretend process that would post the webcam photo taken
  postFormData() {
    for (var index = 0; index < this.base64.length; index++) {
      this.catService.uploadCatPhotos(this.base64[index]).subscribe(
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

  onCamError(err) { }

  onCamSuccess() { }

  closeCamAction() {
  }
  // End photo processing

}
