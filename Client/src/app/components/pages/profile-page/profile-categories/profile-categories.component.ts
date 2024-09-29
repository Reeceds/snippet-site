import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ModalComponent } from '../../../modal/modal.component';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FiltersService } from '../../../../services/filters.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Filter } from '../../../../models/filter';
import { CategoriesService } from '../../../../services/categories.service';
import { Category } from '../../../../models/category';

@Component({
  selector: 'app-profile-categories',
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './profile-categories.component.html',
  styleUrl: './profile-categories.component.scss',
})
export class ProfileCategoriesComponent implements OnInit {
  faPen = faPen;
  faTrash = faTrashCan;
  isCreateModalOpen: boolean = false;
  isEditModalOpen: boolean = false;

  categoriesList: Category[] = [];

  getFiltersError: boolean = false;
  filtersList: Filter[] = [];
  newFilter: Filter = {};
  editedFilter: Filter = {};
  formSubmitted: boolean = false;
  duplicateFilterError: boolean = false;

  fb = inject(NonNullableFormBuilder);
  destroyRef = inject(DestroyRef);

  constructor(
    private filterService: FiltersService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.getFilterList();
    this.getCategoriesList();
  }

  createFilterForm = this.fb.group({
    filterName: new FormControl('', [Validators.required]),
    categoryId: new FormControl('', [Validators.required]),
  });

  editFilterForm = this.fb.group({
    filterId: new FormControl(''),
    filterName: new FormControl('', [Validators.required]),
    categoryId: new FormControl('', [Validators.required]),
  });

  getFilterList() {
    return this.filterService
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
    this.categoriesService
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

  openCreateModal() {
    console.log(this.categoriesList);
    this.isCreateModalOpen = true;

    this.createFilterForm.patchValue({
      categoryId: 'default',
    });
  }

  openEditModal(id: number) {
    this.isEditModalOpen = true;

    const filter = this.filtersList.find((f) => f.id === id);
    const category = this.categoriesList.find(
      (c) => c.id === filter?.categoryId
    );

    this.editFilterForm.patchValue({
      filterId: String(filter?.id),
      filterName: filter?.filterName,
      categoryId: String(category?.id),
    });
  }

  closeModal() {
    this.isCreateModalOpen = false;
    this.isEditModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.createFilterForm.reset();
    this.editFilterForm.reset();
    this.formSubmitted = false;
    this.duplicateFilterError = false;
  }

  createFilterSubmit() {
    this.formSubmitted = true;

    if (
      this.createFilterForm.invalid ||
      this.createFilterForm.controls.categoryId.value === 'default'
    ) {
      return;
    }

    this.newFilter = {
      filterName: this.createFilterForm.value.filterName!,
      categoryId: +this.createFilterForm.value.categoryId!, // '+' converts string to a number, can also use Number(this.createFilterForm.value.category!)
    };

    this.filterService
      .createFilter(this.newFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.resetForm();
          this.closeModal();
          this.getFilterList();
        },
        error: (err) => {
          console.log('Error creating filter: ', err);
          if (err.error === 'Duplicate') this.duplicateFilterError = true;
        },
      });
  }

  editFilterSubmit() {
    this.formSubmitted = true;

    if (this.editFilterForm.invalid) return;

    this.editedFilter = {
      id: +this.editFilterForm.value.filterId!,
      filterName: this.editFilterForm.value.filterName!,
      categoryId: +this.editFilterForm.value.categoryId!,
    };
    console.log(this.editedFilter);

    this.filterService
      .editFilter(this.editedFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.resetForm();
          this.closeModal();
          this.getFilterList();
        },
        error: (err) => {
          console.log('Error editing filter: ', err);
          if (err.error === 'Duplicate') this.duplicateFilterError = true;
        },
      });
  }

  deleteFilter(id?: number) {
    const filterId = Number(id);

    return this.filterService.deleteFitler(filterId).subscribe({
      next: () => {
        this.getFilterList();
      },
      error: (err) => {
        console.log('Error deleting filter: ', err);
      },
    });
  }
}
