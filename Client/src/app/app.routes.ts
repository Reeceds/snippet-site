import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/pages/landing-page/landing-page.component';
import { SnippetsPageComponent } from './components/pages/snippets-page/snippets-page.component';
import { ProfilePageComponent } from './components/pages/profile-page/profile-page.component';
import { DocsPageComponent } from './components/pages/docs-page/docs-page.component';
import { ProfileAccountComponent } from './components/pages/profile-page/profile-account/profile-account.component';
import { ProfileCategoriesComponent } from './components/pages/profile-page/profile-categories/profile-categories.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    pathMatch: 'full',
    title: 'Home Page',
  },
  {
    path: 'snippets',
    component: SnippetsPageComponent,
    title: 'Snippets Page',
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    title: 'Account Page',
    children: [
      {
        path: 'account',
        component: ProfileAccountComponent,
        title: 'Account Page',
      },
      {
        path: 'categories',
        component: ProfileCategoriesComponent,
        title: 'Category Filters Page',
      },
    ],
  },
  { path: 'docs', component: DocsPageComponent, title: 'Documents Page' },
  { path: '**', redirectTo: '/snippets', pathMatch: 'full' },
];
