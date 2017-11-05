import { Component, OnInit, Pipe } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { CatService } from '../services/cat.service';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.scss']
})

@Pipe({
  name: 'reverse',
  pure: false
})
export class CatsComponent implements OnInit {

  cat = {};
  cats = [];
  isLoading = true;
  isEditing = false;
  public webcam;//will be populated by ack-webcam [(ref)]
  public base64 = [];

  addCatForm: FormGroup;
  username = new FormControl('', Validators.required);
  name = new FormControl('', Validators.required);
  room = new FormControl('', Validators.required);
  role = new FormControl('', Validators.required);

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

  constructor(private catService: CatService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent,
    private router: Router) { }

  ngOnInit() {
    this.getCats();
    this.addCatForm = this.formBuilder.group({
      username: this.username,
      name: this.name,
      room: this.room,
      role: this.role
    });
  }

  getCats() {
    this.catService.getCats().subscribe(
      data => this.cats = data.reverse(),
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addCat() {
    this.router.navigate(['/addPeople']);
  }

  enableEditing(cat) {
    this.isEditing = true;
    this.cat = cat;
  }

  cancelEditing() {
    this.isEditing = false;
    this.cat = {};
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the cats to reset the editing
    this.getCats();
  }

  editCat(cat) {
    this.catService.editCat(cat).subscribe(
      res => {
        this.isEditing = false;
        this.cat = cat;
        this.toast.setMessage('item edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteCat(cat) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.catService.deleteCat(cat).subscribe(
        res => {
          const pos = this.cats.map(elem => elem._id).indexOf(cat._id);
          this.cats.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

  searchPeopleByName() {
    // Declare variables 
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
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
  // End photo processing

}
