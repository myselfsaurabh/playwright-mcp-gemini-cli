# Playwright MCP with Gemini CLI

A comprehensive web automation framework that combines Playwright's Model Context Protocol (MCP) with Google's Gemini CLI for AI-powered browser automation and testing. This project enables intelligent web interactions through natural language commands and supports Behavior-Driven Development (BDD) testing patterns.

## Features

- **AI-Powered Automation**: Natural language web automation using Gemini CLI
- **Playwright MCP Integration**: Browser automation through Model Context Protocol
- **BDD Testing Framework**: Cucumber-based behavior-driven development
- **Screenshot Analysis**: Automated screenshot capture and AI analysis
- **Multi-Website Support**: Configurable testing across different web applications
- **Data-Driven Testing**: CSV-based test data management
- **Headless/Headed Modes**: Flexible browser execution options

## Prerequisites

### System Requirements
- Node.js 18.0 or higher
- npm or yarn package manager
- Google Cloud account with Gemini API access
- Git (for version control)

### Required Tools
1. **Gemini CLI**: Google's command-line AI tool
2. **Playwright**: Browser automation library
3. **Cucumber**: BDD testing framework

## Installation and Setup

### 1. Install Gemini CLI

#### Option A: Using npm (Recommended)
```bash
npm install -g @google/gemini-cli
```

#### Option B: Using Go (Alternative)
```bash
go install github.com/google-gemini/gemini-cli@latest
```

### 2. Configure Google Cloud Authentication

#### Set up API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Set environment variable:
```bash
export GEMINI_API_KEY="your-api-key-here"
```

#### Alternative: Service Account (Production)
```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

### 3. Verify Gemini CLI Installation
```bash
gemini --version
gemini /tools
```

### 4. Clone and Setup Project
```bash
git clone <repository-url>
cd playwright-mcp-gemini
npm install
```

### 5. Configure Environment Variables
Create `.env` file in project root:
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GEMINI_API_KEY=your-api-key
```

### 6. Configure MCP Settings
The project includes `.gemini/settings.json` for MCP server configuration:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false"
      }
    }
  }
}
```

### 7. Install Playwright Browsers
```bash
npx playwright install
```

## Project Structure

```
playwright-mcp-gemini/
├── .gemini/
│   └── settings.json         # MCP server configuration
├── features/
│   └── website-automation.feature # BDD test scenarios
├── step-definitions/
│   └── automation-steps.js   # Cucumber step implementations
├── scripts/
│   └── siemens-search.js     # Example automation script
├── test-data/
│   └── credentials.csv       # Test data files
├── reports/
│   └── cucumber-report.html  # Test execution reports
├── .env                      # Environment variables
├── package.json              # Project dependencies
└── cucumber.js               # Cucumber configuration
```

## Usage

### Quick Start Commands

#### 1. Verify Setup
```bash
npm run check-gemini
npm run list-tools
```

#### 2. Run Example Automation
```bash
npm start
```

#### 3. Execute BDD Tests
```bash
npm run test:bdd
```

#### 4. Generate Test Reports
```bash
npm run test:bdd-report
```

### Basic Automation Example

```javascript
const { execSync } = require('child_process');

