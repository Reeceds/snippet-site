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

  getSnippet(id: number): Observable<Snippet> {
    return this.http.get<Snippet>(`${this.url}snippets/${id}`);
  }

  createSnippet(snippet: Snippet): Observable<Snippet> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const snippetData = JSON.stringify(snippet);

    return this.http.post<Snippet>(
      `${this.url}snippets/create`,
      snippetData,
      httpOptions
    );
  }

  createSnippetFilters(snippetFilters: Snippet): Observable<Snippet> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const snippetData = JSON.stringify(snippetFilters);

    return this.http.post<Snippet>(
      `${this.url}snippets/create-filters`,
      snippetData,
      httpOptions
    );
  }

  editSnippet(snippet: Snippet): Observable<Snippet> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const snippetData = JSON.stringify(snippet);

    return this.http.post<Snippet>(
      `${this.url}snippets/edit`,
      snippetData,
      httpOptions
    );
  }

  deleteSnippet(id: number) {
    return this.http.delete(`${this.url}snippets/delete/${id}`);
  }
}
