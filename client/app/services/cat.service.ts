import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class CatService {

  private headers = new Headers({ 'Content-Type': 'application/json', 'charset': 'UTF-8' });
  private options = new RequestOptions({ headers: this.headers });

  private azureHeaders = new Headers({ 'Content-Type': 'application/octet-stream', 'Ocp-Apim-Subscription-Key': '4507f37ae85244359805ad1566e05a3f' });
  private azureOptions = new RequestOptions({ headers: this.azureHeaders });

  private azureHeaders2 = new Headers({ 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': '4507f37ae85244359805ad1566e05a3f' });
  private azureOptions2 = new RequestOptions({ headers: this.azureHeaders2 });

  constructor(private http: Http) { }

  getCats(): Observable<any> {
    return this.http.get('/api/cats').map(res => res.json());
  }

  countCats(): Observable<any> {
    return this.http.get('/api/cats/count').map(res => res.json());
  }

  addCat(cat): Observable<any> {
    return this.http.post('/api/cat', JSON.stringify(cat), this.options);
  }

  getCat(cat): Observable<any> {
    return this.http.get(`/api/cat/${cat._id}`).map(res => res.json());
  }

  editCat(cat): Observable<any> {
    return this.http.put(`/api/cat/${cat._id}`, JSON.stringify(cat), this.options);
  }

  deleteCat(cat): Observable<any> {
    return this.http.delete(`/api/cat/${cat._id}`, this.options);
  }

  uploadCatPhotos(photos, userID): Observable<any> {
    return this.http.post(`/api/face/image/save/` + userID, photos, this.options);
  }

  trainCatPhotos(): Observable<any> {
    return this.http.post(`/api/face/train/start`, this.options);
  }

  saveTrainedCatPhotos(fileName): Observable<any> {
    return this.http.post(`/api/face/train/save`, fileName, this.options);
  }

  identifyCatPhotos(photos): Observable<any> {
    return this.http.post(`/api/face/identify/`, photos, this.options);
  }

  deleteCatPhotos(userID): Observable<any> {
    return this.http.post(`/api/face/image/delete/` + userID, this.options);
  }

  detectFacePhoto(photoFormData): Observable<any> {
    return this.http.post(`https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect`, photoFormData.get('file'), this.azureOptions);
  }

  createPersonGroup(groupID, messageBody): Observable<any> {
    return this.http.put('https://westcentralus.api.cognitive.microsoft.com/face/v1.0/persongroups/' + groupID, messageBody, this.azureOptions2);
  }

}