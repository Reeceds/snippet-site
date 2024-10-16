import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DocsService } from '../../../../services/docs.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Doc } from '../../../../models/doc';
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-docs-document-edit-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, EditorModule],
  templateUrl: './docs-document-edit-page.component.html',
  styleUrl: './docs-document-edit-page.component.scss',
})
export class DocsDocumentEditPageComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  fb = inject(NonNullableFormBuilder);
  tinyMceApiKey: string = '90qudyul1l4rco954qm4d426bevwnpgn5tjdooz6vdn7txvw';

  documentData: Doc | undefined;
  folderId: number | undefined;
  documentId: number | undefined;

  getDocumentError: boolean = false;
  editDocumentError: boolean = false;
  formSubmitted: boolean = false;

  constructor(
    private _docsService: DocsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.params['docId'];
    this.folderId = this.route.snapshot.params['folderId'];
    this.getDocument();
  }

  editDocumentForm = this.fb.group({
    documentTitle: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
  });

  getDocument() {
    return this._docsService
      .getDocument(this.documentId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.documentData = res;

          this.editDocumentForm.patchValue({
            documentTitle: res.title,
            content: res.content,
          });
        },
        error: (err) => {
          this.getDocumentError = true;
          console.log('Failed to get document data: ', err);
        },
      });
  }

  editDocumentSubmit() {
    this.formSubmitted = true;
    const documentValues = this.editDocumentForm.value;
    const documentName = this.editDocumentForm.value.documentTitle?.trim();

    if (documentName === '' || this.editDocumentForm.invalid) {
      console.log('Document has errors');
      return;
    }

    const newValues: Doc = {
      id: this.documentId,
      title: documentValues.documentTitle!,
      content: documentValues.content!,
    };

    return this._docsService
      .editDocument(newValues)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.router.navigate([`/docs/folders/${this.folderId}/documents`]);
        },
        error: (err) => {
          console.log('Failed to edit document data: ', err);
          this.editDocumentError = true;
        },
      });
  }
}
