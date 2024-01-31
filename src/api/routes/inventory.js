const express = require('express');
const router = express.Router();

module.exports = (config, sql) => {
  // Llena dataTable de activos en vista inventory
  router.get('/api/inventory', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .query(`SELECT 
                      A.ActId,
                      A.ActNombre,
                      A.ActCaracteristicas,
                      J.JefeNombre AS JefeDepartamento,
                      D.DepAlias AS NombreDepartamento
                  FROM Activos AS A
                  INNER JOIN Areas AS AR ON A.AreaId = AR.AreaId
                  INNER JOIN Departamentos AS D ON AR.Depclave = D.Depclave
                  LEFT JOIN Jefes AS J ON D.JefeId = J.JefeId;
                  ;`);
      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  // Inserta un nuevo activo en la base de datos
  router.post('/api/inventory/registra', async (req, res) => {
    const nuevoActivo = req.body;

    console.log('Nuevo activo recibido:', nuevoActivo);

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('ActIdSep', sql.VarChar, nuevoActivo.idSep)
        .input('ActNoInv', sql.VarChar, nuevoActivo.noInv)
        .input('ActNombre', sql.NVarChar, nuevoActivo.nombre)
        .input('ActCaracteristicas', sql.NVarChar, nuevoActivo.caracteristicas)
        .input('ActMarca', sql.NVarChar, nuevoActivo.marca)
        .input('ActModelo', sql.NVarChar, nuevoActivo.modelo)
        .input('ActSerie', sql.NVarChar, nuevoActivo.serie)
        .input('ActValor', sql.Decimal, nuevoActivo.valor)
        .input('ActCabm', sql.NVarChar, nuevoActivo.camb)
        .input('depclave', sql.Int, nuevoActivo.departamento)
        .input('AreaId', sql.Int, nuevoActivo.area)
        .input('ActObser', sql.NVarChar, nuevoActivo.observaciones)
        .query(`
          INSERT INTO Activos (ActIdSep, ActNoInv, ActNombre, ActCaracteristicas, ActMarca, ActModelo, ActSerie,
          ActValor, ActCabm, depclave, AreaId, ActObser)
          VALUES (@ActIdSep, @ActNoInv, @ActNombre, @ActCaracteristicas, @ActMarca, @ActModelo, @ActSerie,
          @ActValor, @ActCabm, @depclave, @AreaId, @ActObser);
        `);

      console.log('Resultado de la inserción:', result);

      res.json(result);
    } catch (error) {
      console.error(error);
      console.error('Error al registrar el activo:', error);
      res.status(500).send(`Error al registrar el activo: ${error.message}`);
    }
  });

  // Consulta datos de un activo por su ActId
  router.get('/api/inventory/:ActId', async (req, res) => {
    const {
      ActId
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('ActId', sql.Int, ActId)
        .query(`
          SELECT 
              ActIdSep,
              ActNoInv,
              ActNombre,
              ActCaracteristicas,
              ActMarca,
              ActModelo,
              ActSerie,
              ActValor,
              ActCabm,
              depclave,
              AreaId,
              ActObser
          FROM Activos
          WHERE ActId = @ActId;
        `);

      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  // Actualiza el activo seleccionado
  router.put('/api/inventory/actualizar/:ActId', async (req, res) => {
    const {
      ActId
    } = req.params;
    const nuevoActivo = req.body;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('ActIdSep', sql.VarChar, nuevoActivo.idSep)
        .input('ActNoInv', sql.VarChar, nuevoActivo.noInv)
        .input('ActNombre', sql.NVarChar, nuevoActivo.nombre)
        .input('ActCaracteristicas', sql.NVarChar, nuevoActivo.caracteristicas)
        .input('ActMarca', sql.NVarChar, nuevoActivo.marca)
        .input('ActModelo', sql.NVarChar, nuevoActivo.modelo)
        .input('ActSerie', sql.NVarChar, nuevoActivo.serie)
        .input('ActValor', sql.Decimal, nuevoActivo.valor)
        .input('ActCabm', sql.NVarChar, nuevoActivo.camb)
        .input('depclave', sql.Int, nuevoActivo.departamento)
        .input('AreaId', sql.Int, nuevoActivo.area)
        .input('ActObser', sql.NVarChar, nuevoActivo.observaciones)
        .input('ActId', sql.Int, ActId)
        .query(`
          UPDATE Activos
          SET
            ActIdSep = @ActIdSep,
            ActNoInv = @ActNoInv,
            ActNombre = @ActNombre,
            ActCaracteristicas = @ActCaracteristicas,
            ActMarca = @ActMarca,
            ActModelo = @ActModelo,
            ActSerie = @ActSerie,
            ActValor = @ActValor,
            ActCabm = @ActCabm,
            depclave = @depclave,
            AreaId = @AreaId,
            ActObser = @ActObser
          WHERE ActId = @ActId;
        `);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al actualizar el activo: ${error.message}`);
    }
  });

  // Elimina activos por su ActId
  router.delete('/api/inventory/eliminar/:ActId', async (req, res) => {
    const {
      ActId
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('ActId', sql.Int, ActId)
        .query('DELETE FROM Activos WHERE ActId = @ActId');

      console.log(`Activo eliminado con éxito. ActId: ${ActId}`);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al eliminar el activo: ${error.message}`);
    }
  });

  return router;
};