const express = require('express');
const router = express.Router();

module.exports = (config, sql) => {
    router.post('/api/vales/registraVale', async (req, res) => {
        const nuevoUsuario = req.body;

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

    router.get('/api/vales/inventory', async (req, res) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .query(`
        SELECT
            CAST(A.ActId AS VARCHAR) as aID,
            COALESCE(NULLIF(A.ActNoInv, ''), 'SIN DATOS') AS NoInventario,
            COALESCE(NULLIF(A.ActNombre, ''), 'SIN DATOS') AS Nombre,
            COALESCE(NULLIF(A.ActMarca, ''), 'SIN DATOS') AS Marca,
            COALESCE(NULLIF(A.ActModelo, ''), 'SIN DATOS') AS Modelo,
            COALESCE(NULLIF(A.ActSerie, ''), 'SIN DATOS') AS Serie,
            D.depdepto AS NombreDepartamento
        FROM
          Activos AS A
        INNER JOIN
          Departamentos AS D ON A.Depclave = D.Depclave;`);
            res.json(result.recordset);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });

    router.post('/api/vales/guardar', async (req, res) => {
        try {
            // Conecta a la base de datos
            await sql.connect(config);

            // Comienza una transacción
            const transaction = new sql.Transaction();
            await transaction.begin();

            try {
                // Inserta datos en ValesResguardo
                const valeData = req.body.vale;
                const resultVale = await transaction.request()
                    .query(`
            INSERT INTO ValesResguardo (fechaVale, ValeArea, ValeCentroTrabajo, ValeNombre, ValeCurp, ValeFechaElaboracion)
            OUTPUT INSERTED.ValeId
            VALUES ('${valeData.fecha}', '${valeData.area}', '${valeData.centroTrabajo}', '${valeData.nombre}', '${valeData.curp}', '${valeData.fechaElaboracion}');
          `);

                console.log("Result Vale:", resultVale);
                console.log("Recordset:", resultVale.recordset);

                // Obtiene el ID del vale insertado
                const valeId = resultVale.recordset[0].ValeId;

                // Inserta datos en ValesxActivos
                const activosSeleccionados = req.body.activosSeleccionados;
                for (const activoId of activosSeleccionados) {
                    await transaction.request()
                        .query(`
              INSERT INTO ValesxActivos (ValeId, ActId)
              VALUES (${valeId}, '${activoId}');
            `);
                }

                // Confirma la transacción
                await transaction.commit();

                // Envía una respuesta exitosa
                res.json({
                    success: true,
                    message: 'Vale guardado con éxito.'
                });
            } catch (error) {
                // Si hay un error, deshace la transacción
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            // Maneja los errores de la conexión a la base de datos
            console.error('Error al conectar a la base de datos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor.'
            });
        } finally {
            // Cierra la conexión a la base de datos
            sql.close();
        }
    });

    return router;
};