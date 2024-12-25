import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { CurrentUser } from '../../../../models/currentUser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile-account.component.html',
  styleUrl: './profile-account.component.scss',
})
export class ProfileAccountComponent implements OnInit {
  currentUser: CurrentUser = {};
  currentDisplayName: string | undefined;
  formSubmitted: boolean = false;

  fb = inject(NonNullableFormBuilder);

  constructor(
    private _userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  profileForm = this.fb.group({
    displayName: new FormControl('', [Validators.required]),
  });

  getCurrentUser() {
    this._userService.getCurrentUser().subscribe({
      next: (res) => {
        this.currentUser = res;
        this.currentDisplayName = res.displayName;

        if (res.displayName !== null) {
          this.profileForm.patchValue({
            displayName: res.displayName,
          });
        }
      },
      error: (err) => {
        console.log('Failed to load user information: ', err);
        // this.router.navigate(['/']);
      },
    });
  }

  submitForm() {
    this.formSubmitted = true;

    const disName = this.profileForm.value.displayName;

    if (!disName || disName === this.currentDisplayName) return;

    this.currentUser = {
      displayName: disName,
    };

    this._userService.updateDisplayName(this.currentUser).subscribe({
      next: (res) => {
        this.route.queryParamMap.subscribe((param) => {
          if (param.get('dname') === '0') {
            this.router.navigate(['/snippets']);
          } else {
            window.location.reload();
          }
        });
      },
      error: (err) => {
        console.log('Display name could not be updated: ', err);
        window.location.reload();
      },
    });
  }
}
