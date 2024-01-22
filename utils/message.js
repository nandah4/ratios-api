const badRequestMessage = ({ messages, error }) => {
  return {
    status: 400,
    messages: "bad request",
    errors: {
      error,
      messages: messages,
    },
  };
};

const successMessageWithData = (data) => {
  return {
    stastus: 200,
    message: "success",
    data: data,
  };
};

const successCreateMessageWithData = () => {
  return {
    stastus: 201,
    message: "successfull create",
  };
};

const authMessage = () => {
  return {
    status: 401,
    message: "Unauthorized",
  };
};

module.exports = { badRequestMessage, successMessageWithData, successCreateMessageWithData, authMessage };
