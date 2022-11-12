import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  displayTitle = 'Engine';

  urlChange$ = this.router.events.pipe(
    filter(i => i instanceof NavigationEnd),
    tap(() => this.title.setTitle(`${this.displayTitle} — ${this.router.url}`))
  );

  constructor(private readonly title: Title, private readonly router: Router) {}
}
