import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  inactivityTimer: any;

  constructor(
    private fb: FormBuilder, 
    private loginService: LoginService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // ✅ Safe Check for Local Storage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }

    this.loginForm.valueChanges.subscribe(() => {
      this.successMessage = '';
      this.errorMessage = '';
    });
  }

  // ✅ Login Logic with Local Storage
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter a valid email and password.';
      return;
    }

    // Call the Login Service
    this.loginService.loginUser(this.loginForm.value).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';

        // ✅ Store User Info Safely in Local Storage
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);
          localStorage.setItem('token', response.token);
        }

        console.log('User ID:', response.userId);
        console.log('Email:', response.email);

        // ✅ Start Inactivity Timer
        this.startInactivityTimer();

        // ✅ Redirect to Protected Route (e.g., Dashboard)
        this.router.navigate(['/meetings']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Login failed.';
        this.successMessage = '';
      }
    });
  }

  // ✅ Start Inactivity Timer
  startInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Set new inactivity timer (5 minutes = 300000 ms)
    this.inactivityTimer = setTimeout(() => {
      this.logoutDueToInactivity();
    }, 300000); // 5 minutes
  }

  // ✅ Reset Timer on User Activity
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  resetTimer(): void {
    this.startInactivityTimer();
  }

  // ✅ Logout Due to Inactivity
  logoutDueToInactivity(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }

    alert('Logged out due to inactivity.');
    this.router.navigate(['/login']);
  }
}
