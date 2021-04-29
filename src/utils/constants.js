export const constant = {
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://order.test/api/v1"
      : "https://gokada-test-api.herokuapp.com/api/v1",
  apiKey: "AIzaSyDy_XXXXX",
  radius: 50000,
};
