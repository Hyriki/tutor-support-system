// Dummy accounts for testing with different roles
export const DUMMY_ACCOUNTS = {
  student: {
    username: "student",
    email: "student@tutorconnect.com",
    password: "student123",
    role: "student",
    fullName: "John Student"
  },
  tutor: {
    username: "tutor",
    email: "tutor@tutorconnect.com",
    password: "tutor123",
    role: "tutor",
    fullName: "Jane Tutor"
  },
  admin: {
    username: "admin",
    email: "admin@tutorconnect.com",
    password: "admin123",
    role: "admin",
    fullName: "Admin User"
  }
};

// Get all accounts as an array
export const getAllAccounts = () => Object.values(DUMMY_ACCOUNTS);

// Find account by username or email
export const findAccount = (usernameOrEmail) => {
  return getAllAccounts().find(
    account =>
      account.username === usernameOrEmail ||
      account.email === usernameOrEmail
  );
};

// Check if credentials match any account
export const validateCredentials = (usernameOrEmail, password) => {
  const account = findAccount(usernameOrEmail);
  return account && account.password === password ? account : null;
};

// Check if username or email exists
export const accountExists = (usernameOrEmail) => {
  return findAccount(usernameOrEmail) !== undefined;
};

// Validate old password for any account
export const validateOldPassword = (usernameOrEmail, password) => {
  const account = findAccount(usernameOrEmail);
  return account && account.password === password;
};

// Get account by role
export const getAccountByRole = (role) => {
  return DUMMY_ACCOUNTS[role];
};
