import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { SnippetsService } from '../../../../services/snippets.service';
import { Snippet } from '../../../../models/snippet';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-snippets-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './snippets-list-page.component.html',
  styleUrl: './snippets-list-page.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetsListPageComponent implements OnInit {
  faEllipsis = faEllipsis;
  destroyRef = inject(DestroyRef);
  snippets: Snippet[] = [];
  getAllSnippetsError = false;

  constructor(
    private _snippetService: SnippetsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSnippetList();
  }

  getSnippetList() {
    this._snippetService
      .getSnippetsList()
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      ?.subscribe({
        next: (res) => {
          this.snippets = res;
        },
        error: (err) => {
          console.log('Failed to get snippets list: ', err);
          this.getAllSnippetsError = true;
          // this.router.navigate(['/']);
        },
      });
  }

  deleteSnippet(id: number) {
    this._snippetService.deleteSnippet(id).subscribe({
      next: (res) => {
        console.log(res);
        this.getSnippetList();
      },
      error: (err) => {
        console.log('Error deleting snippet: ', err);
      },
    });
  }
}
