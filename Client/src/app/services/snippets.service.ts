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

  constructor(private http: HttpClient) {}

  getSnippetsList(): Observable<Snippet[]> | undefined {
    return this.http.get<Snippet[]>(`${this.url}snippets`);
  }
}
