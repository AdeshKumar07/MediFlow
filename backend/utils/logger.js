const logger = {
  info: (message) => {
    console.log(`[\x1b[32mINFO\x1b[0m] ${new Date().toLocaleString()} - ${message}`);
  },
  error: (message) => {
    console.error(`[\x1b[31mERROR\x1b[0m] ${new Date().toLocaleString()} - ${message}`);
  },
  warn: (message) => {
    console.warn(`[\x1b[33mWARN\x1b[0m] ${new Date().toLocaleString()} - ${message}`);
  }
};

module.exports = logger;
