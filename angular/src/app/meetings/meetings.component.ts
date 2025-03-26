import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeetingsService } from '../services/meetings.service';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css'],
  standalone:false
})
export class MeetingsComponent implements OnInit {
  meetingForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  availableSlots: string[] = [];
  userMeetings: any[] = [];
  editingMeetingId: number | null = null;

  constructor(private fb: FormBuilder, private meetingsService: MeetingsService) {
    this.meetingForm = this.fb.group({
      meetingDate: ['', Validators.required],
      startTime: ['', Validators.required],
      title: ['', Validators.required],
      numPeople: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      duration: ['30m', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserMeetings();
  }

  fetchAvailableSlots(): void {
    const date = this.meetingForm.value.meetingDate;
    if (!date) return;

    this.meetingsService.getAvailableSlots(date).subscribe({
      next: (slots) => this.availableSlots = slots,
      error: (err) => console.error('Error fetching slots:', err)
    });
  }

  onSubmit(): void {
    if (this.meetingForm.invalid) {
      this.errorMessage = 'Please complete the form.';
      return;
    }

    const userId = localStorage.getItem('userId');
    const formData = { ...this.meetingForm.value, userId };
    const dateTime = `${formData.meetingDate} ${formData.startTime}:00`;
    const payload = { ...formData, dateTime };

    if (this.editingMeetingId) {
      // ✅ Update Meeting
      this.meetingsService.updateMeeting(this.editingMeetingId, payload).subscribe({
        next: () => {
          this.successMessage = 'Meeting updated!';
          this.errorMessage = '';
          this.editingMeetingId = null;
          this.meetingForm.reset();
          this.loadUserMeetings();
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Update failed.';
        }
      });
    } else {
      // ✅ Create Meeting
      this.meetingsService.createMeeting(payload).subscribe({
        next: () => {
          this.successMessage = 'Meeting booked!';
          this.errorMessage = '';
          this.meetingForm.reset();
          this.loadUserMeetings();
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Booking failed.';
        }
      });
    }
  }

  loadUserMeetings(): void {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
  
    if (!userId || !role) return;
  
    if (role === 'admin') {
      // Get all meetings
      this.meetingsService.getAllMeetings().subscribe({
        next: (meetings) => this.userMeetings = meetings,
        error: (err) => console.error('Failed to load all meetings', err)
      });
    } else {
      // Get only this user's meetings
      this.meetingsService.getUserMeetings(userId).subscribe({
        next: (meetings) => this.userMeetings = meetings,
        error: (err) => console.error('Failed to load user meetings', err)
      });
    }
  }
  
  

  editMeeting(meeting: any): void {
    this.editingMeetingId = meeting.id;

    const date = meeting.date_time.split('T')[0];
    const time = new Date(meeting.date_time).toTimeString().slice(0, 5);

    this.meetingForm.patchValue({
      title: meeting.title,
      description: meeting.description,
      meetingDate: date,
      startTime: time,
      duration: meeting.duration,
      numPeople: meeting.num_people
    });

    this.fetchAvailableSlots();
  }

  deleteMeeting(meetingId: number): void {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
  
    if (!userId || !role) {
      console.error('❌ Missing userId or role in localStorage.');
      return;
    }
  
    this.meetingsService.deleteMeeting(meetingId, userId, role).subscribe({
      next: () => {
        this.userMeetings = this.userMeetings.filter(m => m.id !== meetingId);
        this.successMessage = 'Meeting deleted!';
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Delete failed.';
        this.successMessage = '';
      }
    });
  }
  

  startEditing(meeting: any): void {
    this.editingMeetingId = meeting.id;
    const date = meeting.date_time.split('T')[0];
    const time = new Date(meeting.date_time).toTimeString().slice(0, 5);
  
    meeting.editData = {
      title: meeting.title,
      description: meeting.description,
      meetingDate: date,
      startTime: time,
      duration: meeting.duration,
      numPeople: meeting.num_people
    };
  }
  
  cancelEditing(): void {
    this.editingMeetingId = null;
  }
  saveChanges(meeting: any): void {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
  
    if (!userId || !role) {
      console.error('❌ Missing userId or role in localStorage.');
      return;
    }
  
    const updatedData = {
      ...meeting.editData,
      userId,
      role,
      dateTime: `${meeting.editData.meetingDate} ${meeting.editData.startTime}:00`
    };
  
    this.meetingsService.updateMeeting(meeting.id, updatedData).subscribe({
      next: () => {
        this.successMessage = 'Meeting updated!';
        this.errorMessage = '';
        this.editingMeetingId = null;
        this.loadUserMeetings();
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Update failed.';
        this.successMessage = '';
      }
    });
  }
  
  
  
}
