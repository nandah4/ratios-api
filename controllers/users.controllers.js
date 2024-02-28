const { PrismaClient } = require("@prisma/client");
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { signJwt, verifyJwt } = require("../utils/jwt");
const { hashPassword, matchPassword } = require("../utils/password");
const { ENV_PORT } = require("../environtment");
const { text } = require("body-parser");

const prisma = new PrismaClient();

// USER - login controllers
async function loginController(req, res) {
  try {
    const email = req.body?.email;
    const password = req.body?.password;

    const error = [];
    if (!email) {
      error.push({
        field: "email",
        message: "email kosong",
      });
    }

    if (!password) {
      error.push({
        field: "password",
        message: "password kosong",
      });
    }

    if (error.length !== 0) {
      return res.status(400).send(
        badRequestMessage({
          messages: [...error],
        })
      );
    }
    const prisma = new PrismaClient();

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        role: "USER",
      },
    });

    if (!user) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              email: "email",
              message:
                "Email not found. Please double-check your email address or consider signing up if you don't have an account.",
            },
          ],
        })
      );
    }

    if(user.isDeleted) {
      return res.status(403).send(badRequestMessage({
        messages: [
          {
            field: "userId",
            message: "Account not found"
          }
        ]
      }))
    }

    const isPasswordValid = await matchPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send(
        badRequestMessage({
          messages: [
            {
              field: "password",
              message:
                "The password is not valid. Make sure your password meets the specified requirements",
            },
          ],
        })
      );
    }
    const dataLogin = {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        address: user.address,
        photoUrl: user.photoUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
        isDeleted: user.isDeleted
      },
      token: signJwt(user.id),
    };

    return res.status(200).send(successMessageWithData(dataLogin));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message: "Internal server error",
          },
        ],
      })
    );
  }
}

// USER/GUEST - register controllers
// async function registerController(req, res) {
//   try {
//     const username = req.body?.username;
//     const fullname = req.body?.fullname;
//     const password = req.body?.password;
//     const confirmPassword = req.body?.confirmPassword;
//     const email = req.body?.email;
//     const address = req.body?.address;

//     const error = [];

//     if (!username) {
//       error.push({
//         field: "username",
//         message: "username can not be empty",
//       });
//     }
//     if (!fullname) {
//       error.push({
//         field: "fullName",
//         message: "fullName can not be empty",
//       });
//     }
//     if (!password) {
//       error.push({
//         field: "password",
//         message: "password can not be empty",
//       });
//     }
//     if (!confirmPassword) {
//       error.push({
//         field: "confirm password",
//         message: "confirm password can not be empty",
//       });
//     }
//     if (!email) {
//       error.push({
//         field: "email",
//         message: "email can not be empty",
//       });
//     }
//     if (!address) {
//       error.push({
//         field: "addres",
//         message: "addrres can not be empty",
//       });
//     }

//     const passwordRegex = /^.{8,}$/;
//     if (!passwordRegex.test(password)) {
//       error.push({
//         field: "password",
//         message: "Input password minimum 8 character",
//       });
//     }

//     if (error.length !== 0) {
//       return res.status(400).send(
//         badRequestMessage({
//           messages: [...error],
//         })
//       );
//     }

//     const usernameRegex = /^[a-zA-Z0-9_-]+$/;
//     if (!usernameRegex.test(username)) {
//       return res.status(400).send(
//         badRequestMessage({
//           messages: [
//             {
//               field: "username",
//               message: "Username can only contain letters, numbers, underscores, and hyphens.",
//             },
//           ],
//         })
//       );
//     }

//     if (confirmPassword !== password) {
//       return res.status(400).send(
//         badRequestMessage({
//           messages: [
//             {
//               field: "Password and confirmation password",
//               message: "Password and confirmation do not match.",
//             },
//           ],
//         })
//       );
//     }

//     const prisma = new PrismaClient();

//     const check = await prisma.user.findMany({
//       where: {
//         OR: [
//           {
//             username: username,
//           },
//           {
//             email: email,
//           },
//         ],
//       },
//     });

//     if (check) {
//       check.map((item) => {
//         if (item.email === email && item.username === username) {
//           return res.status(400).send(
//             badRequestMessage({
//               messages: [
//                 {
//                   field: "email",
//                   message: "Email address is already in use",
//                 },
//                 {
//                   field: "username",
//                   message: "Username address is already in use",
//                 },
//               ],
//             })
//           );
//         }

//         if (item.email === email) {
//           return res.status(400).send(
//             badRequestMessage({
//               messages: [
//                 {
//                   field: "email",
//                   message: "Email address is already in use",
//                 },
//               ],
//             })
//           );
//         }

