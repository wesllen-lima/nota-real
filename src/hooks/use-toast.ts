"use client";

import { useState, useEffect } from "react";

export interface ToastItem {
  id: number;
  message: string;
  type?: "success" | "info";
}

const listeners = new Set<(t: ToastItem[]) => void>();
let _toasts: ToastItem[] = [];
let _id = 0;

function notify() {
  listeners.forEach((fn) => fn([..._toasts]));
}

export function toast(message: string, type: ToastItem["type"] = "success") {
  const id = _id++;
  _toasts = [..._toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== id);
    notify();
  }, 3200);
}

export function useToastStore(): ToastItem[] {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    listeners.add(setItems);
    return () => { listeners.delete(setItems); };
  }, []);
  return items;
}
