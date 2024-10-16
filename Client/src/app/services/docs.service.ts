import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Folder } from '../models/folder';
import { Doc } from '../models/doc';

@Injectable({
  providedIn: 'root',
})
export class DocsService {
  private url = 'http://localhost:5069/api/';

  constructor(private http: HttpClient) {}

  getDocumentsList(id: number): Observable<Doc[]> {
    return this.http.get<Doc[]>(`${this.url}docs/list/${id}`);
  }

  getDocument(id: number): Observable<Doc> {
    return this.http.get<Doc>(`${this.url}docs/${id}`);
  }

  createDocument(document: Doc): Observable<Doc> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const documentData = JSON.stringify(document);

    return this.http.post<Doc>(
      `${this.url}docs/create`,
      documentData,
      httpOptions
    );
  }

  editDocument(document: Doc): Observable<Doc> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        responseType: 'text/plain',
      }),
    };

    const documentData = JSON.stringify(document);

    return this.http.post<Doc>(
      `${this.url}docs/edit`,
      documentData,
      httpOptions
    );
  }

  deleteDocument(id: number) {
    return this.http.delete(`${this.url}docs/delete/${id}`);
  }
}
