import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeetingsService {
  private apiUrl = 'http://localhost:3000/api'; // ✅ Backend URL

  constructor(private http: HttpClient) {}

  // ✅ Get available slots for a given date
  getAvailableSlots(date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available-slots?date=${date}`);
  }

  // ✅ Create a Meeting (Fix `topic` → `title`)
  createMeeting(meetingData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/meetings`, meetingData);
  }

  // ✅ Fetch all meetings
  getMeetings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meetings`);
  }
getUserMeetings(userId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/meetings?userId=${userId}`);
}

updateMeeting(id: number, meeting: any) {
  return this.http.put(`${this.apiUrl}/meetings/${id}`, meeting);
}

deleteMeeting(id: number, userId: string, role: string) {
  return this.http.delete(`${this.apiUrl}/meetings/${id}?userId=${userId}&role=${role}`);
}

getAllMeetings() {
  return this.http.get<any[]>(`http://localhost:3000/api/all-meetings`);
}


}
