import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private url = 'http://localhost:5069/api/';

  constructor(private http: HttpClient) {}

  getCategoriesData(): Observable<Category[]> | undefined {
    return this.http.get<Category[]>(`${this.url}Categories`);
  }
}
