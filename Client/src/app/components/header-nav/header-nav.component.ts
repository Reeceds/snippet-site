import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, RouterLinkActive],
  templateUrl: './header-nav.component.html',
  styleUrl: './header-nav.component.scss',
})
export class HeaderNavComponent implements OnInit {
  faUser = faUser;
  loggedIn: boolean = false;
  pageWidth: number = 0;
  tablesSizePx: number = 992;
  tabletSize: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private _ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.TabletSizeOnPageLoad();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this._ngZone.run(() => {
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
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
