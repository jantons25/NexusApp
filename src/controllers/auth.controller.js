import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createdAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
  const { username, password, name, role } = req.body;

  try {
    const userFound = await User.findOne({ username });
    if (userFound) return res.status(400).json(["Usuario ya existe"]);

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: passwordHash,
      name: name || "",
      role: "user", // Siempre "user" por seguridad — cambiar rol solo vía updateUser con permisos
      status: "active",
    });

    const userSave = await newUser.save();
    const token = await createdAccessToken({ id: userSave._id });

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000 // 1 día en milisegundos
});
    res.json({
      id: userSave._id,
      username: userSave.username,
      name: userSave.name,
      role: userSave.role,
      createdAt: userSave.createdAt,
      updatedAt: userSave.updatedAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al registrar el usuario", error: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userFound = await User.findOne({ username });
    if (!userFound)
      return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = await createdAccessToken({ id: userFound._id });

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000 // 1 día en milisegundos
});
    res.json({
      id: userFound._id,
      username: userFound.username,
      name: userFound.name,
      role: userFound.role,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al iniciar sesión", error: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
});
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id);

    if (!userFound)
      return res.status(400).json({ message: "Usuario no encontrado" });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      name: userFound.name,
      role: userFound.role,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener perfil", error: error.message });
  }
};

export const verifyTokenRequest = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "No autorizado" });
  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "No autorizado" });
    const userFound = await User.findById(user.id);
    if (!userFound)
      return res.status(401).json({ message: "Usuario no encontrado" });
    return res.json({
      id: userFound._id,
      username: userFound.username,
      name: userFound.name,
      role: userFound.role,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  });
};

export const getUsers = async (req, res) => {
  const users = await User.find().select(
    "username name role status createdAt updatedAt"
  );
  res.json(users);
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    return res
      .status(200)
      .json({ message: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    return res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { password, username, name, role, status } = req.body;

  try {
    // Whitelist de campos permitidos para evitar mass-assignment
    const updateFields = {};
    if (username) updateFields.username = username;
    if (name !== undefined) updateFields.name = name;
    // Solo permitir cambio de role/status (idealmente verificar que req.user sea admin)
    if (role && ["user", "admin"].includes(role)) updateFields.role = role;
    if (status && ["active", "inactive"].includes(status)) updateFields.status = status;

    // Si viene una contraseña nueva, hashearla
    if (password && password.trim() !== "") {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    // Actualizar el usuario con los campos permitidos
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};
