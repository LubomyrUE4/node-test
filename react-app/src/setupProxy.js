const createProxyMiddleware = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    createProxyMiddleware("/auth/google", { target: "http://ec2-18-212-98-168.compute-1.amazonaws.com:5000/" })
  );
};
