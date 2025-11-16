module.exports = {
  default: {
    require: ['tests/steps/**/*.js', 'tests/support/**/*.js'],
    format: ['progress', 'html:tests/reports/cucumber-report.html', 'json:tests/reports/cucumber-report.json'],
    publishQuiet: true,
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};
