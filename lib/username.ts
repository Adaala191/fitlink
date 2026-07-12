const reservedUsernames = [
  "admin",
  "api",
  "auth",
  "dashboard",
  "login",
  "logout",
  "signup",
  "register",
  "settings",
  "profile",
  "packages",
  "requests",
  "trainer",
  "trainers",
  "support",
  "help",
  "billing",
  "pricing",
  "about",
  "contact",
  "terms",
  "privacy",
  "fitlink",
  "www",
];

export function formatUsername(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

export function validateUsername(value: string) {
  const username = formatUsername(value);

  if (username.length < 3) {
    return {
      isValid: false,
      username,
      error: "Username must be at least 3 characters.",
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      username,
      error: "Username must be 30 characters or less.",
    };
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      username,
      error: "Username can only use letters, numbers, hyphens, and underscores.",
    };
  }

  if (
    username.startsWith("-") ||
    username.endsWith("-") ||
    username.startsWith("_") ||
    username.endsWith("_")
  ) {
    return {
      isValid: false,
      username,
      error: "Username cannot start or end with a hyphen or underscore.",
    };
  }

  if (
    username.includes("--") ||
    username.includes("__") ||
    username.includes("-_") ||
    username.includes("_-")
  ) {
    return {
      isValid: false,
      username,
      error: "Username cannot include repeated or mixed separators.",
    };
  }

  if (reservedUsernames.includes(username)) {
    return {
      isValid: false,
      username,
      error: "This username is reserved. Please choose another one.",
    };
  }

  return {
    isValid: true,
    username,
    error: "",
  };
}