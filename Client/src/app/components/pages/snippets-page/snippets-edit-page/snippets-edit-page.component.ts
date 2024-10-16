import { Component, DestroyRef, DoCheck, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FiltersService } from '../../../../services/filters.service';
import { Filter } from '../../../../models/filter';
import { Category } from '../../../../models/category';
import { CategoriesService } from '../../../../services/categories.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../modal/modal.component';
import { SnippetsService } from '../../../../services/snippets.service';
import { Snippet } from '../../../../models/snippet';
import { Router, RouterLink } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-snippets-edit-page',
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    ModalComponent,
    ReactiveFormsModule,
    RouterLink,
    EditorModule,
  ],
  templateUrl: './snippets-edit-page.component.html',
  styleUrl: './snippets-edit-page.component.scss',
})
export class SnippetsEditPageComponent implements OnInit, DoCheck {
  paramId: number | undefined;

  selectedSnippet: Snippet | undefined;

  faPen = faPen;
  faTrash = faTrashCan;
  isCreateModalOpen: boolean = false;
  isEditModalOpen: boolean = false;

  categoriesList: Category[] = [];
  filtersList: Filter[] = [];
  getFiltersError: boolean = false;
  newFiltersList: Filter[] = [];
  filterIdCounter: number = 0;
  selectedFiltersArr: any[] = [];

  formSubmitted: boolean = false;
  filterFormSubmitted: boolean = false;
  duplicateFilterError: boolean = false;

  destroyRef = inject(DestroyRef);
  fb = inject(NonNullableFormBuilder);
  tinyMceApiKey: string = '90qudyul1l4rco954qm4d426bevwnpgn5tjdooz6vdn7txvw';

  constructor(
    private _snippetService: SnippetsService,
    private _filterService: FiltersService,
    private _categoriesService: CategoriesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getSnippet();
    this.getFilterList();
    this.getCategoriesList();
  }

  ngDoCheck(): void {
    this.filtersList.forEach((el) => {
      const isChecked = this.selectedFiltersArr.find((x) => x.id === el.id);

      if (isChecked) el.isChecked = true;
    });
  }

  createSnippetForm = this.fb.group({
    snippetTitle: new FormControl('', [Validators.required]),
    snippetBody: new FormControl('', [Validators.required]),
    snippetNotes: new FormControl(''),
  });

  createFilterForm = this.fb.group({
    filterName: new FormControl('', [Validators.required]),
    categoryName: new FormControl('', [Validators.required]),
  });

  editFilterForm = this.fb.group({
    filterId: new FormControl(''),
    filterName: new FormControl('', [Validators.required]),
    categoryName: new FormControl('', [Validators.required]),
  });

