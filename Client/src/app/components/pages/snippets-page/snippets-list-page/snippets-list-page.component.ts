import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { SnippetsService } from '../../../../services/snippets.service';
import { Snippet } from '../../../../models/snippet';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { CategoriesService } from '../../../../services/categories.service';
import { Category } from '../../../../models/category';
import { FiltersService } from '../../../../services/filters.service';
import { Filter } from '../../../../models/filter';
import { ModalComponent } from '../../../modal/modal.component';
import {
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import 'prismjs';

declare const Prism: any;

@Component({
  selector: 'app-snippets-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FontAwesomeModule,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './snippets-list-page.component.html',
  styleUrl: './snippets-list-page.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetsListPageComponent implements OnInit, AfterViewChecked {
  faEllipsis = faEllipsis;
  destroyRef = inject(DestroyRef);
  snippetsList: Snippet[] = [];
  categoriesList: Category[] = [];
  filtersList: Filter[] = [];
  viewSnippet: Snippet | undefined;
  selectedFiltersArr: string[] = [];
  filtersQueryString: string = '';
  filtersQueryArr: string[] = [];
  snippetToDeleteId: number | undefined;

  getSnippetsError: boolean = false;
  getCategoriesError: boolean = false;
  getFiltersError: boolean = false;
  noSnippetsFound: boolean = false;

  isViewModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;

  pageSize: number = 6;
  loadMoreSize: number = 6;
  resultsCount: number | undefined;
  hasMoreItems: boolean = true;

  fb = inject(NonNullableFormBuilder);

  constructor(
    private _snippetService: SnippetsService,
    private _categoriesService: CategoriesService,
    private _filterService: FiltersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getFilters();
    this.getSnippetList();
  }

  ngAfterViewChecked(): void {
    Prism.highlightAll();
  }

  searchForm = this.fb.group({
    searchTerm: new FormControl(''),
  });

  getSnippetList() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((param) => {
        if (param.get('filters') !== null) {
          this.filtersQueryString = param.get('filters')!;
        } else {
          this.filtersQueryString = '';
        }

        if (param.get('search') !== null) {
          this.searchForm.patchValue({
            searchTerm: this.route.snapshot.queryParams['search'],
          });
        }
      });

    this._snippetService
      .getSnippetsList(
        this.filtersQueryString!,
        this.searchForm.value.searchTerm!,
        this.pageSize
      )
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      ?.subscribe({
        next: (res) => {
          this.snippetsList = res.items;
          this.resultsCount = res.resultsCount;
          this.hasMoreItems = res.hasMoreItems;
        },
        error: (err) => {
          if (err.error.text.includes('No snippets found')) {
            this.noSnippetsFound = true;
            console.log('No snippets found: ', err);
          } else {
            this.getSnippetsError = true;
            console.log('Failed to get snippets list: ', err);
          }
        },
      });
  }

  getCategories() {
    return this._categoriesService
      .getCategoriesData()
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.categoriesList = res;
        },
        error: (err) => {
          console.log('Failed to get categories list: ', err);
          this.getCategoriesError = true;
        },
      });
  }

  getFilters() {
    this.filtersQueryArr = this.filtersQueryString.split(',');

    return this._filterService
      .getFilters()
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.filtersList = res;

          this.filtersList.forEach((el) => {
            const isChecked = this.filtersQueryArr.find(
              (x) => x.toLowerCase() === el.filterName!.toLowerCase()
            );
            if (isChecked) el.isChecked = true;
          });
        },
        error: (err) => {
          console.log('Failed to get filters list: ', err);
          this.getFiltersError = true;
        },
      });
  }

  deleteSnippet(id: number) {
    this._snippetService.deleteSnippet(id).subscribe({
      next: (res) => {
        this.getSnippetList();
      },
      error: (err) => {
        console.log('Error deleting snippet: ', err);
      },
    });
    this.closeModal();
  }

  loadMoreSnippets() {
    this.pageSize += this.loadMoreSize;
    this.getSnippetList();
  }

  openViewModal(id: number) {
    this.isViewModalOpen = true;

    const selectedSnippet = this.snippetsList.find((x) => x.id === id);
    this.viewSnippet = selectedSnippet;
  }

  openDeleteModal(id: number) {
    this.isDeleteModalOpen = true;
    this.snippetToDeleteId = id;
  }

  closeModal() {
    this.isViewModalOpen = false;
    this.isDeleteModalOpen = false;
  }

  copySnippet(value: string) {
    navigator.clipboard.writeText(value).then(
      () => console.log('Text copied to clipboard: ', value),
      (err) => console.error('Failed to copy text: ', err)
    );
  }

  onCheckboxChange(e: any) {
    // Add checked filter to array
    if (e.target.checked) {
      this.selectedFiltersArr.push(e.target.value);
    }

    // Remove filter from array if previosly checked and now unchecked
    if (!e.target.checked) {
      const filter = this.selectedFiltersArr.find((f) => f === e.target.value);
      const filterIndex = this.selectedFiltersArr.indexOf(filter!);
      if (filter) this.selectedFiltersArr.splice(filterIndex, 1);
    }
  }

  onFiltersSubmit() {
    this.router
      .navigate(['/snippets'], {
        queryParamsHandling: 'merge',
        queryParams: { filters: this.selectedFiltersArr.join() },
      })
      .then(() => {
        this.getSnippetList();
        this.getFilters();
      });
  }

  clearFilters() {
    this.router
      .navigate(['/snippets'], {
        queryParamsHandling: 'merge',
        queryParams: { filters: '' },
      })
      .then(() => {
        this.getSnippetsError = false;
        this.noSnippetsFound = false;
        this.selectedFiltersArr = [];
        this.filtersList = [];
        this.getSnippetList();
        this.getFilters();
      });
  }

  removeFilter(filter: string) {
    const filterIndex = this.selectedFiltersArr.indexOf(filter);
    this.selectedFiltersArr.splice(filterIndex, 1);

    this.router
      .navigate(['/snippets'], {
        queryParamsHandling: 'merge',
        queryParams: { filters: this.selectedFiltersArr.join() },
      })
      .then(() => {
        this.getSnippetsError = false;
        this.getSnippetList();
        this.getFilters();
      });
  }

  onSearchSubmit() {
    this.router
      .navigate(['/snippets'], {
        queryParamsHandling: 'merge',
        queryParams: { search: this.searchForm.value.searchTerm },
      })
      .then(() => {
        this.getSnippetList();
        this.getFilters();
      });
  }

  clearSearch() {
    this.router
      .navigate(['/snippets'], {
        queryParamsHandling: 'merge',
        queryParams: { search: '' },
      })
      .then(() => {
        this.searchForm.patchValue({
          searchTerm: '',
        });
        this.getSnippetsError = false;
        this.noSnippetsFound = false;
        this.getSnippetList();
        this.getFilters();
      });
  }
}
