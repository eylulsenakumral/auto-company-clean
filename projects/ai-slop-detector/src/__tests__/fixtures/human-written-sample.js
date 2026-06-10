/**
 * Authentication handler for user login
 * Validates credentials and issues JWT tokens
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from './models';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '24h';

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<{token: string, user: Object}>}
 */
export async function authenticateUser(email, password) {
  const user = await UserModel.findByEmail(email);

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return { token, user: sanitizeUser(user) };
}

function sanitizeUser(user) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
