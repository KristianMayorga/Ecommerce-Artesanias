const express = require('express');
const router = express.Router();
const rolModel = require('../models/rolModel')


/**
 * @swagger
 * components:
 *  schemas:
 *     Rol:
 *          type: object
 *          properties:
 *              state:
 *                  type: Boolean
 *                  description: Estado del rol
 *              name:
 *                  type: String
 *                  description: Nombre del rol
 *          required:
 *              - name
 *          example:
 *              state: true
 *              name: Administrador
 * 
 */

/**
 * @swagger
 * /rol/add-rol:
 *  post:
 *      summary: Crear un nuevo rol
 *      tags: [Rol]
 *      requestBody:
 *          required: true
 *          content:
 *           application/json:
 *              schema:
 *                  type: object
 *                  $ref: '#/components/schemas/Rol'
 *      responses:
 *          201:
 *              description: Se creó el rol
 *          404:
 *              description: Error interno
 *                  
 * 
 */
router.post("/add-rol", rolModel.add_rol);

/**
 * @swagger
 * /rol/read-rol:
 *  get:
 *      summary: Todos los roles
 *      tags: [Rol]
 *      responses:
 *          200:
 *              description: Todos los roles
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Rol'
 * 
 *               
 *                  
 * 
 */
router.get("/read-rol", rolModel.read_rol);

/**
 * @swagger
 * /rol/read-rol/{id}:
 *  get:
 *      summary: Obtener un rol de usuario por ID
 *      tags: [Rol]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *                type: string
 *            required: true
 *            description: ID del rol del usuario a consultar
 *      responses:
 *          200:
 *              description: Rol de usuario encontrada exitosamente
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Rol'
 *          404:
 *              description: Rol de usuario no encontrada
 *          500:
 *              description: Error en el servidor
 */
router.get("/read-rol/:id", rolModel.read_rolById);

module.exports = router;