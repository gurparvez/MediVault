export type EventType = 'appointment' | 'medication' | 'reminder';

export interface MedicalEvent {
  id: string;
  title: string;
  date: string; // ISO string
  type: EventType;
  description?: string;
  location?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

export type DocumentStatus = 'processing' | 'completed' | 'failed';

export interface MedicalDocument {
  id: string;
  uri: string;
  name: string;
  uploadDate: string; // ISO string
  status: DocumentStatus;
  summary?: string;
  category?: string;
  context?: string;
  embedding?: number[];
  extractedEvents?: MedicalEvent[];
}