function executeGeminiCommand(prompt) {
    const result = execSync(`gemini -p "${prompt}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
    });
    return result;
}

// Example usage
const taskPrompt = `
Using the Playwright MCP server, please:
1. Navigate to https://www.example.com
2. Accept any cookie dialogs
3. Take a screenshot
4. Provide a summary of the page content
`;

const result = executeGeminiCommand(taskPrompt);
console.log(result);
```

### BDD Testing Example

#### Feature File (features/website-automation.feature)
```gherkin
Feature: Website Automation Testing

  Scenario Outline: Test website login functionality
    Given I have test data for "<website>"
    When I execute gemini command to navigate and login with "<username>" and "<password>"
    Then I should capture screenshot and verify "<expectedResult>"

    Examples:
      | website                           | username      | password     | expectedResult |
      | https://www.saucedemo.com/v1/     | standard_user | secret_sauce | success        |
      | https://www.saucedemo.com/v1/     | invalid_user  | wrong_pass   | error          |
```

#### Step Definitions
```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

When('I execute gemini command to navigate and login with {string} and {string}',
function (username, password) {
    const prompt = `Navigate to ${this.website} and login with username "${username}" and password "${password}". Take a screenshot after login attempt.`;

    this.geminiResult = executeGeminiCommand(prompt);
    this.username = username;
    this.password = password;
});
```

## Configuration Details

### MCP Server Configuration

The `.gemini/settings.json` file configures the Playwright MCP server:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false"
      }
    }
  }
}
```

**Configuration Options:**
- `PLAYWRIGHT_HEADLESS`: Set to "true" for headless mode, "false" for headed mode
- Additional environment variables can be added for browser configuration

### Cucumber Configuration

The `cucumber.js` file defines test execution settings:

```javascript
module.exports = {
  default: {
    require: ['step-definitions/**/*.js'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};
```

### Package.json Scripts

Available npm scripts for project management:

```json
{
  "scripts": {
    "start": "node scripts/siemens-search.js",
    "test-mcp": "npx @playwright/mcp@latest",
    "check-gemini": "gemini --version",
    "list-tools": "gemini /tools",
    "test:bdd": "npx cucumber-js",
    "test:bdd-report": "npx cucumber-js --format html:reports/cucumber-report.html"
  }
}
```

## Advanced Usage

### Custom Automation Scripts

Create custom automation scripts in the `scripts/` directory:

```javascript
const { execSync } = require('child_process');

async function customAutomation() {
    const taskPrompt = `
    Using the Playwright MCP server:
    1. Navigate to your target website
    2. Perform specific actions
    3. Capture screenshots
    4. Extract data
    5. Generate summary report
    `;

    try {
        const result = execSync(`gemini -p "${taskPrompt}"`, {
            encoding: 'utf8',
            stdio: 'pipe',
            cwd: process.cwd()
        });

        console.log('Automation completed:', result);
    } catch (error) {
        console.error('Automation failed:', error.message);
    }
}
```

### Data-Driven Testing

Use CSV files in `test-data/` directory for parameterized testing:

```csv
website,username,password,expectedResult
https://www.saucedemo.com/v1/,standard_user,secret_sauce,success
https://www.saucedemo.com/v1/,locked_out_user,secret_sauce,error
https://www.saucedemo.com/v1/,invalid_user,wrong_pass,error
```

### Screenshot Analysis

Implement screenshot analysis with Gemini CLI:

```javascript
function analyzeScreenshot(screenshotPath, context) {
    const analysisPrompt = `
    Analyze this screenshot and provide:
    1. Current page state
    2. Visible UI elements
    3. User actions performed: ${context}
    4. Next recommended steps
    `;

    // Note: File upload functionality depends on Gemini CLI version
    return executeGeminiCommand(analysisPrompt);
}
```

## Troubleshooting

### Common Issues

#### 1. Gemini CLI Not Found
```bash
# Verify installation
which gemini
gemini --version

# Reinstall if necessary
npm install -g @google/gemini-cli
```

#### 2. MCP Server Connection Issues
```bash
# Check MCP server status
npm run list-tools

# Verify Playwright MCP installation
npx @playwright/mcp@latest --version
```

#### 3. Authentication Problems
```bash
# Verify API key
echo $GEMINI_API_KEY

# Test authentication
gemini -p "Hello, test connection"
```

#### 4. Browser Installation Issues
```bash
# Install all browsers
npx playwright install

# Install specific browser
npx playwright install chromium
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment
export DEBUG=playwright:*
export GEMINI_DEBUG=true

# Run with verbose output
npm run test:bdd -- --verbose
```

### Performance Optimization

#### Browser Configuration
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true",
        "PLAYWRIGHT_BROWSER": "chromium",
        "PLAYWRIGHT_TIMEOUT": "30000"
      }
    }
  }
}
```

#### Test Execution
- Use headless mode for faster execution
- Implement parallel test execution
- Configure appropriate timeouts
- Use data-driven testing for efficiency

## Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Install dependencies: `npm install`
4. Make changes and test
5. Submit pull request

### Code Standards
- Use ESLint for code formatting
- Follow BDD naming conventions
- Include comprehensive test coverage
- Document new features

### Testing Guidelines
- Write BDD scenarios for new features
- Include both positive and negative test cases
- Use meaningful test data
- Verify screenshot capture functionality

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check troubleshooting section
2. Review Gemini CLI documentation
3. Consult Playwright MCP documentation
4. Create GitHub issue with detailed description

## Related Resources

- [Gemini CLI Documentation](https://github.com/google-gemini/gemini-cli)
- [Playwright MCP Documentation](https://github.com/microsoft/playwright-mcp)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Google AI Studio](https://aistudio.google.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)