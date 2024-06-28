import { Component, OnInit } from '@angular/core';
import { SnippetsService } from '../../../services/snippets.service';
import { Snippet } from '../../../models/snippet';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-snippets-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snippets-page.component.html',
  styleUrl: './snippets-page.component.scss',
})
export class SnippetsPageComponent implements OnInit {
  snippets: Snippet[] = [];

  constructor(
    private _snippetService: SnippetsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSnippetList();
  }

  getSnippetList() {
    return this._snippetService.getSnippetsList()?.subscribe({
      next: (res) => {
        this.snippets = res;
      },
      error: (err) => {
        console.log('Failed to get snippets list: ', err);
        this.router.navigate(['/']);
      },
    });
  }
}
