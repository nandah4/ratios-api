const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, successCreateMessageWithData, badRequestMessage } = require("../utils/message");

const getAlbumsByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  const prisma = new PrismaClient();

  const albums = await prisma.album.findMany({
    where: {
      userId: parseToken.userId,
      isDeleted: false,
    },
  });

  return res.send(successMessageWithData(albums));
};

const getAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const { albumId } = req.params;

  const parseToken = verifyJwt(req.headers?.authorization);

  const prisma = new PrismaClient();

  const album = await prisma.album.findFirst({
    where: {
      id: albumId,
      userId: parseToken.userId,
      isDeleted: false,
    },
  });

  return res.send(successMessageWithData(album));
};

const createAlbumByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();
  const { title, description } = req.body;

  
  if (!title) {
    return res.send(badRequestMessage({
      messages: {
        message: "Title is required"
      }
    }))
  };
  
  const newAlbum = await prisma.album.create({
    data: {
      title: title,
      description: description,
      userId: parseToken.userId,
    },
  });

  return res.send(successCreateMessageWithData());
};

const updateAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId } = req.params;

  const dataUpdate = {};

  if (req.body?.title) {
    dataUpdate.title = req.body?.title;
  }

  if (req.body?.description) {
    dataUpdate.description = req.body?.description;
  }

  const prisma = new PrismaClient();

  const updateAlbum = prisma.album.update({
    where: {
      userId: parseToken.userId,
      id: albumId,
    },
    data: dataUpdate,
  });

  return res.send(successMessageWithData(updateAlbum));
};

const deleteAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId } = req.params;

  const prisma = new PrismaClient();

  const deleteAlbum = await prisma.album.update({
    where: {
      id: albumId,
    },
    data: {
      isDeleted: true,
    },
  });
};

module.exports = {
  getAlbumsByUserIdController,
  createAlbumByUserIdController,
  getAlbumByAlbumIdAndUserIdController,
  updateAlbumByUserIdController: updateAlbumByAlbumIdAndUserIdController,
  deleteAlbumByAlbumIdAndUserIdController,
};
