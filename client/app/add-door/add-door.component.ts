import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Http, Request } from '@angular/http';

import { DoorService } from '../services/door.service';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-register',
  templateUrl: './add-door.component.html',
  styleUrls: ['./add-door.component.scss']
})
export class AddDoorComponent implements OnInit {

  addDoorForm: FormGroup;

  lab = new FormControl('', [
    Validators.required,
  ]);
  block = new FormControl('', [
    Validators.required,
  ]);
  floor = new FormControl('', [
    Validators.required,
  ]);
  door = new FormControl('', [
    Validators.required,
    Validators.minLength(7),
    Validators.maxLength(250),
    Validators.pattern('[a-zA-Z0-9_-\\s]*')
  ]);
  status = new FormControl('', []);
  mac = new FormControl('', [
    Validators.required,
    Validators.minLength(17),
    Validators.maxLength(17),
    Validators.pattern('([0-9A-F]{2}[:-]){5}([0-9A-F]{2})')
  ]);
  statusDoor = "Offline";

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public toast: ToastComponent,
    private doorService: DoorService,
    public http: Http) { }

  ngOnInit() {
    this.addDoorForm = this.formBuilder.group({
      lab: this.lab,
      block: this.block,
      floor: this.floor,
      door: this.door,
      status: this.status,
      mac: this.mac
    });
  }

  setClassFloor() {
    return {
      'has-danger': !this.floor.pristine && !this.floor.valid
    };
  }

  setClassDoor() {
    return {
      'has-danger': !this.door.pristine && !this.door.valid
    };
  }

  setClassMac() {
    return {
      'has-danger': !this.mac.pristine && !this.mac.valid
    };
  }

  goBack() {
    this.router.navigate(['/doors']);
  }

  addDoor() {
    this.doorService.addDoor(this.addDoorForm.value).subscribe(
      res => {
        this.toast.setMessage('you successfully added!', 'success');
        this.router.navigate(['/doors']);
      },
      error => {
        this.toast.setMessage('Door already exists', 'danger');
      }
    );
  }
}
