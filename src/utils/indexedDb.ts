import type { MediaFile, Profile, AppSettings } from '../types';

const DB_NAME = 'netflix-clone-db';
const DB_VERSION = 1;

interface DBSchema {
  media: MediaFile;
  profiles: Profile;
  settings: AppSettings;
  folderHandle: { key: string; handle: FileSystemDirectoryHandle };
  playback: { mediaId: string; position: number; timestamp: number };
}

type StoreName = keyof DBSchema;

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('category', 'category', { unique: false });
          mediaStore.createIndex('seriesName', 'seriesName', { unique: false });
          mediaStore.createIndex('addedAt', 'addedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('folderHandle')) {
          db.createObjectStore('folderHandle', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('playback')) {
          const playbackStore = db.createObjectStore('playback', { keyPath: 'mediaId' });
          playbackStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: StoreName, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.dbReady;
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Media operations
  async addMedia(media: MediaFile): Promise<void> {
    const store = await this.getStore('media', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(media);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addMediaBatch(mediaList: MediaFile[]): Promise<void> {
    const db = await this.dbReady;
    const transaction = db.transaction('media', 'readwrite');
    const store = transaction.objectStore('media');

    return new Promise((resolve, reject) => {
      mediaList.forEach((media) => store.put(media));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getAllMedia(): Promise<MediaFile[]> {
    const store = await this.getStore('media');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMediaById(id: string): Promise<MediaFile | undefined> {
    const store = await this.getStore('media');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMediaMetadata(id: string, metadata: MediaFile['metadata']): Promise<void> {
    const store = await this.getStore('media', 'readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const media = getRequest.result;
        if (media) {
          media.metadata = metadata;
          const putRequest = store.put(media);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteMedia(id: string): Promise<void> {
    const store = await this.getStore('media', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllMedia(): Promise<void> {
    const store = await this.getStore('media', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Profile operations
  async addProfile(profile: Profile): Promise<void> {
    const store = await this.getStore('profiles', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(profile);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProfiles(): Promise<Profile[]> {
    const store = await this.getStore('profiles');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProfile(id: string): Promise<void> {
    const store = await this.getStore('profiles', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Settings operations
  async saveSettings(settings: AppSettings): Promise<void> {
    const store = await this.getStore('settings', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ ...settings, id: 'app-settings' });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSettings(): Promise<AppSettings | undefined> {
    const store = await this.getStore('settings');
    return new Promise((resolve, reject) => {
      const request = store.get('app-settings');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Folder handle operations (stored as JSON string due to non-clonable handles)
  async saveFolderHandle(key: string, handle: FileSystemDirectoryHandle): Promise<void> {
    const store = await this.getStore('folderHandle', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ key, handle: { name: handle.name } });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFolderHandle(key: string): Promise<{ name: string } | undefined> {
    const store = await this.getStore('folderHandle');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Playback position operations
  async savePlaybackPosition(mediaId: string, position: number): Promise<void> {
    const store = await this.getStore('playback', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ mediaId, position, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPlaybackPosition(mediaId: string): Promise<number | undefined> {
    const store = await this.getStore('playback');
    return new Promise((resolve, reject) => {
      const request = store.get(mediaId);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.position);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getRecentlyPlayed(limit: number = 10): Promise<Array<{ mediaId: string; position: number; timestamp: number }>> {
    const store = await this.getStore('playback');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new IndexedDBService();
export default db;
