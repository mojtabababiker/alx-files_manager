/**
 * api general endpoints definitions
 */
// import { dbClient } from '../utils/db';
// import { redisClient } from '../utils/redis';
import { dbClient, redisClient } from '../utils/utils';

export function getStatus(req, res) {
  /**
   * api get status endpoint
   * @param {Express.request} req - The request object
   * @param {Express.response} res - The response object
   * @returns {Response} json object indicates the status of the redis and db connection
   */

  const status = {
    redis: dbClient.isAlive(),
    db: redisClient.isAlive(),
  };
  res.json(status);
}

export function getStats(req, res) {
  /**
   * api get statistics about the db collection
   * @param {Express.request} req - The request object
   * @param {Express.response} res - The response object
   * @returns {Response} json object indicates the stats of the db collection
   */
  const stats = {
    users: 0,
    files: 0,
  };
  dbClient.nbUsers()
    .then((value) => {
      stats.users = value;
    })
    .then(() => {
      dbClient.nbFiles()
        .then((value) => {
          stats.files = value;
        });
    })
    .finally(() => {
      res.json(stats);
    });
}
