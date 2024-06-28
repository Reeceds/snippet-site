import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GoogleCredentials } from '../models/googleCredentials';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:5069/api/authentication/';

  constructor(private http: HttpClient) {}

  googleLoginApi(credentials: GoogleCredentials): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const googleCredentials = JSON.stringify(credentials);

    return this.http.post<GoogleCredentials>(
      `${this.url}google-login`,
      googleCredentials,
      httpOptions
    );
  }
}
