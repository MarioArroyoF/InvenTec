const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Papa = require('papaparse');

module.exports = (config, sql) => {
    // Activos por departamento
    router.get('/api/reportes/activosPorDepto/:depclave', async (req, res) => {
        const {
            depclave
        } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .input('depclave', sql.Int, depclave)
                .query(`
          SELECT 
            a.ActId, 
            a.ActCaracteristicas, 
            a.ActMarca, 
            a.ActModelo, 
            a.ActValor, 
            a.ActCabm, 
            a.ActNombre, 
            d.depdepto, 
            j.jefenombre,
            b.areanombre,
            CONVERT(DATE, a.ActFechaAlta) AS FechaAlta
          FROM 
            Activos a
            JOIN Departamentos d ON a.depclave = d.depclave
            JOIN Areas b ON a.areaid = b.areaid
            JOIN jefes j ON d.jefeid = j.jefeid
          WHERE 
            a.depclave = @depclave
          ORDER BY 
            b.areanombre;
        `);

            res.json(result.recordset);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });

    // Total de activos por departamento
    router.get('/api/reportes/totalActivosPorDepto', async (req, res) => {
        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .query(`
          SELECT 
            d.depdepto, 
            COUNT(*) as activos
          FROM 
            activos a
            JOIN Departamentos d ON a.depclave = d.depclave
          GROUP BY 
            d.depdepto
          ORDER BY 
            activos DESC;
        `);

            res.json(result.recordset);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });

    // Inventario por departamento y fecha
    router.get('/api/reportes/inventarioPorDeptoFecha/:depclave/:selectedDate', async (req, res) => {
        const {
            depclave,
            selectedDate
        } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .input('depclave', sql.Int, depclave)
                .input('selectedDate', sql.VarChar, selectedDate) // Ajusta el tipo de dato según el tipo real de la columna EscFecha
                .query(`
            SELECT
            d.areanombre,
            COUNT(DISTINCT a.actid) AS activos,
            COUNT(DISTINCT e.actid) AS escaneado
        FROM
            areas d
        LEFT JOIN
            activos a ON a.areaid = d.areaid
        LEFT JOIN
            Escaneo e ON a.actid = e.actid AND CONVERT(DATE, e.EscFecha) = @selectedDate
        WHERE
            a.depclave =  @depclave
        GROUP BY
            d.areanombre;
        `);

            res.json(result.recordset);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });

    // Detalle de inventario
    router.get('/api/reportes/detalleInventario/:depclave/:selectedDate', async (req, res) => {
        const {
            depclave,
            selectedDate
        } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .input('depclave', sql.Int, depclave)
                .input('selectedDate', sql.VarChar, selectedDate)
                .query(`
                SELECT
                    a.ActId,
                    a.ActNombre,
                    a.ActCaracteristicas,
                    d.depdepto,
                    ar.areanombre,
                    CASE WHEN e.actid IS NOT NULL THEN 'Inventariado' ELSE 'NO INVENTARIADO' END AS EstadoEscaneo
                FROM
                    Activos a
                JOIN
                    Departamentos d ON a.depclave = d.depclave
                JOIN
                    Areas ar ON a.areaid = ar.areaid
                LEFT JOIN
                    Escaneo e ON a.actid = e.actid AND CONVERT(DATE, e.EscFecha) = @selectedDate
                WHERE
                    a.depclave = @depclave
                ORDER BY
                    ar.areanombre, a.ActId;
            `);

            res.json(result.recordset);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });

    // Impresiones por departamento
    router.get('/api/reportes/impresionesPorDepto/:depclave', async (req, res) => {
        const {
            depclave
        } = req.params;

        try {
            const pool = await sql.connect(config);
            const result = await pool
                .request()
                .input('depclave', sql.Int, depclave)
                .query(`
          SELECT 
            a.ActId, 
            a.ActNombre,
            a.ActCaracteristicas, 
            d.depdepto, 
            b.areanombre,
            COUNT(i.ActId) AS CantidadImpresiones
          FROM 
            Activos a
            JOIN Departamentos d ON a.depclave = d.depclave
            JOIN Areas b ON a.areaid = b.areaid
            LEFT JOIN Impresiones i ON i.ActId = a.ActId
          WHERE 
            a.depclave = @depclave
          GROUP BY 
            a.ActId, 
            a.ActNombre,
            a.ActCaracteristicas, 
            d.depdepto, 
            b.areanombre
          ORDER BY
            b.areanombre,
            CantidadImpresiones DESC;
        `);

            res.json(result.recordset);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error en el servidor: ${error.message}`);
        }
    });

    const storage = multer.memoryStorage();
    const upload = multer({
        storage: storage
    });

    router.post('/api/subirArchivo', upload.single('archivo'), async (req, res) => {
        try {
            // Parsea el archivo CSV o TXT
            const parsedData = await parseCSV(req.file.buffer.toString());

            console.log('Datos del archivo:', parsedData);

            // Inserta los datos en la tabla SQL
            await insertarDatosEnSQL(parsedData);

            res.status(200).json({
                mensaje: 'Archivo subido y datos insertados correctamente.'
            });
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            res.status(500).json({
                mensaje: 'Error al subir el archivo.'
            });
        }
    });

    async function parseCSV(csvData) {
        return new Promise((resolve, reject) => {
            const results = [];
            Papa.parse(csvData, {
                header: false,
                skipEmptyLines: true,
                transform: (value) => value.trim(), // Trim values to remove extra whitespace
                complete: (result) => {
                    const flattenedData = result.data.map(row => Object.values(row).join(','));
                    resolve(flattenedData);
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    }

    async function insertarDatosEnSQL(data) {
        try {
            const pool = await sql.connect(config);

            for (const row of data) {
                const values = row.split(',').map(value => value.trim());

                for (const value of values) {
                    if (value) {
                        const request = pool.request();
                        // Asegúrate de ajustar estos campos y el nombre de la tabla según tu esquema
                        await request.query(`
                        INSERT INTO Escaneo (ActId, EscFecha)
                        VALUES ('${value}', GETDATE());
                    `);
                    }
                }
            }
        } catch (error) {
            throw error;
        }
    }


    return router;
};