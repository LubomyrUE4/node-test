const createProxyMiddleware = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/auth/google", { target: "http://ec2-54-208-21-200.compute-1.amazonaws.com:5000/" })
  );
};
