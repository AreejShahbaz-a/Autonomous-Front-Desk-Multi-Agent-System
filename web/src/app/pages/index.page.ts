import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <main>
      <h1>Autonomous Front Desk Agent</h1>
    </main>
  `,
  styles: `
    :host {
      display: block;
      padding: 1rem;
    }
  `,
})
export default class Home {}
