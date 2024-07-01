import * as uuid from 'uuid';
import * as crypto from 'crypto';
import dbClient from './db';
import redisClient from './redis';

/**
 * Create a uuid4 string and return it
 * @return {string}
 */
function addAccessToken() {
  return uuid.v4().toString();
}

/**
 * Validate the match between the hashed password and password
 * @param {string} password - the native password to validate it
 * @param {string} hashedPassword - the hashed password to check against
 * @return {boolean}
 */
async function validatePassword(password, hashedPassword) {
  try {
    const pwd = crypto.createHash('sha1').update(password).digest('hex');
    return pwd == hashedPassword; // eslint-disable-line
  } catch (error) {
    return false;
  }
}

/**
 * retrieve the user id from the auth token and return user
 * object from database based on this id
 * @param {string} token the authorization token string
 * @returns {Promise<object||null>} returns the user object or null if in error
 */
async function getUserFromToken(token) {
  try {
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getDoc('users', { _id: userId });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}
export {
  dbClient, redisClient, addAccessToken,
  validatePassword, getUserFromToken,
};
