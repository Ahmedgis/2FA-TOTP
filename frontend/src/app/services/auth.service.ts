import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password, token });
  }

  verifyAndCompleteRegistration(username: string, password: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/verify`, { username, password, token });
  }
}
