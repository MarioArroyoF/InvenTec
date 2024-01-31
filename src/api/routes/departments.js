const express = require('express');
const router = express.Router();

module.exports = (config, sql) => {
  router.get('/api/departments', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .query(`SELECT
            CAST(D.Depclave AS VARCHAR) AS ID,
            D.Depdepto AS Departamento,
          COALESCE(J.JefeNombre, 'SIN ENCARGADO') AS NombreEncargado
      FROM Departamentos AS D
      LEFT JOIN Jefes AS J ON D.JefeId = J.JefeId;`);
      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  router.post('/api/departments/registraDepto', async (req, res) => {
    const nuevoDepartamento = req.body;

    console.log('Nuevo depto recibido:', nuevoDepartamento);

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('depdepto', sql.NVarChar, nuevoDepartamento.depdepto)
        .input('depalias', sql.VarChar, nuevoDepartamento.depalias)
        .query(`
        INSERT INTO departamentos (depdepto, depalias)
        VALUES (@depdepto, @depalias);
      `);

      console.log('Resultado de la inserción:', result);

      res.status(200).json({
        success: true,
        message: 'Depto guardado en SQL Server.'
      });
    } catch (error) {
      console.error('Error al guardar el depto en SQL Server:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar el depto en SQL Server.'
      });
    }
  });

  router.post('/api/jefes/registraJefe', async (req, res) => {
    const nuevoJefe = req.body;

    console.log('Nuevo jefe recibido:', nuevoJefe);

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('jefeNombre', sql.NVarChar, nuevoJefe.jefenombre)
        .input('jefetipo_desc', sql.Bit, nuevoJefe.jefetipo_desc)
        .input('departamento', sql.Int, nuevoJefe.departamento)
        .query(`
      INSERT INTO jefes (jefeNombre, jefeTipo, depClave) 
        VALUES (@jefeNombre, @jefetipo_desc, @departamento);
      `);

      console.log('Resultado de la inserción:', result);

      res.status(200).json({
        success: true,
        message: 'Jefe guardado en SQL Server.'
      });
    } catch (error) {
      console.error('Error al guardar el jefe en SQL Server:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar el jefe en SQL Server.'
      });
    }
  });

  router.post('/api/areas/registraArea', async (req, res) => {
    const nuevaArea = req.body;

    console.log('Nuevo area recibida:', nuevaArea);

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('areanombre', sql.NVarChar, nuevaArea.areanombre)
        .input('jefeid', sql.Int, nuevaArea.jefenombre)
        .input('depclave', sql.Int, nuevaArea.depdepto)
        .query(`
      INSERT INTO areas (areanombre, jefeid, depclave) 
        VALUES (@areanombre, @jefeid, @depclave);
      `);

      console.log('Resultado de la inserción:', result);

      res.status(200).json({
        success: true,
        message: 'Area guardado en SQL Server.'
      });
    } catch (error) {
      console.error('Error al guardar el area en SQL Server:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar el area en SQL Server.'
      });
    }
  });

  // Consulta datos de un departamento por depclave
  router.get('/api/departments/:depClave', async (req, res) => {
    const {
      depClave
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('depClave', sql.Int, depClave)
        .query(`
      SELECT
            CAST(D.Depclave AS VARCHAR) AS Depclave,
            D.Depdepto,
            D.Depalias,
          COALESCE(J.JefeNombre, 'SIN ENCARGADO') AS nombreEncargado
      FROM Departamentos AS D
      LEFT JOIN Jefes AS J ON D.JefeId = J.JefeId
      WHERE D.Depclave = @depclave;
      `);

      console.log('Resultado de la consulta:', result);

      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  // Consulta datos de un jefe por su jefeid
  router.get('/api/jefes/:jefeid', async (req, res) => {
    const {
      jefeid
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('jefeid', sql.Int, jefeid)
        .query(`
      SELECT 
        J.jefeid,
        J.jefenombre,
        J.jefetipo,
        D.Depdepto AS departamento,
        D.depclave
      FROM jefes J
      JOIN departamentos D ON J.depclave = D.depclave
      WHERE J.jefeid = @jefeid;
      `);
      console.log('Resultado de la consulta:', result);
      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  // Consulta datos de un área por areaid
  router.get('/api/areas/:areaid', async (req, res) => {
    const {
      areaid
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('areaid', sql.Int, areaid)
        .query(`
      SELECT 
        A.areaid,
        A.areanombre,
        J.jefenombre,
        D.depdepto,
        D.depclave,
        J.jefeid
      FROM areas A
      JOIN jefes J ON A.jefeid = J.jefeid
      JOIN departamentos D ON A.depclave = D.depclave
      WHERE areaid = @areaid;
      `);

      console.log('Resultado de la consulta:', result);

      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  router.get('/api/jefes', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .query(`
      SELECT 
      CAST(J.jefeid AS VARCHAR) as jefeid,
        J.jefenombre,
        CASE 
          WHEN J.jefetipo = 1 THEN 'Jefe departamento'
          ELSE 'Jefe área'
        END AS jefetipo_desc,
        D.Depdepto AS departamento
      FROM jefes J
      JOIN departamentos D ON J.depclave = D.depclave;
      `);
      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  router.get('/api/areas', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .query(`
        SELECT 
          A.areaid,
          A.areanombre,
          J.jefenombre,
          D.depdepto
        FROM areas A
        JOIN jefes J ON A.jefeid = J.jefeid
        JOIN departamentos D ON A.depclave = D.depclave;
      `);
      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  // Trae las áreas para el comboBox  
  router.get('/api/combo/areas', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .query(`SELECT areaid, areanombre, depclave FROM areas;`);
      res.json(result.recordset);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error en el servidor: ${error.message}`);
    }
  });

  router.put('/api/departments/setDepto/:depclave', async (req, res) => {
    const {
      depclave
    } = req.params;
    const nuevoDepartamento = req.body;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('depdepto', sql.VarChar, nuevoDepartamento.depdepto)
        .input('depalias', sql.VarChar, nuevoDepartamento.depalias)
        .input('depclave', sql.Int, depclave)
        .query(`
          UPDATE departamentos
          SET
            depdepto = @depdepto,
            depalias = @depalias
          WHERE depclave = @depclave;
        `);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al actualizar el depto: ${error.message}`);
    }
  });

  router.delete('/api/departments/eliminar/:depclave', async (req, res) => {
    const {
      depclave
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('depclave', sql.Int, depclave)
        .query('DELETE FROM departamentos WHERE depclave = @depclave');

      console.log(`Depto eliminado con éxito. depclave: ${depclave}`);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al eliminar el Depto: ${error.message}`);
    }
  });

  router.put('/api/departments/setJefe/:jefeid', async (req, res) => {
    const {
      jefeid
    } = req.params;
    const nuevoJefe = req.body;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('jefenombre', sql.VarChar, nuevoJefe.jefenombre)
        .input('depclave', sql.Int, nuevoJefe.depclave)
        .input('jefetipo', sql.Bit, nuevoJefe.jefetipo_desc)
        .input('jefeid', sql.Int, jefeid)
        .query(`
          UPDATE jefes
          SET
          jefenombre = @jefenombre,
          depclave = @depclave, 
          jefetipo = @jefetipo
          WHERE jefeid = @jefeid;
        `);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al actualizar el jefe: ${error.message}`);
    }
  });

  router.delete('/api/jefes/eliminar/:jefeid', async (req, res) => {
    const {
      jefeid
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('jefeid', sql.Int, jefeid)
        .query('DELETE FROM jefes WHERE jefeid = @jefeid');

      console.log(`Jefe eliminado con éxito. jefeid: ${jefeid}`);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al eliminar el Depto: ${error.message}`);
    }
  });

  router.delete('/api/areas/eliminar/:areaid', async (req, res) => {
    const {
      areaid
    } = req.params;

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('areaid', sql.Int, areaid)
        .query('DELETE FROM areas WHERE areaid = @areaid');

      console.log(`Depto eliminado con éxito. areaid: ${areaid}`);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al eliminar el area: ${error.message}`);
    }
  });

  router.put('/api/departments/setArea/:areaid', async (req, res) => {
    const {
      areaid
    } = req.params;
    const nuevaArea = req.body;
    const jefeId = nuevaArea.jefenombre.jefeid === undefined ?
      nuevaArea.jefenombre :
      nuevaArea.jefenombre.jefeid;

    const depclave = nuevaArea.depdepto.depclave === undefined ?
      nuevaArea.depdepto :
      nuevaArea.depdepto.depclave;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input('areanombre', sql.VarChar, nuevaArea.areanombre)
        .input('jefeid', sql.Int, jefeId)
        .input('depclave', sql.Int, depclave)
        .input('areaid', sql.Int, areaid)
        .query(`
          UPDATE areas
          SET
          areanombre = @areanombre,
          jefeid = @jefeid, 
          depclave = @depclave
          WHERE areaid = @areaid;
        `);

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error al actualizar el area: ${error.message}`);
    }
  });

  return router;
};