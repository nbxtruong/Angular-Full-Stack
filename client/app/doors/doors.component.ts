import { Component, OnInit, Pipe } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';

import { DoorService } from '../services/door.service';
import { ToastComponent } from '../shared/toast/toast.component';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-doors',
  templateUrl: './doors.component.html',
  styleUrls: ['./doors.component.scss']
})

export class DoorsComponent implements OnInit {

  formDoor;
  doors = [];
  isLoading = true;
  isEditing = false;
  doorToDelete;
  addDoorForm: FormGroup;

  lab = new FormControl('', [
    Validators.required,
  ]);
  block = new FormControl('', [
    Validators.required,
  ]);
  floor = new FormControl('', [
    Validators.required,
    Validators.pattern('[a-zA-Z0-9_-\\s]*')
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

  constructor(private doorService: DoorService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent,
    private router: Router,
    private http: Http,
    private requestOptions: RequestOptions) { }

  ngOnInit() {
    this.getDoors();
    this.addDoorForm = this.formBuilder.group({
      lab: this.lab,
      block: this.block,
      floor: this.floor,
      door: this.door,
      status: this.status,
      mac: this.mac
    });
  }

  getDoors() {
    this.doorService.getDoors().subscribe(
      data => {
        this.doors = data.reverse();
        console.log(this.doors);
      },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addDoor() {
    this.router.navigate(['/addDoor']);
  }

  enableEditing(door) {
    this.isEditing = true;
    this.formDoor = door;
  }

  cancelEditing() {
    this.isEditing = false;
    this.toast.setMessage('item editing cancelled.', 'warning');
    this.getDoors();
  }

  editDoor(door) {
    this.doorService.editDoor(door).subscribe(
      res => {
        this.isEditing = false;
        this.toast.setMessage('item edited successfully.', 'success');
      },
      error => {
        this.toast.setMessage('door already exists.', 'danger');
      }
    );
  }

  setDeleteDoor(_door) {
    this.doorToDelete = _door;
  }

  deleteDoor(_door) {
    _door.isDeleted = true;
    _door.door = _door.door + _door._id;
    _door.mac = _door.mac + _door._id;
    this.doorService.deleteDoor(_door).subscribe(
      res => {
        console.log(res);
        this.toast.setMessage('item deleted successfully.', 'success');
      },
      error => { this.toast.setMessage('door already exists.', 'danger'); }

    );
    console.log(_door);
  }

  isStatusDoor(_door) {
    if (_door.status === "Offline") {
      return true;
    }
    else
      return false;
  }

  searchDoors() {
    const value = $('#myInput').val().toString().toLowerCase();
    $('#myTable tr').filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  }

}
