const { PrismaClient } = require("@prisma/client");
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { signJwt, verifyJwt } = require("../utils/jwt");
const { hashPassword, matchPassword } = require("../utils/password");


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
      res.status(404).send({
        message: "Email not found. Please double-check your email address or consider signing up if you don't have an account."
      })
    };

    if (!user.password) {
      res.status(404).send({
        message: "Password not set. Please set a password for your account to ensure security."
      })
    };

    const isPasswordValid = await matchPassword(password, user.password)

    if (!isPasswordValid) {
      return res.send(badRequestMessage({messages: [
        {
          field: "Confirm Password",
          message: "The password or confirmation password is not valid. Make sure your password meets the specified requirements"
        },
      ],
    })
    );
    }
    const jwt = signJwt(user.id);

    return res.send(successMessageWithData({
      token: jwt,
    }));

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error. Please try again later."
    })
  }
}


async function registerController(req, res) {
  try {
    const { username, fullname, password, confirmPassword, email, address } = req.body;

    if (confirmPassword !== password) {
      return res.send(
        badRequestMessage({
          messages: [
            {
              field: "confirmPassword",
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

    return res.send(successMessageWithData(newUser));
  } catch (error) {
    console.log(error);
  }
}

module.exports = { loginController, registerController };
