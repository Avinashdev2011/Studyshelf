import posthog from "posthog-js";

posthog.init("phc_3kfgkf3DWYBNyPopj8wCwBiGBsjHTLslCYrcAPxR6lo", {
  api_host: "https://us.i.posthog.com",
  person_profiles: "identified_only",
});
export function trackLoginUser(uid, userEmail) {
  posthog.identify(uid, { email: userEmail });
}
export function trackUserLogout(email) {
  posthog.capture(`${email} logged out`, { type: "logout", email });
  posthog.reset();
}
export function resetPostHog() {
  posthog.reset();
}
export function trackClass(semester, division) {
  posthog.capture(`Entered ${semester}${division} class`, {
    type: "class",
    semester,
    division,
  });
}
export function trackSubjectPage(semester, division, subject) {
  posthog.capture(`Entered ${subject} page`, {
    type: "subject",
    semester,
    division,
    subject,
  });
}
export function trackPage(semester, division, page) {
  posthog.capture(`Entered ${page} page`, {
    type: "page",
    semester,
    division,
    page,
  });
}
export function trackSignup(email) {
  posthog.capture(`${email} signed up`, { type: "signup", email });
}
export function trackResetPassword(email) {
  posthog.capture(`${email} sent reset password email`, {
    type: "reset_password",
    email,
  });
}
export function trackEditEvent(semester, division, page, description) {
  posthog.capture(`Edited ${page}:${description}`, {
    type: "edit",
    semester,
    division,
    page,
    description,
  });
}
export function trackCreateEvent(semester, division, page, description) {
  posthog.capture(`Created ${page}:${description}`, {
    type: "create",
    semester,
    division,
    page,
    description,
  });
}
export function trackDeleteEvent(semester, division, page, description) {
  posthog.capture(`Deleted ${page}:${description}`, {
    type: "delete",
    semester,
    division,
    page,
    description,
  });
}
export function trackPfpChange(semester, division, description) {
  posthog.capture(`Event: ${description}`, {
    type: "PFP change",
    semester,
    division,
    description,
  });
}
export function trackAllowNotification(description) {
  posthog.capture(`Event: ${description}`, {
    type: "allowed notification",
    description,
  });
}
export function trackThemeChange(theme, semester, division) {
  posthog.capture(`Changed theme to ${theme}`, {
    type: "theme change",
    theme,
    semester,
    division,
  });
}
export function trackTimeTable(semester, division, description) {
  posthog.capture(`Event: ${description}`, {
    type: "timetable",
    semester,
    division,
    description,
  });
}
