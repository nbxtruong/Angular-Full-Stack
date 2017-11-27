import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DoorService {
  private headers = new Headers({ 'Content-Type': 'application/json', 'charset': 'UTF-8' });
  private options = new RequestOptions({ headers: this.headers });
  constructor(private http: Http) { }

  getDoors(): Observable<any> {
    return this.http.get('/api/doors').map(res => res.json());
  }

  countDoors(): Observable<any> {
    return this.http.get('/api/doors/count').map(res => res.json());
  }

  addDoor(door): Observable<any> {
    return this.http.post('/api/door', JSON.stringify(door), this.options);
  }
  

  getDoor(door): Observable<any> {
    return this.http.get(`/api/door/${door._id}`).map(res => res.json());
  }

  editDoor(door): Observable<any> {
    return this.http.put(`/api/door/${door._id}`, JSON.stringify(door), this.options);
  }
  deleteDoor(door): Observable<any> {
    return this.http.put(`/api/deleteDoor/${door._id}`, JSON.stringify(door),this.options);
  }

}
