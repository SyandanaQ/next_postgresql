import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;
  const userId = Number(id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
  } else if (req.method === 'PUT') {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ error: 'At least one field (name or email) required to update' });
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({ where: { id: userId } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
