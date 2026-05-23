import bcrypt from "bcryptjs";
import { User } from "./user.model.js";

function serializeUser(user, includePassword = false) {
  if (!user) return null;
  const plain = user.get({ plain: true });
  const result = {
    id: Number(plain.id),
    name: plain.name,
    email: plain.email,
    createdAt: plain.createdAt
  };

  if (includePassword) result.passwordHash = plain.passwordHash;
  return result;
}

export class UserRepository {
  async createUser({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    return serializeUser(user);
  }

  async findUserByEmail(email) {
    const user = await User.findOne({ where: { email } });
    return serializeUser(user, true);
  }

  async findUserById(id) {
    const user = await User.findByPk(id);
    return serializeUser(user);
  }
}

export const userRepository = new UserRepository();
