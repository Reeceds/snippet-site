import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-profile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './profile-nav.component.html',
  styleUrl: './profile-nav.component.scss',
})
export class ProfileNavComponent {}
