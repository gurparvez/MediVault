import * as SQLite from 'expo-sqlite';
import { DocumentStatus, EventType, MedicalDocument, MedicalEvent } from '../constants/Types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDB() {
    if (this.db) {
        console.log('[DatabaseService] DB already initialized');
        return;
    }
    console.log('[DatabaseService] Initializing DB...');
    this.db = await SQLite.openDatabaseAsync('medivault.db');
    await this.createTables();
    await this.migrateDB();
    console.log('[DatabaseService] DB Initialized and Migrated');
  }

  private async createTables() {
    if (!this.db) return;
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        location TEXT,
        status TEXT
      );
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        uri TEXT NOT NULL,
        name TEXT NOT NULL,
        uploadDate TEXT NOT NULL,
        status TEXT NOT NULL,
        summary TEXT,
        category TEXT,
        context TEXT,
        embedding TEXT
      );
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        image_id TEXT NOT NULL,
        FOREIGN KEY (image_id) REFERENCES documents (id) ON DELETE CASCADE
      );
    `);
  }

  private async migrateDB() {
    if (!this.db) return;
    console.log('[DatabaseService] Running migrations...');
    try {
      await this.db.execAsync('ALTER TABLE documents ADD COLUMN context TEXT;');
      console.log('[DatabaseService] Added context column');
    } catch (e) {
      console.log('[DatabaseService] context column likely exists');
    }
    try {
      await this.db.execAsync('ALTER TABLE documents ADD COLUMN embedding TEXT;');
      console.log('[DatabaseService] Added embedding column');
    } catch (e) {
      console.log('[DatabaseService] embedding column likely exists');
    }
    try {
      await this.db.execAsync('ALTER TABLE events ADD COLUMN status TEXT;');
      console.log('[DatabaseService] Added status column to events');
    } catch (e) {
      console.log('[DatabaseService] status column likely exists in events');
    }
    try {
        await this.db.execAsync(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            image_id TEXT NOT NULL,
            FOREIGN KEY (image_id) REFERENCES documents (id) ON DELETE CASCADE
          );
        `);
        console.log('[DatabaseService] Created categories table if not exists');
    } catch (e) {
        console.log('[DatabaseService] Error creating categories table:', e);
    }
  }

  // --- Events ---
  async addEvent(event: MedicalEvent) {
    if (!this.db) await this.initDB();
    console.log('[DatabaseService] Adding event:', event.title);
    await this.db?.runAsync(
      'INSERT INTO events (id, title, date, type, description, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      event.id, event.title, event.date, event.type, event.description || '', event.location || '', event.status || 'pending'
    );
  }

  async updateEvent(event: MedicalEvent) {
    if (!this.db) await this.initDB();
    console.log('[DatabaseService] Updating event:', event.id);
    await this.db?.runAsync(
      'UPDATE events SET title = ?, date = ?, type = ?, description = ?, location = ?, status = ? WHERE id = ?',
      event.title, event.date, event.type, event.description || '', event.location || '', event.status || 'pending', event.id
    );
  }

  async deleteEvent(id: string) {
    if (!this.db) await this.initDB();
    console.log('[DatabaseService] Deleting event:', id);
    await this.db?.runAsync('DELETE FROM events WHERE id = ?', id);
  }

  async getEvents(): Promise<MedicalEvent[]> {
    if (!this.db) await this.initDB();
    const result = await this.db?.getAllAsync('SELECT * FROM events ORDER BY date ASC');
    return (result as any[]).map(row => ({
      id: row.id,
      title: row.title,
      date: row.date,
      type: row.type as EventType,
      description: row.description,
      location: row.location,
      status: row.status as 'pending' | 'completed' | 'cancelled' || 'pending'
    }));
  }

  // --- Documents ---
  async addDocument(doc: MedicalDocument) {
    if (!this.db) await this.initDB();
    await this.db?.runAsync(
      'INSERT INTO documents (id, uri, name, uploadDate, status, summary, category, context, embedding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      doc.id, doc.uri, doc.name, doc.uploadDate, doc.status, doc.summary || '', doc.category || '', doc.context || '', JSON.stringify(doc.embedding || [])
    );

    if (doc.category) {
        await this.db?.runAsync(
            'INSERT INTO categories (category, image_id) VALUES (?, ?)',
            doc.category, doc.id
        );
    }
  }

  async deleteDocument(id: string) {
    if (!this.db) await this.initDB();
    console.log('[DatabaseService] Deleting document:', id);
    await this.db?.runAsync('DELETE FROM documents WHERE id = ?', id);
    await this.db?.runAsync('DELETE FROM categories WHERE image_id = ?', id);
  }

  async getDocuments(): Promise<MedicalDocument[]> {
    if (!this.db) await this.initDB();
    const result = await this.db?.getAllAsync('SELECT * FROM documents ORDER BY uploadDate DESC');
    return (result as any[]).map(row => ({
      id: row.id,
      uri: row.uri,
      name: row.name,
      uploadDate: row.uploadDate,
      status: row.status as DocumentStatus,
      summary: row.summary,
      category: row.category,
      context: row.context,
      embedding: row.embedding ? JSON.parse(row.embedding) : []
    }));
  }

  async getCategories(): Promise<{ category: string, count: number }[]> {
    if (!this.db) await this.initDB();
    const result = await this.db?.getAllAsync('SELECT category, COUNT(*) as count FROM categories GROUP BY category');
    return (result as any[]).map(row => ({
        category: row.category,
        count: row.count
    }));
  }
}

export const databaseService = new DatabaseService();
