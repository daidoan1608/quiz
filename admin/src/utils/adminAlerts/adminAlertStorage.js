const DISMISSED_ALERTS_KEY = "adminDismissedAlertIds";

export const readDismissedAlertIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_ALERTS_KEY) || "[]"));
  } catch (error) {
    return new Set();
  }
};

export const writeDismissedAlertIds = (ids) => {
  localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(Array.from(ids)));
};
