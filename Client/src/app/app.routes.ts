import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/pages/landing-page/landing-page.component';
import { SnippetsPageComponent } from './components/pages/snippets-page/snippets-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'snippets', component: SnippetsPageComponent },
];
