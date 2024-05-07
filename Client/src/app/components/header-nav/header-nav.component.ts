import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './header-nav.component.html',
  styleUrl: './header-nav.component.scss',
})
export class HeaderNavComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  faUser = faUser;
  loggedIn: boolean = false;
}
