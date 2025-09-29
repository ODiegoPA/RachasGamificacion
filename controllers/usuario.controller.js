const db = require("../models");

exports.register = async (req, res) => {
    try {
        const { nombres, apellidos, email, password  } = req.body;

        if (!nombres || !apellidos || !email || !password) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        const existingUser = await db.usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: "El usuario ya existe" });
        }

        const newUser = await db.usuario.create({ nombres, apellidos, email, password });
        const Racha = await db.racha.create({ usuarioId: newUser.id, dias: 0, puntos: 0, estaPrendida: true, fechaId: 1});
        return res.status(201).json({ msg: "Usuario registrado exitosamente", user: newUser });
    } catch (error) {
        console.error("Error en el registro de usuario:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};
exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email y contraseña son obligatorios" });
        }
        const user = await db.usuario.findOne({ where: { email } });
        if (!user || user.password !== password) {
            return res.status(401).json({ msg: "Credenciales inválidas" });
        }
        user.ultimoLogin = new Date();
        await user.save();
        return res.status(200).json({ msg: "Login exitoso", user });
    } catch (error) {
        console.error("Error en el login de usuario:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};