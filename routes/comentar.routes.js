const express = require('express');
const comentarRoutes = express.Router();
const {authMiddleware} = require('../middlewares/authMiddleware');
const { createComentarById, deleteComentarById} = require('../controllers/comentar.controllers');

comentarRoutes.post('/:photoId/photo', authMiddleware, createComentarById);
comentarRoutes.delete('/:comentarId', authMiddleware, deleteComentarById);

module.exports = {comentarRoutes};