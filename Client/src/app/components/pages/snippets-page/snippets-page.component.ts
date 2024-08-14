import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { SnippetsService } from '../../../services/snippets.service';
import { Snippet } from '../../../models/snippet';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-snippets-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snippets-page.component.html',
  styleUrl: './snippets-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnippetsPageComponent implements OnInit {
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
}
