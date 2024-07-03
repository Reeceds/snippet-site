import { Component, OnInit } from '@angular/core';
import { ProfileNavComponent } from './profile-nav/profile-nav.component';
import { ProfileAccountComponent } from './profile-account/profile-account.component';
import { ProfileCategoriesComponent } from './profile-categories/profile-categories.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    RouterOutlet,
    ProfileNavComponent,
    ProfileAccountComponent,
    ProfileCategoriesComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
