import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Doc } from '../../../../models/doc';
import { DocsService } from '../../../../services/docs.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FoldersService } from '../../../../services/folders.service';
import 'prismjs';

declare const Prism: any;

@Component({
  selector: 'app-docs-document-view-page',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './docs-document-view-page.component.html',
  styleUrl: './docs-document-view-page.component.scss',
  encapsulation: ViewEncapsulation.None, // ! Use this to apply styling to [innerHTML] elemnts
})
export class DocsDocumentViewPageComponent implements OnInit, AfterViewChecked {
  faCricleArrowLeft = faCircleArrowLeft;
  destroyRef = inject(DestroyRef);

  documentData: Doc | undefined;
  documentId: number | undefined;
  folderId: number | undefined;
  folderName: string | undefined;
  getDocumentError: boolean = false;

  constructor(
    private _docsService: DocsService,
    private _folderService: FoldersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.params['docId'];
    this.folderId = this.route.snapshot.params['folderId'];
    this.getDocument();
    this.getFolder();
  }

  ngAfterViewChecked(): void {
    Prism.highlightAll();
  }

  getDocument() {
    return this._docsService
      .getDocument(this.documentId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.documentData = res;
        },
        error: (err) => {
          this.getDocumentError = true;
          console.log('Failed to get document data: ', err);
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
}