//         if (item.username === username) {
//           return res.status(400).send(
//             badRequestMessage({
//               messages: [
//                 {
//                   field: "username",
//                   message: "Username address is already in use",
//                 },
//               ],
//             })
//           );
//         }
//       });
//     }

//     const hashUserPassword = await hashPassword(password);

//     const newUser = await prisma.user.create({
//       data: {
//         username: username,
//         fullName: fullname,
//         password: hashUserPassword,
//         email: email,
//         address: address,
//         photoUrl: "default-profile.jpeg",
//       },
//     });

//     const newUserPassword = { ...newUser };
//     delete newUserPassword.password;

//     return res.status(200).send(successMessageWithData(newUserPassword));
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send(
//       badRequestMessage({
//         messages: {
//           message: "Internal server error",
//         },
//       })
//     );
//   }
// }
async function registerController(req, res) {
  try {
    const { username, fullname, password, confirmPassword, email, address } = req.body;

    const error = [];

    // Validasi data yang diterima dari request
    if (!username) {
      error.push({ field: "username", message: "Username cannot be empty" });
    }
    if (!fullname) {
      error.push({ field: "fullname", message: "Fullname cannot be empty" });
    }
    if (!password) {
      error.push({ field: "password", message: "Password cannot be empty" });
    }
    if (!confirmPassword) {
      error.push({ field: "confirmPassword", message: "Confirm password cannot be empty" });
    }
    if (!email) {
      error.push({ field: "email", message: "Email cannot be empty" });
    }
    if (!address) {
      error.push({ field: "address", message: "Address cannot be empty" });
    }
    if (password !== confirmPassword) {
      error.push({
        field: "confirmPassword",
        message: "Password and confirm password do not match",
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      error.push({
        field: "username",
        message: "Username can only contain letters, numbers, underscores, and hyphens.",
      });
    }

    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(password)) {
      error.push({
        field: "password",
        message: "Input password minimum 8 character",
      });
    }

    if (error.length > 0) {
      return res.status(400).send(badRequestMessage({ error }));
    }

    // Check if username or email already exists
    const prisma = new PrismaClient();
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        error.push({ field: "username", message: "Username is already in use" });
      }
      if (existingUser.email === email) {
        error.push({ field: "email", message: "Email is already in use" });
      }
      return res.status(400).send(badRequestMessage({ error }));
    }

    // Hash password
    const hashUserPassword = await hashPassword(password);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        fullName: fullname,
        password: hashUserPassword,
        email,
        address,
        photoUrl: "default-profile-picture.jpg",
      },
    });

    return res.status(200).send(successMessageWithData(newUser));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// USER - get user profile
const getAllUser = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  try {
    const getUser = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: "USER",
      },
    });

    if (!getUser) {
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

    return res.send(successMessageWithData(getUser));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message:
              "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
          },
        ],
      })
    );
  }
};

function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

// USER - get other user profile
const getOtherUser = async (req, res) => {
  const { identifier } = req.params;
  try {
    let findUser;

    if (isValidUUID(identifier)) {
      findUser = await prisma.user.findMany({
        where: {
          id: identifier,
          isDeleted: false,
        },
        include: {
          photos: {
            where: {
              isDeleted: false,
            },
          },
          albums: {
            where: {
              isDeleted: false,
            },
          },
        },
      });
    } else {
      findUser = await prisma.user.findMany({
        where: {
          username: identifier,
          isDeleted: false,
        },

        include: {
          photos: {
            where: {
              isDeleted: false,
            },
          },
          albums: {
            where: {
              isDeleted: false,
            },
          },
        },
      });
    }

    findUser = findUser.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    if (findUser.length === 0) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: isValidUUID(identifier) ? " " : "username or userId",
              message: isValidUUID(identifier)
                ? "User not found"
                : "user with the specified username not found",
            },
          ],
        })
      );
    }

    return res.status(200).send(successMessageWithData(findUser[0]));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message: "internal server error",
          },
        ],
      })
    );
  }
};

