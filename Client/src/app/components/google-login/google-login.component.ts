import {
  GoogleSigninButtonModule,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../../services/auth.service';
import { GoogleCredentials } from '../../models/googleCredentials';
import { Router } from '@angular/router';
import { CurrentUser } from '../../models/currentUser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [FontAwesomeModule, GoogleSigninButtonModule],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.scss',
})
export class GoogleLoginComponent implements OnInit {
  public faGoogle = faGoogle;
  destroyRef = inject(DestroyRef);
  isUserAuthenticated: boolean = false;
  user: CurrentUser = {};

  constructor(
    private _socialAuthService: SocialAuthService,
    private _authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.googleLogin();
  }

  googleLogin() {
    this._socialAuthService.authState
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Response from Google: ', res);
          const googleCreds: GoogleCredentials = {
            idToken: res.idToken,
            provider: res.provider,
          };
          this.user = {
            name: res.name,
            email: res.email,
          };
          this.handleCredentialResponse(googleCreds);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  handleCredentialResponse(credentials: GoogleCredentials) {
    this._authService
      .googleLoginApi(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Response from backend: ', res);
          if (res.isAuthSuccessful === true) {
            this.isUserAuthenticated = true;

            this._authService.setAccessToken(res.accessToken);

            if (res.displayName !== null) {
              this.user = {
                ...this.user,
                displayName: res.displayName,
              };
              this._authService.setCurrentUser(this.user);
              this.router.navigate(['/snippets']);
            } else {
              this.router.navigate(['/profile/account'], {
                queryParams: { dname: '0' },
              });
            }
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
