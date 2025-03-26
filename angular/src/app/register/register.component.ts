import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RegisterService } from '../services/register.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';




@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private registerService: RegisterService, private router: Router
    , private cdRef: ChangeDetectorRef // ✅ Add this
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', Validators.required],
      phone_number: ['', [this.phoneValidator]]
    });
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.subscribe(() => {
      if (!this.successMessage) { // ✅ Only clear messages if there’s no success message
        this.successMessage = '';
        this.errorMessage = '';
      }
    });
  }
  

  // ✅ Custom Phone Validator
  phoneValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) return null;  // Optional field
    
    const phonePattern = /^(\+?[0-9]{1,15}|[0-9]{1,15})$/;
    if (!phonePattern.test(value)) {
      return { invalidPhone: true };
    }
    return null;
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please correct the errors before submitting.';
      return;
    }
  
    if (this.registerForm.value.password !== this.registerForm.value.repeatPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
  
    console.log('Submitting form:', this.registerForm.value); // ✅ Debugging form values
  
    this.registerService.registerUser(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('Success Response:', response); // ✅ Check if success response is received
  
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.errorMessage = '';
        this.registerForm.reset();
  
        // ✅ Redirect to Login Page after 2 seconds
        setTimeout(() => {
          console.log('Redirecting to login...');
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error Response:', error); // ✅ Check if there’s an API error
        this.errorMessage = error.error.message || 'Registration failed.';
        this.successMessage = '';
      }
    });
  }
  


}
  