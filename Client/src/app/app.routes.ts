import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/pages/landing-page/landing-page.component';
import { SnippetsListPageComponent } from './components/pages/snippets-page/snippets-list-page/snippets-list-page.component';
import { ProfilePageComponent } from './components/pages/profile-page/profile-page.component';
import { DocsPageComponent } from './components/pages/docs-page/docs-page.component';
import { ProfileAccountComponent } from './components/pages/profile-page/profile-account/profile-account.component';
import { ProfileCategoriesComponent } from './components/pages/profile-page/profile-categories/profile-categories.component';
import { SnippetsCreatePageComponent } from './components/pages/snippets-page/snippets-create-page/snippets-create-page.component';
import { SnippetsEditPageComponent } from './components/pages/snippets-page/snippets-edit-page/snippets-edit-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    pathMatch: 'full',
    title: 'Home Page',
  },
  {
    path: 'snippets',
    component: SnippetsListPageComponent,
    title: 'Snippets Page',
  },
  {
    path: 'snippets/create',
    component: SnippetsCreatePageComponent,
    title: 'Snippets Create Page',
  },
  {
    path: 'snippets/edit/:id',
    component: SnippetsEditPageComponent,
    title: 'Snippets Edit Page',
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
