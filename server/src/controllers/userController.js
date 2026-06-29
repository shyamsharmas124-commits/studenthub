const prisma = require("../utils/prisma");

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
        phone: true,
        role: true,
        createdAt: true,
        rewards: true,
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.setRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['STUDENT', 'TEACHER'].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { role }
    });

    res.json(user);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, username, bio, avatar, phone } = req.body;

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
        ...(phone && { phone }),
      }
    });

    res.json(user);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


