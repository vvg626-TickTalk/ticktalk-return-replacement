/** TickTalk Wireless login — email-only in this service flow (not the TickTalk App). */
export const TICKTALK_WIRELESS_ACCOUNT_TITLE = 'TickTalk Wireless account';

export const TICKTALK_WIRELESS_ACCOUNT_DESCRIPTION =
  'Enter the email address associated with your TickTalk Wireless account.';

export const TICKTALK_WIRELESS_ACCOUNT_EMAIL_PLACEHOLDER =
  'Enter your TickTalk Wireless account email';

export const TICKTALK_WIRELESS_ACCOUNT_EMAIL_ONLY_NOTE =
  'TickTalk Wireless accounts are email-based only. Phone number login is no longer supported in this service flow.';

export const SERVICE_TICKTALK_APP_ACCOUNT_NOTE = 'This account is separate from your TickTalk App account.';

/** Shown under sign-in / sign-up / contact intros. */
export const SERVICE_ACCOUNT_FOOTNOTE = `${TICKTALK_WIRELESS_ACCOUNT_EMAIL_ONLY_NOTE} ${SERVICE_TICKTALK_APP_ACCOUNT_NOTE}`;

export const SERVICE_SIGN_IN_INTRO = TICKTALK_WIRELESS_ACCOUNT_DESCRIPTION;

export const SERVICE_SIGN_UP_INTRO =
  'Create a TickTalk Wireless account to track your return, replacement, or trade-in request. Enter the email address associated with your TickTalk Wireless account. We’ll use this email to send updates, labels, and support messages.';

export const SERVICE_SIGN_IN_NEW_USER_PROMPT = 'New to TickTalk Wireless?';

export const SERVICE_SIGN_UP_EXISTING_PROMPT = 'Already have a TickTalk Wireless account?';

export const TICKTALK_WIRELESS_REQUESTS_LIST_SIGN_IN_PROMPT =
  'Sign in with your TickTalk Wireless account email to see returns, replacements, and related requests.';

export const TICKTALK_WIRELESS_REQUEST_DETAIL_SIGN_IN_PROMPT =
  'Sign in with your TickTalk Wireless account email to view this request.';

export const SERVICE_AUTH_COPY = {
  verificationSent: 'Verification code sent. Please use it within 5 minutes.',
  codeExpired: {
    title: 'Oops',
    message: 'Verification code expired. Please request a new one.',
  },
  unknown: {
    title: 'Oops',
    message: 'Unknown error. Please try again later.',
  },
  invalidCode: {
    title: 'Oops',
    message: 'Invalid code.',
  },
  noCodeEmail: {
    title: 'Didn’t receive the verification code?',
    message:
      'Please check your spam or junk folder. If you still don’t see it, request a new code.',
  },
  verificationSuccess: {
    title: 'Verification Successful',
    message:
      'Your TickTalk Wireless account is ready. You can now track this request in My Requests.',
  },
  submissionFailed: {
    title: 'Submission Failed',
    message:
      'Please try again, or sign in next time with your TickTalk Wireless account to resubmit your request.',
  },
  cancelRmaReminder: {
    title: 'Reminder',
    message: 'Do you want to cancel this RMA request?',
  },
  accountExists: {
    title: 'Account already exists',
    message:
      'This email is already linked to a TickTalk Wireless account. Please sign in to continue.',
  },
} as const;