  getSnippet() {
    const paramId = this.route.snapshot.params['id'];

    this._snippetService
      .getSnippet(paramId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.selectedSnippet = res;

          res.snippetFilters?.forEach((el) => {
            this.selectedFiltersArr.push({
              id: el.filterId!,
              filterName: el.filterName,
            });
          });

          this.createSnippetForm.patchValue({
            snippetTitle: res.title,
            snippetBody: res.content,
            snippetNotes: res.notes,
          });
        },
        error: (err) => {
          console.log('Error getting snippet: ', err);
        },
      });
  }

  getFilterList() {
    return this._filterService
      .getFilters()
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      ?.subscribe({
        next: (res) => {
          this.filtersList = res;
        },
        error: (err) => {
          this.getFiltersError = true;
          console.log('Failed to get filters list: ', err);
        },
      });
  }

  getCategoriesList() {
    this._categoriesService
      .getCategoriesData()
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      ?.subscribe({
        next: (res) => {
          this.categoriesList = res;
        },
        error: (err) => {
          console.log('Failed to get categories list: ', err);
        },
      });
  }

  resetModalForm() {
    this.createFilterForm.reset();
    this.filterFormSubmitted = false;
    this.duplicateFilterError = false;
  }

  openCreateModal() {
    this.filterFormSubmitted = false;
    this.isCreateModalOpen = true;

    this.createFilterForm.patchValue({
      categoryName: 'default',
    });
  }

  openEditModal(index: number) {
    this.filterFormSubmitted = false;
    this.isEditModalOpen = true;

    const filter = this.newFiltersList.find((f) => f.id === index);

    this.editFilterForm.patchValue({
      filterId: String(filter?.id),
      filterName: filter?.filterName,
      categoryName: String(filter?.categoryName),
    });
  }

  closeModal() {
    this.isCreateModalOpen = false;
    this.isEditModalOpen = false;
    this.duplicateFilterError = false;
    this.resetModalForm();
  }

  createFilterSubmit() {
    this.filterFormSubmitted = true;
    this.duplicateFilterError = false;
    const value = this.createFilterForm.value;

    if (
      this.createFilterForm.invalid ||
      this.createFilterForm.controls.categoryName.value === 'default'
    ) {
      return;
    }

    this.filtersList.forEach((el, i) => {
      if (el.filterName!.toLowerCase() === value.filterName!.toLowerCase()) {
        this.duplicateFilterError = true;
      }
    });

    this.newFiltersList.forEach((el, i) => {
      if (el.filterName!.toLowerCase() === value.filterName!.toLowerCase()) {
        this.duplicateFilterError = true;
      }
    });

    if (this.duplicateFilterError) return;

    this.filterIdCounter += 1;

    const category = this.categoriesList.find(
      (c) => c.categoryName === value.categoryName
    );

    this.newFiltersList.push({
      id: this.filterIdCounter,
      filterName: value.filterName!,
      categoryId: category!.id,
      categoryName: value.categoryName!,
    });

    this.closeModal();
  }

  editFilterSubmit() {
    this.filterFormSubmitted = true;
    this.duplicateFilterError = false;
    const value = this.editFilterForm.value;

    if (this.editFilterForm.invalid) return;

    this.filtersList.forEach((el, i) => {
      if (el.filterName!.toLowerCase() === value.filterName!.toLowerCase()) {
        this.duplicateFilterError = true;
      }
    });

    this.newFiltersList.forEach((el, i) => {
      if (el.filterName!.toLowerCase() === value.filterName!.toLowerCase()) {
        this.duplicateFilterError = true;
      }
    });

    if (this.duplicateFilterError) return;

    const category = this.categoriesList.find(
      (c) => c.categoryName === value.categoryName
    );

    const editedFilter: Filter = {
      id: +value.filterId!,
      filterName: value.filterName!,
      categoryId: category!.id,
      categoryName: value.categoryName!,
    };

    const filterToEdit = this.newFiltersList.find(
      (f) => f.id === editedFilter.id
    );
    const filterToEditIndex = this.newFiltersList.indexOf(filterToEdit!);

    this.newFiltersList.splice(filterToEditIndex, 1, editedFilter);

    this.closeModal();
  }

  deleteFilter(index: number) {
    const filter = this.newFiltersList.find((f) => f.id === index);
    const filterIndex = this.newFiltersList.indexOf(filter!);
    this.newFiltersList.splice(filterIndex, 1);
  }

  submitSnippet() {
    this.formSubmitted = true;

    if (this.createSnippetForm.invalid) return;

    const newSnippet: Snippet = {
      id: this.selectedSnippet?.id,
      title: this.createSnippetForm.value.snippetTitle!,
      content: this.createSnippetForm.value.snippetBody!,
      notes: this.createSnippetForm.value.snippetNotes!,
      filters: this.selectedFiltersArr,
      newFilters: this.newFiltersList,
      dateCreated: this.selectedSnippet?.dateCreated,
    };

    console.log(newSnippet);

    // If threre are new filters, create them first
    if (this.newFiltersList.length > 0) {
      this._snippetService.createSnippetFilters(newSnippet).subscribe({
        next: (res) => {
          // Array.isArray() checks if param is an array
          if (Array.isArray(res)) {
            res.forEach((el) => {
              this.selectedFiltersArr.push({
                id: el.id,
                filterName: el.filterName,
              });
            });
          }

          // Post the whole snippet
          this._snippetService.editSnippet(newSnippet).subscribe({
            next: (res) => {
              this.router.navigate(['/snippets']);
            },
            error: (err) => {
              console.log('Error creating snippet: ', err);
            },
          });
        },
        error: (err) => {
          console.log('Error creating filters list: ', err);
        },
      });
    } else {
      // Post the whole snippet
      this._snippetService.editSnippet(newSnippet).subscribe({
        next: (res) => {
          this.router.navigate(['/snippets']);
        },
        error: (err) => {
          console.log('Error creating snippet: ', err);
        },
      });
    }
  }

  onCheckboxChange(e: any) {
    // Add checked filter to array
    if (e.target.checked) {
      this.selectedFiltersArr.push({
        id: +e.target.value,
        filterName: e.target.id,
      });
    }

    // Remove filter from array if previosly checked and now unchecked
    if (!e.target.checked) {
      const filter = this.selectedFiltersArr.find(
        (f) => +f.id === +e.target.value
      );
      const filterIndex = this.selectedFiltersArr.indexOf(filter!);
      if (filter) this.selectedFiltersArr.splice(filterIndex, 1);
    }

    // Sort this nubmers array ascending
    this.selectedFiltersArr.sort(function (a, b) {
      return a - b;
    });
  }
}
