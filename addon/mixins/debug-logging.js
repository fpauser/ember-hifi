import { getOwner } from '@ember/application';
import Mixin from '@ember/object/mixin';
import EmberObject, {
  getWithDefault,
  computed
} from '@ember/object';
import Debug from '../utils/debug';

// Keep this object around to keep track of logs.
const DebugLogging = EmberObject.create({
  loggers: {},

  findOrCreateLogger(name) {
    let loggerMap = this.get('loggers');
    let logger    = loggerMap[name];

    if (!logger) {
      logger = new Debug(name);
      loggerMap[name] = logger;
    }

    return logger;
  },

  log(name, message) {
    this.findOrCreateLogger(name).log(message);
  },

  timeStart(name, timerName) {
    this.findOrCreateLogger(name).time(timerName);
  },

  timeEnd(name, timerName) {
    this.findOrCreateLogger(name).timeEnd(timerName);
  }
});

export default Mixin.create({
  debugName: 'ember-hifi',

  debugEnabled: computed(function() {
    let owner = getOwner(this);
    // We need this calculated field in the mixin because configuration gets looked up on the container.
    if (owner) { // if there's no owner, we're not quite initialized yet
      let config = owner.resolveRegistration('config:environment') || {};
      return getWithDefault(config, 'emberHifi.debug', false);
    }
  }),

  debug() {
    if (!this.get('debugEnabled')) { return; }

    let debugName, message;
    if (arguments.length === 1) {
      debugName = this.get('debugName');
      message   = arguments[0];
    }
    else if (arguments.length === 2) {
      debugName = arguments[0];
      message   = arguments[1];
    }

    DebugLogging.log(debugName, message);
  },

  timeStart() {
    if (!this.get('debugEnabled')) { return; }

    DebugLogging.timeStart(...arguments);
  },

  timeEnd() {
    if (!this.get('debugEnabled')) { return; }

    DebugLogging.timeEnd(...arguments);
  }
});
