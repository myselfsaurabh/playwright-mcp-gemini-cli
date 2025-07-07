module.exports = {
  default: {
    require: ['step-definitions/**/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    paths: ['features/**/*.feature'],
    timeout: 120000
  }
};
