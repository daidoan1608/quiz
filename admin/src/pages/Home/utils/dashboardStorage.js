import { DASHBOARD_ORDER_STORAGE_KEY, DEFAULT_WIDGET_ORDER } from "../constants";

export function readStoredOrder() {
  try {
    const rawOrder = localStorage.getItem(DASHBOARD_ORDER_STORAGE_KEY);
    const parsedOrder = rawOrder ? JSON.parse(rawOrder) : null;

    if (!Array.isArray(parsedOrder)) {
      return DEFAULT_WIDGET_ORDER;
    }

    const knownIds = new Set(DEFAULT_WIDGET_ORDER);
    const validStoredIds = parsedOrder.filter((id) => knownIds.has(id));
    const missingIds = DEFAULT_WIDGET_ORDER.filter(
      (id) => !validStoredIds.includes(id)
    );

    return [...validStoredIds, ...missingIds];
  } catch {
    return DEFAULT_WIDGET_ORDER;
  }
}

export function saveStoredOrder(widgetOrder) {
  localStorage.setItem(DASHBOARD_ORDER_STORAGE_KEY, JSON.stringify(widgetOrder));
}
