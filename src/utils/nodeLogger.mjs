//Return console.log with highlight color for node console output
//https://davidlozzi.com/2021/03/16/style-up-your-console-logs/

export const nodeOutput = {
  error(message) {
    return console.error(`\x1b[91merror\x1b[0m ${message || "undefined message"}`);
  },
  info(message) {
    return console.info(`\x1b[94minfo\x1b[0m ${message || "undefined message"}`);
  },
  log(message) {
    return console.log(`${message || "undefined message"}`);
  },
  success(message) {
    return console.log(`\x1b[92msuccess\x1b[0m ${message || "undefined message"}`);
  },
};
