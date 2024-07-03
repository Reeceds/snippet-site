import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CurrentUser } from '../../../models/currentUser';

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [],
  templateUrl: './docs-page.component.html',
  styleUrl: './docs-page.component.scss',
})
export class DocsPageComponent implements OnInit {
  currentUser$: CurrentUser = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (res) => {
        this.currentUser$ = res;
        console.log('reece', this.currentUser$);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
