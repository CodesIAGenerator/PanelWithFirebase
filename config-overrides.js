module.exports = function override(config, env) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify')
    };

    if (!config.resolve.fallback) {
        config.resolve.fallback = {};
    }

    config.resolve.fallback["stream"] = require.resolve("stream-browserify");

    config.resolve.fallback["buffer"] = require.resolve("buffer/");


    return config;
  };
  