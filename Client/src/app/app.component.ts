import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderNavComponent } from './components/header-nav/header-nav.component';
import { LandingPageComponent } from './components/pages/landing-page/landing-page.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderNavComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  showNavBar = true;

  constructor() {}

  ngOnInit(): void {}

  toggleNavBar(component: any) {
    if (component instanceof LandingPageComponent) {
      this.showNavBar = false;
    } else {
      this.showNavBar = true;
    }
  }
}
