import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';

import { CatService } from '../services/cat.service';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.scss']
})

@Pipe({
  name: 'CatsComponent'
})

export class CatsComponent implements OnInit, PipeTransform {

  cat = {};
  myCat;
  cats = [];
  isLoading = true;
  isEditing = false;
  catToDelete;
  public webcam; // will be populated by ack-webcam [(ref)]
  PhotoTest;
  public base64;
  searchFilter = 'userid';
  identifiedUser;
  filterModel;
  addCatForm: FormGroup;

  searchCategory = [{
    id: 'userid',
    value: 'UserID'
  }, {
    id: 'username',
    value: 'Username'
  }, {
    id: 'name',
    value: 'Name'
  }, {
    id: 'room',
    value: 'Room'
  }, {
    id: 'photo',
    value: 'Photo'
  }];

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
  };

  constructor(private catService: CatService,
    private formBuilder: FormBuilder,
    public toast: ToastComponent,
    private router: Router,
    private http: Http,
    private requestOptions: RequestOptions) { }

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
    this.myCat = cat;
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

  setDeleteCat(cat) {
    this.catToDelete = cat;
  }

  deleteCat(cat) {
    this.catService.deleteCat(cat).subscribe(
      deleteCatResponse => {
        const pos = this.cats.map(elem => elem._id).indexOf(cat._id);
        this.cats.splice(pos, 1);
        this.catService.deleteCatPhotos(cat.userid).subscribe(
          deletePhotosResponse => {
            this.toast.setMessage('item deleted successfully.', 'success');
          }
        );
      },
      error => console.log(error)
    );
  }

  getFilter(f) {
    this.searchFilter = f;
  }

  searchPeopleByName() {
    console.log(this.searchFilter);
    // Declare variables
    let input, filter, table, tr, td, i;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    table = document.getElementById('myTable');
    tr = table.getElementsByTagName('tr');

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      const tdArray = tr[i].getElementsByTagName('td');
      // console.log(tdArray);
      for (let j = 0; j < tdArray.length; j++) {
        if (tdArray[j] && tdArray[j].getAttribute('value') === this.searchFilter) {
          // console.log(tdArray[j].getAttribute('value'));
          td = tdArray[j];
          break;
        }
      }

      // td = tr[i].getElementsByTagName("td")[0];
      // console.log(td);
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = '';
        } else {
          tr[i].style.display = 'none';
        }
      }
    }
  }

  // Start photo prosessing
  identify() {
    // Base64 Generation
    this.webcam.getBase64()
      .then(base => {
        this.identifyAndUpdate(base);
      })
      .catch(error => console.error(error));
  }

  indentifyByAzure() {
    this.webcam.captureAsFormData({ fileName: 'Image.png', mime: this.base64 })
      .then(formData => {
        console.log(formData.getAll('file'));
        this.catService.detectFacePhoto(formData).subscribe(
          response => {
            console.log(response);
          },
          error => {
            console.log(error);
          }
        );
      })
      .catch(e => console.error(e));
  }

  genBase64() {
    this.webcam.getBase64()
      .then(base => this.base64 = base)
      .catch(error => console.error(error));
  }

  identifyUser(base) {
    const messageBody = {
      image64: base,
      imagename: 'photo' + [0]
    };
    this.catService.identifyCatPhotos(messageBody).subscribe(
      response => {
        console.log(JSON.parse(response._body));
        return response._body;
      },
      error => {
        console.log(error);
      }
    );
  }

  identifyAndUpdate(base) {
    const messageBody = {
      image64: base,
      imagename: 'photo' + [0]
    };
    this.catService.identifyCatPhotos(messageBody).subscribe(
      res => {
        console.log(JSON.parse(res._body));
        const user = JSON.parse(res._body);
        if (user.id !== -1 && user.conf > 60) {
          let filter, input;
          filter = document.getElementById('filter');
          input = document.getElementById('myInput');
          filter.value = 'userid';
          input.value = user.id;
          this.searchPeopleByName();
        } else {
          let filter, input;
          filter = document.getElementById('filter');
          input = document.getElementById('myInput');
          filter.value = 'userid';
          input.value = '*';
          this.searchPeopleByName();
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  checkIfPhoto(t) {
    console.log(this.filterModel);
    if (t === 'photo') {
      console.log('photo filter');
    }
  }

  onCamError(err) { }

  onCamSuccess() { }
  // End photo processing

  // Implement for PipeTransform
  transform(value: any) {
    if (!value) {
      return '';
    }
  }
}
