import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/pages/landing-page/landing-page.component';
import { SnippetsListPageComponent } from './components/pages/snippets-page/snippets-list-page/snippets-list-page.component';
import { ProfilePageComponent } from './components/pages/profile-page/profile-page.component';
import { DocsFoldersListPageComponent } from './components/pages/docs-page/docs-folders-list-page/docs-folders-list-page.component';
import { ProfileAccountComponent } from './components/pages/profile-page/profile-account/profile-account.component';
import { ProfileCategoriesComponent } from './components/pages/profile-page/profile-categories/profile-categories.component';
import { SnippetsCreatePageComponent } from './components/pages/snippets-page/snippets-create-page/snippets-create-page.component';
import { SnippetsEditPageComponent } from './components/pages/snippets-page/snippets-edit-page/snippets-edit-page.component';
import { DocsDocumentsListPageComponent } from './components/pages/docs-page/docs-documents-list-page/docs-documents-list-page.component';
import { DocsDocumentCreatePageComponent } from './components/pages/docs-page/docs-document-create-page/docs-document-create-page.component';
import { DocsDocumentViewPageComponent } from './components/pages/docs-page/docs-document-view-page/docs-document-view-page.component';
import { DocsDocumentEditPageComponent } from './components/pages/docs-page/docs-document-edit-page/docs-document-edit-page.component';

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
  {
    path: 'docs/folders',
    component: DocsFoldersListPageComponent,
    title: 'Documents Folders Page',
  },
  {
    path: 'docs/folders/:folderId/documents',
    component: DocsDocumentsListPageComponent,
    title: 'Documents Page',
  },
  {
    path: 'docs/folders/:folderId/document/create',
    component: DocsDocumentCreatePageComponent,
    title: 'Document Create Page',
  },
  {
    path: 'docs/folders/:folderId/document/edit/:docId',
    component: DocsDocumentEditPageComponent,
    title: 'Document Edit Page',
  },
  {
    path: 'docs/folders/:folderId/document/:docId',
    component: DocsDocumentViewPageComponent,
    title: 'Document View Page',
  },
  // {
  //   path: 'docs/folders/documents',
  //   redirectTo: '/docs/folders',
  //   pathMatch: 'full',
  // },
  { path: '**', redirectTo: '/snippets', pathMatch: 'full' },
];
