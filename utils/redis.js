/**
 * redis utility class that abstract the operations
 * on redis database
 */

import { createClient } from 'redis';

class RedisClient {
  /**
   * a class the abstract the operations on redis database
   */
  constructor() {
    /**
     * construct the redis client for the class
     * handle any connection error and log it
     */
    this.client = createClient().on('failure', (error) => {
      console.log(error.message);
    });
  }

  isAlive() {
    /**
     * isAlive check if the connection to redis server is a live
     * @returns {boolean} true if the connection is a live false other wise
     */
    return !(this.client === undefined);
  }

  async get(key) {
    /**
     * query the redis database for the key and returns it's value if available
     * @param {string} key - the key to fetch from redis
     * @returns {string} the value of the key or undefined if it's not available
     */
    return new Promise((resolve, reject) => {
      this.client.get(`${key}`, (error, result) => {
        if (error) {
          reject(error.message);
        }
        resolve(result);
      });
    });
  }

  async set(key, value, ttl) {
    /**
     * set a new key on redis with the value value for ttl seconds
     * @param {string} key - the key to save on redis
     * @param {any} value - value of the key
     * @param {number} ttl - the amount of time to live seconds
     */
    // return Promise.resolve(
    //   this.client.
    // );
    return this.client.setex(`${key}`, ttl, JSON.stringify(value));
  }

  async del(key) {
    /**
     * delete the key 'key' from redis database
     * @param {string} key - the key to delete from redis
     */
    // return Promise.resolve(this.client.del(key));
    return this.client.del(key);
  }
}

export const redisClient = new RedisClient(); // eslint-disable-line
