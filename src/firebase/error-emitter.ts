
'use client';

/**
 * A lightweight, browser-compatible event emitter to replace the Node.js 'events' module.
 * This prevents client-side exceptions in environments like Netlify/Vercel where 
 * Node polyfills are not automatically provided.
 */
type Listener = (...args: any[]) => void;

class SimpleEventEmitter {
  private listeners: { [event: string]: Listener[] } = {};

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((l) => l(...args));
    }
  }

  removeListener(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }
}

export const errorEmitter = new SimpleEventEmitter();
