import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { CatService } from '../services/cat.service';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-register',
  templateUrl: './add-people.component.html'
})
export class AddPeopleComponent implements OnInit {

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

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    public toast: ToastComponent,
    private catService: CatService) { }

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

  register() {
    this.catService.addCat(this.addPeopleForm.value).subscribe(
      res => {
        this.toast.setMessage('you successfully added!', 'success');
        this.router.navigate(['/cats']);
      },
      error => this.toast.setMessage('Username already exists', 'danger')
    );
  }

  goBack() {
    this.router.navigate(['/cats']);
  }
}
