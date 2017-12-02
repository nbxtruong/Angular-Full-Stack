import { Component, OnInit } from '@angular/core';

import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { CatService } from '../services/cat.service';
import { DoorService } from '../services/door.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  users = [];
  isLoading = true;
  randomCharForSoftDelete = Math.floor(1000 + Math.random() * 9000);
  toolTipTitle = 'You don\'t have permission';

  constructor(public auth: AuthService,
    public toast: ToastComponent,
    private userService: UserService,
    private catService: CatService,
    private doorService: DoorService) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      data => { this.users = data; console.log(data) },
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  deleteUser(user) {
    user.email = user.email.concat(this.randomCharForSoftDelete);
    user.username = user.username.concat(this.randomCharForSoftDelete);
    user.isDeleted = true;
    console.log(user);
    this.userService.softDeleteUser(user, this.auth.currentUser).subscribe(
      data => this.toast.setMessage('user deleted successfully.', 'success'),
      error => console.log(error),
      () => this.getUsers()
    );
  }

  createGroup(groupID, groupName, groupDescription) {
    var messageBody = {
      "name": groupName,
      "userData": groupDescription
    }

    this.catService.createPersonGroup(groupID, messageBody).subscribe(
      res => {
        console.log(res);
      },
      error => {
        console.log(error);
      }
    );
  }

}
