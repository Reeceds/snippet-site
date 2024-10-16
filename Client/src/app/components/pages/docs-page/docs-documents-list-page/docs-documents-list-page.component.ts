import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleArrowLeft,
  faEllipsis,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { ModalComponent } from '../../../modal/modal.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Doc } from '../../../../models/doc';
import { DocsService } from '../../../../services/docs.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FoldersService } from '../../../../services/folders.service';

@Component({
  selector: 'app-docs-documents-list-page',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ModalComponent, RouterLink],
  templateUrl: './docs-documents-list-page.component.html',
  styleUrl: './docs-documents-list-page.component.scss',
})
export class DocsDocumentsListPageComponent implements OnInit {
  faPlus = faPlus;
  faEllipsis = faEllipsis;
  faCricleArrowLeft = faCircleArrowLeft;
  destroyRef = inject(DestroyRef);

  docsList: Doc[] | undefined;
  folderId: number | undefined;
  folderName: string | undefined;
  docToDeleteId: number | undefined;

  docsListError: boolean = false;

  isDeleteModalOpen: boolean = false;

  constructor(
    private _docsService: DocsService,
    private _folderService: FoldersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.folderId = this.route.snapshot.params['folderId'];
    this.getDocsList();
    this.getFolder();
  }

  getDocsList() {
    return this._docsService
      .getDocumentsList(this.folderId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.docsList = res;
        },
        error: (err) => {
          console.log('Failed to get docs list: ', err);
          this.docsListError = true;
        },
      });
  }

  getFolder() {
    return this._folderService
      .getFolder(this.folderId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.folderName = res.folderName;
        },
        error: (err) => {
          console.log('Failed to get folder data: ', err);
        },
      });
  }

  deleteDoc(id: number) {
    return this._docsService
      .deleteDocument(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.closeModal();
          this.getDocsList();
        },
        error: (err) => {
          console.log('Failed to delete document: ', err);
        },
      });
  }

  openDeleteModal(id: number) {
    this.isDeleteModalOpen = true;
    this.docToDeleteId = id;
  }

  closeModal() {
    this.isDeleteModalOpen = false;
  }
}
