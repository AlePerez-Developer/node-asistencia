const config = {
  env: process.env.NODE_ENV || "development",
  debug: process.env.APP_DEBUG === "true",
  appPort: parseInt(process.env.APP_PORT || "3000"),
};

export default config;
