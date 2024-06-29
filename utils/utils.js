import * as uuid from 'uuid';
import * as crypto from 'crypto';
import { dbClient } from './db';
import { redisClient } from './redis';

function addAccessToken() {
  /**
   * Create a uuid4 string and return it
   * @return {string}
   */
  return uuid.v4();
}

async function validatePassword(password, hashedPassword) {
  /**
   * Validate the match between the hashed password and password
   * @param {string} password - the native password to validate it
   * @param {string} hashedPassword - the hashed password to check against
   * @return {boolean}
   */
  try {
    const pwd = crypto.createHash('sha1').update(password).digest('hex');
    // console.log(hashedPassword);
    return pwd == hashedPassword; // eslint-disable-line
  } catch (error) {
    return false;
  }
}

module.exports = {
  dbClient, redisClient, addAccessToken, validatePassword,
};
