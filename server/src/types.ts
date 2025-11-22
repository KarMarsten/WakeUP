// Type definitions for the application

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  eventId: string;
  groupId: string;
  reminderTime: Date;
  advanceMinutes: number;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Acknowledgement {
  id: string;
  reminderId: string;
  memberId?: string;
  method: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'WEB_APP' | 'MANUAL';
  acknowledgedAt: Date;
  notes?: string;
}

