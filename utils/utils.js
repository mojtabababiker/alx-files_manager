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

export {
  dbClient, redisClient, addAccessToken, validatePassword,
};
