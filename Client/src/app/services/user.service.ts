import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentUser } from '../models/currentUser';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url = 'http://localhost:5069/api/';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.url}user/current-user`);
  }

  updateDisplayName(displayName: CurrentUser): Observable<CurrentUser> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };
    const displayNameData = JSON.stringify(displayName);

    return this.http.post<CurrentUser>(
      `${this.url}user/edit-uesername`,
      displayNameData,
      httpOptions
    );
  }
}
