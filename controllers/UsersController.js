/**
 * api users endpoints definitions
 */
import { dbClient } from '../utils/utils';

/**
  * api add new user endpoint
  * @param {Express.request} req - The request object
  * @param {Express.response} res - The response object
  * @return object with new user email and id
*/
export default async function postNew(req, res) {
  if (!dbClient.isAlive()) {
    res.status(500).json({ message: 'Can not connect to database' });
    return;
  }
  const { email, password } = req.body;
  if (email === undefined) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }

  if (password === undefined) {
    res.status(400).json({ error: 'Missing password' });
    return;
  }

  try {
    const result = await dbClient.addUser(email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
