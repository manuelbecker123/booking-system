import { Component } from '@angular/core';
import { SubscribeService } from '../services/subscribe.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone:false
})
export class HomeComponent {
  email: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private subscribeService: SubscribeService) {}

  onSubscribe(): void {
    if (!this.email) {
      this.errorMessage = 'Email is required.';
      this.successMessage = '';
      return;
    }

    this.subscribeService.subscribe(this.email).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.errorMessage = '';
        this.email = '';
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Subscription failed.';
        this.successMessage = '';
      }
    });
  }
}
