const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, badRequestMessage } = require("../utils/message");

const prisma = new PrismaClient();

// ADMIN - getAllUser
const getAllUserController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have permission to access this resource",
            },
          ],
        })
      );
    }

    const getAllUser = await prisma.user.findMany({
      where: {
        role: "USER",
      },
    });

    return res.status(200).send(successMessageWithData(getAllUser));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - deleteUser
const deleteUserController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { userId } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              message: "You don`t have permission to access this resource",
            },
          ],
        })
      );
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "USER",
      },
    });

    if (!findUser) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "User not found",
            },
          ],
        })
      );
    }

    const deleteUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).send(successMessageWithData(deleteUser));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - GET ALL FOTO
const getAllPhotoController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have access this resource",
            },
          ],
        })
      );
    }

    const allPhoto = await prisma.photo.findMany({
      include: {
        user: true
      }
    });

    return res.status(200).send(successMessageWithData(allPhoto));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - DELETE PHOTO
const deletePhotoController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { photoId } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have access this resouerce",
            },
          ],
        })
      );
    }

    const deletePhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
      },
      data: {
        isDeleted: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getAllUserController, deleteUserController, getAllPhotoController, deletePhotoController };
