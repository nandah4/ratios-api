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

const authMessage = () => {
  return {
    status: 401,
    message: "Unauthorized",
  };
};

module.exports = { badRequestMessage, successMessageWithData, authMessage };
