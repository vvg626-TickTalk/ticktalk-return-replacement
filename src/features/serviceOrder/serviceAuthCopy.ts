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
      'If you did not receive the verification code email, please check your spam or junk folder.',
  },
  noCodePhone: {
    title: 'Didn’t receive the verification code?',
    message: 'Please double-check your country code and mobile number, then try again.',
  },
  verificationSuccess: {
    title: 'Verification Successful',
    message:
      'Sign in with your email or phone number next time to manage your RMA requests.',
  },
  submissionFailed: {
    title: 'Submission Failed',
    message: 'Please try again, or sign in next time to resubmit your request.',
  },
  cancelRmaReminder: {
    title: 'Reminder',
    message: 'Do you want to cancel this RMA request?',
  },
} as const;

export const SERVICE_ACCOUNT_FOOTNOTE =
  'This account is separate from your TickTalk App account.';

export const SERVICE_SIGN_IN_INTRO =
  'For your security, please sign in with the phone number or email you used last time.';
