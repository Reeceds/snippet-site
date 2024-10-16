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
  selector: 'app-docs-document-create-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, EditorModule],
  templateUrl: './docs-document-create-page.component.html',
  styleUrl: './docs-document-create-page.component.scss',
})
export class DocsDocumentCreatePageComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  fb = inject(NonNullableFormBuilder);
  tinyMceApiKey: string = '90qudyul1l4rco954qm4d426bevwnpgn5tjdooz6vdn7txvw';

  folderId: number | undefined;
  newTitle: string | undefined;

  createDocumentError: boolean = false;
  formSubmitted: boolean = false;

  constructor(
    private _docsService: DocsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.folderId = this.route.snapshot.params['folderId'];
  }

  createDocumentForm = this.fb.group({
    documentTitle: new FormControl('', [Validators.required]),
    content: new FormControl(''),
  });

  createDocumentSubmit() {
    this.formSubmitted = true;
    const documentFormValues = this.createDocumentForm.value;
    const documentName = this.createDocumentForm.value.documentTitle?.trim();

    if (documentName === '' || this.createDocumentForm.invalid) {
      console.log('Document has errors');
      return;
    }

    const documentData: Doc = {
      title: documentFormValues.documentTitle!,
      content: documentFormValues.content!,
      folderId: this.folderId,
    };

    return this._docsService
      .createDocument(documentData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.router.navigate([`/docs/folders/${this.folderId}/documents`]);
        },
        error: (err) => {
          console.log('Failed to create document: ', err);
          this.createDocumentError = true;
        },
      });
  }
}
