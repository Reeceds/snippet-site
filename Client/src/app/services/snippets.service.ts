import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Snippet } from '../models/snippet';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SnippetsService {
  private url = 'http://localhost:5069/api/';

  constructor(private http: HttpClient, private router: Router) {}

  // getSnippetsList(): Observable<Snippet[]> | undefined {
  //   var token = localStorage.getItem('jwt');

  //   if (!token) this.router.navigate(['/']);

  //   var options = new HttpHeaders().set(
  //     'Authorization',
  //     `Bearer ${localStorage.getItem('jwt')}`
  //   );

  //   return this.http.get<Snippet[]>(`${this.url}snippets`, {
  //     headers: options,
  //   });
  // }

  getSnippetsList(): Observable<Snippet[]> | undefined {
    var token = localStorage.getItem('jwt');

    if (!token) this.router.navigate(['/']);

    return this.http.get<Snippet[]>(`${this.url}snippets`);
  }
}
