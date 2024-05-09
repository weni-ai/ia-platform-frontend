/* eslint-disable no-self-assign */
/* eslint-disable max-len */
const packageDict = require('./package.json');

process.env.VITE_VERSION = packageDict.version;
process.env.VITE_API_BASE_URL =
  process.env.VITE_API_BASE_URL || 'http://localhost:8000/';
process.env.VITE_BOTHUB_NLP_BASE_URL =
  process.env.VITE_BOTHUB_NLP_BASE_URL || 'http://localhost:2657/';
process.env.VITE_BOTHUB_WEBAPP_BASE_URL =
  process.env.VITE_BOTHUB_WEBAPP_BASE_URL || 'http://localhost:8080/';
process.env.VITE_VERSION_ENABLED = process.env.VITE_VERSION_ENABLED || true;
process.env.VITE_BOTHUB_WEBAPP_USE_SENTRY =
  process.env.VITE_BOTHUB_WEBAPP_USE_SENTRY || false;
process.env.VITE_SUPPORTED_LANGUAGES =
  process.env.VITE_SUPPORTED_LANGUAGES || 'en|pt_br';
process.env.VITE_BOTHUB_WEBAPP_USE_HOTJAR =
  process.env.VITE_BOTHUB_WEBAPP_USE_HOTJAR || false;
process.env.VITE_BOTHUB_WEBAPP_LIGHTHOUSE_KEY =
  process.env.VITE_BOTHUB_WEBAPP_LIGHTHOUSE_KEY || '';
process.env.VITE_BOTHUB_WEBAPP_LIGHTHOUSE_ALGORITHM_ARTICLE_ID =
  process.env.VITE_BOTHUB_WEBAPP_LIGHTHOUSE_ALGORITHM_ARTICLE_ID || '';
process.env.VITE_BOTHUB_WEBAPP_PAYMENT_ENABLED =
  process.env.VITE_BOTHUB_WEBAPP_PAYMENT_ENABLED || false;
process.env.VITE_BOTHUB_WEBAPP_TUTORIAL_ENABLED =
  process.env.VITE_BOTHUB_WEBAPP_TUTORIAL_ENABLED || false;
process.env.VITE_BOTHUB_WEBAPP_HOTJAR_ID =
  process.env.VITE_BOTHUB_WEBAPP_HOTJAR_ID || '';
process.env.VITE_MAILCHIMP_LOGIN = process.env.VITE_MAILCHIMP_LOGIN || '';
process.env.VITE_BOTHUB_WEBAPP_SENTRY =
  process.env.VITE_BOTHUB_WEBAPP_SENTRY || '';
process.env.VITE_MAILCHIMP_DATACENTER =
  process.env.VITE_MAILCHIMP_DATACENTER || '';
process.env.VITE_MAILCHIMP_USER_ID = process.env.VITE_MAILCHIMP_USER_ID || '';
process.env.VITE_MAILCHIMP_LIST_ID = process.env.VITE_MAILCHIMP_LIST_ID || '';
process.env.VITE_RECAPTCHA_TOKEN = process.env.VITE_RECAPTCHA_TOKEN || '';
process.env.VITE_HELPHERO_ID = process.env.VITE_HELPHERO_ID || '';
process.env.VITE_HELPHERO_TOUR = process.env.VITE_HELPHERO_TOUR || '';
process.env.VITE_QA_FLOW_CHANNEL = process.env.VITE_QA_FLOW_CHANNEL || '';
process.env.VITE_LOGROCKET_ID = process.env.VITE_LOGROCKET_ID || '';
process.env.VITE_LOGROCKET_PARENT_DOMAIN =
  process.env.VITE_LOGROCKET_PARENT_DOMAIN || '';
