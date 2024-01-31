const express = require('express');
const router = express.Router();

module.exports = (config, sql) => {
    router.get('/api/users', async (req, res) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .query(`SELECT UsrId, UsrNombre, UsrCorreo, UsrTipo FROM usuarios;`);
            res.json(result.recordset);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });

    router.put('/api/users/actualizaTipoUsuario/:userId', async (req, res) => {
        const userId = req.params.userId;
        const nuevoTipo = req.body.UsrTipo;

        try {
            await sql.connect(config);

            const result = await sql.query `
        UPDATE usuarios
        SET UsrTipo = ${nuevoTipo}
        WHERE UsrId = ${userId};
      `;

            await sql.close();

            res.status(200).json({
                success: true,
                message: 'Tipo de usuario actualizado en SQL Server.'
            });
        } catch (error) {
            console.error('Error al actualizar el tipo de usuario en SQL Server:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el tipo de usuario en SQL Server.'
            });
        }
    });

    router.delete('/api/users/eliminarUsuario/:userId', async (req, res) => {
        const userId = req.params.userId;

        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .input('UserId', sql.Int, userId)
                .query('DELETE FROM usuarios WHERE UsrId = @UserId');

            res.status(200).json({
                success: true,
                message: 'Usuario eliminado correctamente.'
            });
        } catch (error) {
            console.error('Error al eliminar el usuario en SQL Server:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el usuario en SQL Server.'
            });
        }
    });

    router.post('/api/users/registraUsuario', async (req, res) => {
        const nuevoUsuario = req.body;

        console.log('Nuevo usuario recibido:', nuevoUsuario);

        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .input('nombre', sql.NVarChar, nuevoUsuario.nombre)
                .input('email', sql.VarChar, nuevoUsuario.email)
                .input('esAdmin', sql.Int, nuevoUsuario.esAdmin ? 1 : 0)
                .query(`
          INSERT INTO usuarios (UsrNombre, UsrCorreo, UsrTipo)
          VALUES (@nombre, @email, @esAdmin);
        `);

            console.log('Resultado de la inserción:', result);

            res.status(200).json({
                success: true,
                message: 'Usuario guardado en SQL Server.'
            });
        } catch (error) {
            console.error('Error al guardar el usuario en SQL Server:', error);
            res.status(500).json({
                success: false,
                message: 'Error al guardar el usuario en SQL Server.'
            });
        }
    });

    router.get('/api/users/validaTipo/:UsrCorreo', async (req, res) => {
        const {
            UsrCorreo
        } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .input('UsrCorreo', sql.VarChar, UsrCorreo)
                .query(`
                  SELECT 
                      UsrTipo
                  FROM usuarios
                  WHERE UsrCorreo = @UsrCorreo;
                `);

                console.log(result.recordset);

            if (result.recordset.length === 0) {
                res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            } else {
                res.json(result.recordset);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });
    return router;
};