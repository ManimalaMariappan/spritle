const defaultLevels = {
  defaultLevel: 'trace',
  levels: {
    fatal: 0,
    error: 1,
    debug: 2,
    warn: 3,
    data: 4,
    info: 5,
    verbose: 6,
    trace: 7
  },
  colors: {
    fatal: 'red',
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    trace: 'magenta'
  }
};

module.exports = defaultLevels;
