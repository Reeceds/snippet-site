import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  faUser = faUser;
  loggedIn: boolean = false;
  pageWidth: number = 0;
  tablesSizePx: number = 992;
  tabletSize: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.TabletSizeOnPageLoad();
  }

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigate(['/']);
    window.location.reload();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.pageWidth = (event.target as Window).innerWidth;

    if (this.pageWidth < this.tablesSizePx) {
      this.tabletSize = true;
    } else {
      this.tabletSize = false;
    }
  }

  TabletSizeOnPageLoad() {
    this.pageWidth = window.innerWidth;
    this.pageWidth < this.tablesSizePx ? (this.tabletSize = true) : null;
  }
}
