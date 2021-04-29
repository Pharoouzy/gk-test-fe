export const constant = {
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://order.test/api/v1"
      : "https://gokada-test-api.herokuapp.com/api/v1",
  apiKey: "AIzaSyDy_0KGBQQWlCfn7JjOzXzk6eQfaF5IZS8",
  radius: 50000,
};
