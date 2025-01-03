import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { GoogleCredentials } from '../models/googleCredentials';
import { CurrentUser } from '../models/currentUser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:5069/api/authentication/';
  private accessToken: string | null = null;
  currentUserSource = new BehaviorSubject({}); // Store access token in memory
  currentUser$ = this.currentUserSource.asObservable();

  constructor(
    private http: HttpClient,
    private _ngZone: NgZone,
    private router: Router
  ) {}

  googleLoginApi(credentials: GoogleCredentials): Observable<any> {
    const httpOptions = {
      withCredentials: true, // jwt cookie which was set on the backend will be passed on all requests using withCredentials
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

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  clearAccessToken(): void {
    this.accessToken = null;
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(
      `${this.url}refresh-token`,
      {},
      { withCredentials: true }
    );
  }

  setCurrentUser(userDetails: CurrentUser) {
    this.currentUserSource.next(userDetails);
  }

  // ! Revisit this to remove the double page reload
  logout() {
    this.clearAccessToken();

    this._ngZone.run(() => {
      this.router.navigate(['/']).then(() => {
        window.location.reload();
      });
    });

    return this.http.get(`${this.url}logout`, { withCredentials: true });
  }
}
