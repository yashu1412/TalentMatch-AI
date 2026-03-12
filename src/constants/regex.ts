export const EMAIL_REGEX =
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export const PHONE_REGEX =
  /(\+?\d{1,3}[\s-]?)?(\(?\d{3,5}\)?[\s-]?\d{3,5}[\s-]?\d{3,5})/g;

export const EXPERIENCE_REGEX =
  /(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years|year|yrs|yr)\s+(?:of\s+)?experience/gi;

export const EXPERIENCE_RANGE_REGEX =
  /(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:years|year|yrs|yr)/gi;

export const FRESHER_REGEX =
  /\b(fresher|entry[- ]level|junior)\b/gi;

export const INDIAN_SALARY_REGEX =
  /(?:salary|ctc|annual\s+package)?\s*[:\-]?\s*(?:₹|inr|rs\.?)\s?(\d[\d,]*|\d+(?:\.\d+)?\s*(?:lpa|lakhs?|cr|crore)(?:\s+per\s+annum)?)/gi;

export const GLOBAL_SALARY_REGEX =
  /(?:salary|ctc)?\s*[:\-]?\s*(?:\$|usd|£|eur|€)\s?\d[\d,]*(?:\.\d+)?\s*(?:-|–|to)\s*(?:\$|usd|£|eur|€)?\s?\d[\d,]*(?:\.\d+)?\s*(?:per year|annually|year|per\s+annum)/gi;

export const CTC_SALARY_REGEX =
  /\bctc\b\s*[:\-]?\s*(?:₹|inr|rs\.?)?\s*(\d[\d,]*|\d+(?:\.\d+)?\s*(?:lpa|lakhs?|cr|crore))/gi;

export const HOURLY_ANNUAL_SALARY_REGEX =
  /\$\s?\d[\d,]*(?:\.\d+)?\s*\/\s*hour.*?\$?\s?\d[\d,]*(?:\.\d+)?\s*\/\s*year/gi;
