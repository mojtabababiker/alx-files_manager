/**
 * api general endpoints definitions
 */
// import { dbClient } from '../utils/db';
// import { redisClient } from '../utils/redis';
import { dbClient, redisClient } from '../utils/utils';

/**
 * api get status endpoint
 * @param {Express.request} req - The request object
 * @param {Express.response} res - The response object
 * @returns {Response} json object indicates the status of the redis and db connection
 */
export function getStatus(req, res) {
  const status = {
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  };
  res.json(status);
}

/**
 * api get statistics about the db collection
 * @param {Express.request} req - The request object
 * @param {Express.response} res - The response object
 * @returns {Response} json object indicates the stats of the db collection
 */
export async function getStats(req, res) {
  const stats = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };
  res.json(stats);
}
