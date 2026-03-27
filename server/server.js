const { startServer } = require("./app");

startServer().catch((error) => {
  console.error("Unable to start the server:", error.message);
  process.exit(1);
});
