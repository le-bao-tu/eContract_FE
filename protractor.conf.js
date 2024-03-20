exports.config = {
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--disable-gpu', '--window-size=1366x768', '--no-sandbox'],
    },
  },
};
