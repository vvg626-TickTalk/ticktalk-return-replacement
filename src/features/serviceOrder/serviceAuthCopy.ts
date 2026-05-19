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
    message: 'Your account is ready. You can now track this request in My Requests.',
  },
  submissionFailed: {
    title: 'Submission Failed',
    message: 'Please try again, or sign in next time to resubmit your request.',
  },
  cancelRmaReminder: {
    title: 'Reminder',
    message: 'Do you want to cancel this RMA request?',
  },
  accountExists: {
    title: 'Account already exists',
    message:
      'This email is already linked to a Service Order account. Please sign in to continue.',
  },
} as const;

export const SERVICE_ACCOUNT_FOOTNOTE =
  'This account is separate from your TickTalk App account.';

export const SERVICE_SIGN_IN_INTRO =
  'Sign in with the email you used for your Service Order account.';

export const SERVICE_SIGN_UP_INTRO =
  'Create a Service Order account to track your return, replacement, or trade-in request. We’ll use this email to send updates, labels, and support messages.';
