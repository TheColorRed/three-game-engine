import { Injectable } from '@angular/core';

export interface Settings {
  projects: [string, string][];
  'default-save-location': string;
  'current-project': string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor() {}
  /**
   * Gets a setting item from storage. Otherwise returns the default value.
   * @param key The key to get from the settings object.
   * @param defaultValue The default value if the setting doesn't exist.
   */
  get<T extends keyof Settings>(key: T, defaultValue?: Settings[T]) {
    const val = localStorage.getItem(key) ?? undefined;
    if (typeof val === 'undefined') return defaultValue;
    return JSON.parse(val) as Settings[T];
  }
  /**
   * Sets a value in storage.
   * @param key The key for the storage value.
   * @param value The value to set.
   */
  set<T>(key: keyof Settings, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  /**
   * Deletes an item in storage.
   * @param key The key for the storage value.
   */
  delete(key: keyof Settings) {
    localStorage.removeItem(key);
  }
}
