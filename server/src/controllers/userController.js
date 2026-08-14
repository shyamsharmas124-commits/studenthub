const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");

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
        teachingTopics: true,
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
    const { name, username, bio, avatar, phone, teachingTopics } = req.body;

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    if (teachingTopics && !Array.isArray(teachingTopics)) {
      return res.status(400).json({ msg: "teachingTopics must be an array of strings" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(bio && { bio }),
        ...(avatar && { avatar }),
        ...(phone && { phone }),
        ...(teachingTopics && {
          teachingTopics: teachingTopics
            .map((t) => String(t).trim())
            .filter(Boolean),
        }),
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Changing email requires the current password, since email doubles as the login identifier
exports.updateEmail = async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({ msg: "New email and current password are required" });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) {
      return res.status(400).json({ msg: "Please provide a valid email address" });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const validPassword = await bcrypt.compare(currentPassword, currentUser.password);
    if (!validPassword) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existingEmail && existingEmail.id !== req.user.userId) {
      return res.status(400).json({ msg: "Email is already in use" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { email: newEmail },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Current and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "New password must be at least 8 characters" });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const validPassword = await bcrypt.compare(currentPassword, currentUser.password);
    if (!validPassword) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    const sameAsOld = await bcrypt.compare(newPassword, currentUser.password);
    if (sameAsOld) {
      return res.status(400).json({ msg: "New password must be different from the current password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashed },
    });

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


