/**
 * redis utility class that abstract the operations
 * on redis database
 */
import { createClient } from 'redis';

/**
 * a class the abstract the operations on redis database
 */
class RedisClient {
  /**
   * construct the redis client for the class
   * handle any connection error and log it
   */
  constructor() {
    this.client = createClient();
    this.client.on('error', (error) => {
      console.log(error.message);
    });
  }

  /**
   * isAlive check if the connection to redis server is a live
   * @returns {boolean} true if the connection is a live false other wise
   */
  isAlive() {
    return (this.client.connected);
  }

  /**
   * query the redis database for the key and returns it's value if available
   * @param {string} key - the key to fetch from redis
   * @returns {string} the value of the key or undefined if it's not available
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(`${key}`, (error, result) => {
        if (error) {
          reject(error.message);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * set a new key on redis with the value value for ttl seconds
   * @param {string} key - the key to save on redis
   * @param {any} value - value of the key
   * @param {number} duration - the amount of time to live seconds
   */
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(`${key}`, duration, value, (error, result) => {
        if (error) {
          reject(error.message);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * delete the key 'key' from redis database
   * @param {string} key - the key to delete from redis
   */
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, result) => {
        if (error) {
          reject(error.message);
          return;
        }
        resolve(result);
      });
    });
  }
}

const redisClient = new RedisClient();

export default redisClient;