// USER - update profile by userID
const updateProfileByIdUser = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  try {
    const fullName = req.body?.fullName;
    const address = req.body?.address;
    const username = req.body?.username;
    const photoUrl = req.file?.filename;

    const error = [];
    if (!fullName) {
      error.push({
        field: "fullname",
        message: "Full Name is required when update the profile",
      });
    }
    if (!address) {
      error.push({
        field: "address",
        message: "Address is required when update the profile",
      });
    }

    if (error.length !== 0) {
      return res.status(400).send(
        badRequestMessage({
          messages: [...error],
        })
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        isDeleted: false,
      },
    });

    if (!existingUser) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "user not found",
            },
          ],
        })
      );
    }

    // Validasi batas update username 7 hari
    if (!username || username === existingUser.username) {
      const updateProfileUser = await prisma.user.update({
        where: {
          id: parseToken.userId,
        },
        data: {
          fullName,
          address,
          username: existingUser.username,
          photoUrl: photoUrl,
        },
      });
    } else {
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).send(
          badRequestMessage({
            messages: [
              {
                field: "username",
                message: "Username can only contain letters, numbers, underscores, and hyphens.",
              },
            ],
          })
        );
      }

      const lastUsernameUpdate = existingUser.updatedAt || 0;
      const sevenDaysInMiliSecond = 7 * 24 * 60 * 60 * 1000;
      const canUpdateUsername = Date.now() - lastUsernameUpdate > sevenDaysInMiliSecond;

      if (!canUpdateUsername) {
        return res.status(400).send(
          badRequestMessage({
            messages: [
              {
                field: "username",
                message: "You can only change your username once every 7 days.",
              },
            ],
          })
        );
      }

      const isUsernameTaken = await prisma.user.findFirst({
        where: {
          username: username,
          id: {
            not: parseToken.userId,
          },
        },
      });

      if (isUsernameTaken) {
        return res.status(400).send(
          badRequestMessage({
            messages: [
              {
                field: "username",
                message: "Username is already in use, please choose another username",
              },
            ],
          })
        );
      }

      const updateProfileUser = await prisma.user.update({
        where: {
          id: parseToken.userId,
        },
        data: {
          fullName,
          address,
          username: username,
          photoUrl: photoUrl,
          updatedAt: new Date(),
        },
      });
    }

    const getUserUpdate = await prisma.user.findFirst({
      where: {
        id: parseToken.userId,
      },
    });

    return res.status(200).send(successMessageWithData(getUserUpdate));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message:
              "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
          },
        ],
      })
    );
  }
};

// USER - get album by userId
const getAlbumsByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { userId } = req.params;

  const prisma = new PrismaClient();

  try {
    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
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

    const album = await prisma.album.findMany({
      where: {
        userId: userId,
        isDeleted: false,
      },
      include: {
        photos: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    return res.status(200).send(successMessageWithData(album));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message:
              "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
          },
        ],
      })
    );
  }
};

// GET PHOTO BY ID USER
const getPhotoByIdUser = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { userId } = req.params;

  try {
    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
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

    // Get All Foto User Id
    const getPhoto = await prisma.photo.findMany({
      where: {
        userId: userId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            photoUrl: true,
          },
        },
      },
    });
    return res.status(200).send(successMessageWithData(getPhoto));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message:
              "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
          },
        ],
      })
    );
  }
};

// ADMIN - login admin
const loginAdminController = async (req, res) => {
  const email = req.body?.email;
  const password = req.body?.password;

  try {
    const error = [];

    if (!email) {
      error.push({
        field: "email",
        message: "email cannot be empty",
      });
    }
    if (!password) {
      error.push({
        field: "password",
        message: "password cannot be empty",
      });
    }

    if (error.length !== 0) {
      return res.status(400).send(
        badRequestMessage({
          messages: [...error],
        })
      );
    }

    const findAdmin = await prisma.user.findFirst({
      where: {
        email: email,
        role: "ADMIN",
      },
    });

    if (!findAdmin) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "email",
              message: "Email not found",
            },
          ],
        })
      );
    }

    const isPasswordValid = await matchPassword(password, findAdmin.password);
    if (!isPasswordValid) {
      return res.status(400).send(
        badRequestMessage({
          messages: [
            {
              field: "password",
              message: "The password is not valid",
            },
          ],
        })
      );
    }

    if (findAdmin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "role",
              message:
                "You don't have permission to access this resource. Please log in with an admin account.",
            },
          ],
        })
      );
    }

    const dataLoginAdmin = {
      user: {
        id: findAdmin.id,
        username: findAdmin.username,
        fullName: findAdmin.fullName,
        email: findAdmin.email,
        address: findAdmin.address,
        photoUrl: findAdmin.photoUrl,
        createdAt: findAdmin.createdAt,
        updatedAt: findAdmin.updatedAt,
        role: findAdmin.role,
      },
      token: signJwt(findAdmin.id),
    };
    return res.status(200).send(successMessageWithData(dataLoginAdmin));
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loginController,
  loginAdminController, // admin
  registerController,
  getAllUser, // new
  getPhotoByIdUser,
  getOtherUser,
  updateProfileByIdUser,
  getAlbumsByUserIdController,
};
