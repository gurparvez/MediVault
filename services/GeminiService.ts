import { MedicalDocument, MedicalEvent } from '../constants/Types';

class GeminiService {
  // Mock data for now
  private mockEvents: MedicalEvent[] = [
    {
      id: '1',
      title: 'Cardiologist Appointment',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      type: 'appointment',
      location: 'City Hospital, Room 302',
    },
    {
      id: '2',
      title: 'Take Amoxicillin',
      date: new Date(Date.now() + 3600000).toISOString(), // In 1 hour
      type: 'medication',
      description: '500mg after lunch',
    },
    {
      id: '3',
      title: 'Annual Checkup',
      date: new Date(Date.now() + 604800000).toISOString(), // Next week
      type: 'appointment',
    },
  ];

  private mockDocuments: MedicalDocument[] = [
    {
      id: '1',
      uri: 'https://via.placeholder.com/150', // Placeholder image
      name: 'Blood Test Results.pdf',
      uploadDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      status: 'completed',
      summary: 'All values within normal range.',
    },
    {
      id: '2',
      uri: 'https://via.placeholder.com/150',
      name: 'Prescription - Dr. Smith.jpg',
      uploadDate: new Date().toISOString(),
      status: 'processing',
    },
  ];

  async getUpcomingEvents(): Promise<MedicalEvent[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.mockEvents;
  }

  async getRecentUploads(): Promise<MedicalDocument[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.mockDocuments;
  }

  async uploadDocument(uri: string): Promise<MedicalDocument> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newDoc: MedicalDocument = {
      id: Math.random().toString(36).substr(2, 9),
      uri,
      name: `Scan_${new Date().toLocaleDateString()}.jpg`,
      uploadDate: new Date().toISOString(),
      status: 'processing',
    };
    this.mockDocuments.unshift(newDoc);
    return newDoc;
  }
}

export const geminiService = new GeminiService();
