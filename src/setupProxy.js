const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  console.log("registering proxy");
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://maps.googleapis.com/maps",
      changeOrigin: true,
      secure: false,
    })
  );
};
