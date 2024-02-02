const { PrismaClient } = require("@prisma/client");
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { signJwt, verifyJwt } = require("../utils/jwt");
const { hashPassword, matchPassword } = require("../utils/password");
const { ENV_PORT } = require('../environtment')

const prisma = new PrismaClient()

// login controllers
async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    const prisma = new PrismaClient()

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      }
    });

    if (!user) {
      return res.status(404).send(badRequestMessage({
        error: "Email not found",
        messages: [
          {
            message: "Email not found. Please double-check your email address or consider signing up if you don't have an account."
          },
        ],
      }));
    };

    // if (!user.password) {
    //   return res.send(badRequestMessage({
    //     error: "Password not entered",
    //     messages: [
    //       {
    //         message: "Password not set. Please set a password for your account to ensure security."
    //       },
    //     ],
    //   }))
    // };

    const isPasswordValid = await matchPassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).send(badRequestMessage({
        error: "Invalid password",
        messages: [
          {
            message: "The password or confirmation password is not valid. Make sure your password meets the specified requirements"
          },
        ],
      })
      );
    };
    const jwt = signJwt(user.id);

    return res.status(200).send(successMessageWithData({
      token: jwt,
    }));

  } catch (error) {
    console.log(error);
    return res.status(500).send(badRequestMessage({
      messages: [
        {
          message: "Internal server error"
        }
      ],
    }))
  }
}

// register controllers
async function registerController(req, res) {
  try {
    const { username, fullname, password, confirmPassword, email, address } = req.body;

    if (confirmPassword !== password) {
      return res.status(400).send(
        badRequestMessage({
          error: "Confirm Your Password",
          messages: [
            {
              message: "Password and confirmation do not match.",
            },
          ],
        })
      );
    }

    const prisma = new PrismaClient();

    const check = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: username,
          },
          {
            email: email,
          },
        ],
      },
    });

    if (check) {
      check.map((item) => {
        if (item.email === email && item.username === username) {
          return res.status(400).send(
            badRequestMessage({
              messages: [
                {
                  field: "email",
                  message: "Email address is already in use",
                },
                {
                  field: "username",
                  message: "Username address is already in use",
                },
              ],
            })
          );
        }

        if (item.email === email) {
          return res.status(400).send(
            badRequestMessage({
              messages: [
                {
                  field: "email",
                  message: "Email address is already in use",
                },
              ],
            })
          );
        }

        if (item.username === username) {
          return res.status(400).send(
            badRequestMessage({
              messages: [
                {
                  field: "username",
                  message: "Username address is already in use",
                },
              ],
            })
          );
        }
      });
    }

    const hashUserPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: username,
        fullName: fullname,
        password: hashUserPassword,
        email: email,
        address: address,
        photoUrl: "default-profile.jpeg",
      },
    });

    return res.status(200).send(successMessageWithData(newUser));
  } catch (error) {
    return res.status(500).send(badRequestMessage({
      messages: {
        message: "Internal server error"
      }
    }))
  }
}

// get userByIdUser
const getUserByIdUser = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  try {
    const getUser = await prisma.user.findMany({
      where: {
        id: parseToken.userId,
        isDeleted: false,
      },
    });

    if (!getUser) {
      return res.status(404).send(badRequestMessage({
        error: "User not found",
        messages: [
          {
            message: "User not found",
          }
        ],
      }));
    };

    return res.send(successMessageWithData(getUser));
  } catch (error) {
    console.log(error)
    return res.status(500).send(badRequestMessage({
      messages: [
        {
          message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
        },
      ]
    }));
  }
}

// update profile by iuser
const updateProfileByIdUser = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  try {
    const { fullName, address, username } = req.body;
    const photoUrl = req.file.filename

    // const fileNameOnly = photoUrl.replace(/^uploads[\\\/]profiles[\\\/]/, `http://localhost:${ENV_PORT}/files/images/profiles/`);

    const existingUser = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        isDeleted: false
      },
    });

    // Validasi batas update username 7 hari
    const lastUsernameUpdate = existingUser.updatedAt || 0;
    const sevenDaysInMiliSecond = 7 * 24 * 60 * 60 * 1000;
    const canUpdateUsername = Date.now() - lastUsernameUpdate > sevenDaysInMiliSecond;

    if (username && !canUpdateUsername) {
      return res.status(400).send(badRequestMessage({
        messages: [
          {
            message: "You can only change your username once every 7 days."
          },
        ],
      }));
    };

    // validasi agar tidak ada kesamaan dengan user lain
    if (username && username !== existingUser.username) {
      const isUsernameTaken = await prisma.user.findFirst({
        where: {
          username: username,
          id: {
            not: parseToken.userId
          },
        },
      });

      if (!isUsernameTaken) {
        return res.status(400).send(badRequestMessage({
          messages: [
            {
              message: "Username is already in use, please choose another username",
            },
          ],
        }));
      }
    };

    const updateProfileUser = await prisma.user.update({
      where: {
        id: parseToken.userId,
      },
      data: {
        fullName,
        address,
        username: canUpdateUsername ? username : existingUser.username,
        photoUrl: photoUrl,
      },
    });

    return res.status(200).send(successMessageWithData(updateProfileUser));

  } catch (error) {
    return res.status(500).send(badRequestMessage({
      messages: [
        {
          message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
        },
      ],
    }));
  };
};

module.exports = { loginController, registerController, getUserByIdUser, updateProfileByIdUser };
