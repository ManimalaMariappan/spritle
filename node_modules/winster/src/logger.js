/* global require */
const Winston = require('winston');
const _ = require('lodash');
const readPkg = require('read-pkg');
const pkgDir = require('pkg-dir');
const fs = require('fs');
const path = require('path');

const logLevels = require('./config-levels');
const defaultTransports = require('./default-transports');

let logger;

class Logger {
  constructor(namespace /* , context */) {
    this.options = {};
    this.options.namespace = namespace || {};

    this.winston = new (Winston.Logger)({
      level: logLevels.defaultLevel,
      levels: logLevels.levels,
      colors: logLevels.colors,
      exitOnError: false
    });
    // This._patchInternals();
    this._config();
    this._configTransports();
  }

  // Allow easy instantiation by using `require('winster').instance()`
  static instance() {
    if (!logger) {
      logger = new Logger();
    }
    return logger;
  }

  _config() {

    // Expose a method for each of the custom log levels
    for (const level in logLevels.levels) { // eslint-disable-line guard-for-in
      this[level] = function (msg, msgContext) {
        this.winston[level](msg, msgContext);
      };
    }
  }

  // Fix to include a line break into the log
  // See: https://github.com/winstonjs/winston/issues/460
  // _patchInternals() {
  //   const self = this;
  //   this.winston.log = function () {
  //     const args = arguments;
  //     args[1] += '\r\n';
  //     self.winston.Logger.prototype.log.apply(this, args);
  //   };
  // }

  /**
   * Determines which transport configuration file to use:
   *
   * - 1st fetch the configuration in package.json
   * - 2nd Look for a file called .winster.js in the project's root
   * - 3rd fall back to  ./src/default-transports.js
   *
   * @returns {*}
   * @private
   */
  _getTransportDefinition() {

    // 1st: fetch the configuration in package.json
    if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
      const pkg = readPkg.sync();
      // This._internalLog('[winster] package from ' + pkg.name + ': ', pkg.winster);
      if (pkg.winster && pkg.winster.configFile) {
        const configPkg = path.join(pkgDir.sync(), pkg.winster.configFile);
        if (fs.existsSync(configPkg)) {
          this._internalLog('[winster] Using transports as defined in package.json\r\n');
          return _.extend(require(configPkg), {from: 'package.json'});
        }
      }
    }

    // 2nd: Look for a file called .winster.js in the project's root.
    const rootFile = path.join(process.cwd(), '.winster.js');
    // This._internalLog('[winster] Rootfile:', rootFile);
    if (fs.existsSync(rootFile)) {
      this._internalLog('[winster] Loading .winster.js');
      return _.extend(require(rootFile), {from: '.winster.js'});
    }

    this._internalLog('[winster] Loading default transports');
    return _.extend(defaultTransports, {from: 'default'});
  }

  /**
   * Logging for the internal stuff, where we cannot use Winster, yet.
   * @param msg
   * @private
   */
  _internalLog(/* msg, msgContext */) {
    if (process.env.WINSTER_SUPRESS_LOGGING !== 'true') {
      console.log.apply(console, arguments);
    }
  }

  _configTransports() {
    this._transportConfig = this._getTransportDefinition();
    const env = !_.isEmpty(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development'; // eslint-disable-line no-negated-condition

    const transports = this._transportConfig[env];
    const transportsList = _.map(transports, item => {
      return item.options.name;
    });
    this._internalLog('[winster] Adding ' + (transports ? transports.length : 0) + ' transport(s) to ' + env + ': ' + (!_.isEmpty(transportsList) ? transportsList : '-') + '\r\n'); // eslint-disable-line no-negated-condition
    if (transports) {
      transports.forEach(item => {
        this.winston.add(item.transporter, item.options);
      });
    }
  }

  log(level, msg, context) {
    this.winston.log(level, msg, context);
  }

}

module.exports = Logger;
