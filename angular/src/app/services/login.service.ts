import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/api/login';

  constructor(private http: HttpClient) { }

  // ✅ Login User and Store in Local Storage
  loginUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, userData, { headers });
  }

  // ✅ Check if User is Logged In
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ Get User Details
  getUserDetails() {
    return {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('email')
    };
  }

  // ✅ Logout User
  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
  }
}
