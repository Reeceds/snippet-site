import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CurrentUser } from '../../../../models/currentUser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FoldersService } from '../../../../services/folders.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Folder } from '../../../../models/folder';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../../modal/modal.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './docs-folders-list-page.component.html',
  styleUrl: './docs-folders-list-page.component.scss',
})
export class DocsFoldersListPageComponent implements OnInit {
  // currentUser$: CurrentUser = {};
  faPlus = faPlus;
  faEllipsis = faEllipsis;
  destroyRef = inject(DestroyRef);
  fb = inject(NonNullableFormBuilder);

  foldersList: Folder[] | undefined;
  folderToDeleteId: number | undefined;

  foldersListError: boolean = false;
  createFolderError: boolean = false;
  editFolderError: boolean = false;
  isCreateModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  isFolderTitleEmpty: boolean = false;

  newTitle: string | undefined;
  editTitle: string | undefined;

  constructor(
    private authService: AuthService,
    private _foldersService: FoldersService
  ) {}

  ngOnInit(): void {
    // this.authService.currentUser$.subscribe({
    //   next: (res) => {
    //     this.currentUser$ = res;
    //     console.log('reece', this.currentUser$);
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
    this.getFoldersList();
  }

  createFolderForm = this.fb.group({
    folderName: new FormControl('', [Validators.required]),
  });

  editFolderForm = this.fb.group({
    folderId: new FormControl('', [Validators.required]),
    folderName: new FormControl('', [Validators.required]),
  });

  getFoldersList() {
    return this._foldersService
      .getFoldersList()
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.foldersList = res;
        },
        error: (err) => {
          console.log('Failed to get folders list: ', err);
          this.foldersListError = true;
        },
      });
  }

  createFolderSubmit() {
    const folderName = this.createFolderForm.value.folderName?.trim();

    if (folderName === '' || folderName === undefined) {
      this.isFolderTitleEmpty = true;
      console.log('Folder title empty');
      return;
    }

    if (this.createFolderForm.invalid) {
      this.createFolderError = true;
      console.log(
        'Create folder error: ',
        this.createFolderForm.controls.folderName.errors
      );
      return;
    }

    const newFolder: Folder = {
      folderName: folderName,
    };

    this._foldersService
      .createFolder(newFolder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.getFoldersList();
          this.isCreateModalOpen = false;
          this.createFolderForm.reset();
        },
        error: (err) => {
          this.createFolderError = true;
          console.log('Failed to create folder: ', err);
        },
      });
  }

  editFolderSubmit() {
    const folderId = this.editFolderForm.value.folderId;
    const folderName = this.editFolderForm.value.folderName?.trim();

    if (folderName === '' || folderName === undefined) {
      this.isFolderTitleEmpty = true;
      console.log('Folder title empty');
      return;
    }

    if (this.createFolderForm.invalid) {
      this.editFolderError = true;
      console.log(
        'Edit folder error: ',
        this.createFolderForm.controls.folderName.errors
      );
      return;
    }

    const editedFolder: Folder = {
      id: +folderId!,
      folderName: folderName,
    };

    this._foldersService
      .editFolder(editedFolder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.getFoldersList();
          this.isEditModalOpen = false;
        },
        error: (err) => {
          this.editFolderError = true;
          console.log('Failed to edit folder: ', err);
        },
      });
  }

  deleteFolder(id: number) {
    this._foldersService
      .deleteFolder(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.closeModal();
          this.getFoldersList();
        },
        error: (err) => {
          console.log('Failed to delete folder: ', err);
        },
      });
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
    this.createFolderError = false;
    this.isFolderTitleEmpty = false;
  }

  openEditModal(id: number, name: string) {
    this.isEditModalOpen = true;
    this.editFolderError = false;
    this.isFolderTitleEmpty = false;

    this.editFolderForm.patchValue({
      folderId: String(id),
      folderName: name,
    });
  }

  openDeleteModal(id: number) {
    this.isDeleteModalOpen = true;
    this.folderToDeleteId = id;
  }

  closeModal() {
    this.isCreateModalOpen = false;
    this.isEditModalOpen = false;
    this.isDeleteModalOpen = false;
    this.editFolderError = false;
    this.createFolderForm.reset();
  }
}
