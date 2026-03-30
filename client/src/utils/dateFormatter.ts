// Centralized date formatting utility
// Format: "DD MMMM YYYY" (e.g., "18 November 2024")

import i18n from '../i18n/config';

/**
 * Format date as "DD MMMM YYYY" (e.g., "18 November 2024")
 */
export const formatDateDisplay = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }

  const day = d.getDate();
  const month = d.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
    month: 'long'
  });
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date as "DD MMM YYYY" (e.g., "18 Nov 2024") - shorter version
 */
export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }

  const day = d.getDate();
  const month = d.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
    month: 'short'
  });
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date with weekday: "DD MMMM YYYY, Weekday" (e.g., "18 November 2024, Monday")
 */
export const formatDateWithWeekday = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }

  const day = d.getDate();
  const month = d.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
    month: 'long'
  });
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString(i18n.language === 'ta' ? 'ta-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long'
  });

  return `${day} ${month} ${year}, ${weekday}`;
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
