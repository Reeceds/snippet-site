import {
  GoogleSigninButtonModule,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { Component, OnInit, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../../services/auth.service';
import { GoogleCredentials } from '../../models/googleCredentials';
import { Router } from '@angular/router';
import { CurrentUser } from '../../models/currentUser';

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [FontAwesomeModule, GoogleSigninButtonModule],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.scss',
})
export class GoogleLoginComponent implements OnInit {
  public faGoogle = faGoogle;
  isUserAuthenticated: boolean = false;
  user: CurrentUser = {};

  constructor(
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.googleLogin();
  }

  googleLogin() {
    this.socialAuthService.authState.subscribe({
      next: (res) => {
        console.log(res);
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
    this.authService.googleLoginApi(credentials).subscribe({
      next: (res) => {
        console.log('test', res);
        if (res.isAuthSuccessful === true) {
          this.isUserAuthenticated = true;

          if (res.displayName !== null) {
            this.user = {
              ...this.user,
              displayName: res.displayName,
            };
            this.authService.setCurrentUser(this.user);
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
