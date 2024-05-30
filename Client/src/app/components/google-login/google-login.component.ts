import {
  GoogleSigninButtonModule,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { Component, OnInit, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../../services/auth.service';
import { GoogleCredentials } from '../../models/googleCredentials';

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [FontAwesomeModule, GoogleSigninButtonModule],
  templateUrl: './google-login.component.html',
  styleUrl: './google-login.component.scss',
})
export class GoogleLoginComponent implements OnInit {
  public faGoogle = faGoogle;

  constructor(
    private socialAuthService: SocialAuthService,
    private authService: AuthService
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
        if (res.token) {
          localStorage.setItem('reeceToken', res.token);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
