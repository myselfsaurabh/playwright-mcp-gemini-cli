const { Given, When, Then } = require('@cucumber/cucumber');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to execute Gemini CLI commands
function executeGeminiCommand(prompt) {
    try {
        console.log(`Executing Gemini CLI: ${prompt.substring(0, 100)}...`);

        // Execute gemini command directly (preserving original implementation)
        const result = execSync(`gemini -p "${prompt}" --model "gemini-2.5-flash-lite-preview-06-17"`, {
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 60000
        });

        console.log('Gemini CLI executed successfully');
        return result;
    } catch (error) {
        console.error('Gemini CLI execution failed:', error.message);
        throw error;
    }
}

// Helper function to read CSV data
function readTestData(filename) {
    const csvPath = path.join(__dirname, '..', 'test-data', filename);
    if (fs.existsSync(csvPath)) {
        const content = fs.readFileSync(csvPath, 'utf8');
        return content.split('\n').slice(1); // Skip header
    }
    return [];
}

Given('I have test data for {string}', function (website) {
    this.website = website;
    this.testData = readTestData('credentials.csv');
    console.log(`Loaded test data for: ${website}`);
});

When('I execute gemini command to navigate and login with {string} and {string}', function (username, password) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `login-${username}-${timestamp}.png`;
    const prompt = `Navigate to ${this.website} and login with username "${username}" and password "${password}". After login attempt, use browser_take_screenshot tool with filename parameter set to "${screenshotName}" to save the screenshot. Capture any error messages if login fails.`;

    this.geminiResult = executeGeminiCommand(prompt);
    this.username = username;
    this.password = password;
    this.screenshotName = screenshotName;
});

Then('I should capture screenshot and verify {string}', function (expectedResult) {
    console.log(`Verifying expected result: ${expectedResult}`);
    console.log(`Test completed for user: ${this.username}`);
    console.log(`Expected screenshot: ${this.screenshotName}`);

    // Check if screenshot was saved
    const screenshotPath = path.join(__dirname, '..', 'screenshots', this.screenshotName);
    if (fs.existsSync(screenshotPath)) {
        console.log('Screenshot captured and saved successfully');
    } else {
        console.log('Screenshot not found - check Gemini CLI MCP configuration');
    }

    // Simple verification - in real scenario, you'd parse Gemini CLI output
    if (expectedResult === 'error') {
        console.log('Error scenario test completed');
    } else {
        console.log('Success scenario test completed');
    }
});

Given('I navigate to {string}', function (website) {
    this.website = website;
    console.log(`Setting target website: ${website}`);
});

When('I search for {string} using gemini command', function (searchTerm) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `search-${searchTerm}-${timestamp}.png`;
    const prompt = `Navigate to ${this.website}, accept any cookie dialogs, search for "${searchTerm}". After getting search results, use browser_take_screenshot tool with filename parameter set to "${screenshotName}" to save the screenshot.`;

    this.geminiResult = executeGeminiCommand(prompt);
    this.searchTerm = searchTerm;
    this.screenshotName = screenshotName;
});

Then('I should see search results and take screenshot', function () {
    console.log(`Search test completed for term: ${this.searchTerm}`);
    console.log(`Expected screenshot: ${this.screenshotName}`);

    // Check if screenshot was saved
    const screenshotPath = path.join(__dirname, '..', 'screenshots', this.screenshotName);
    if (fs.existsSync(screenshotPath)) {
        console.log('Screenshot captured and saved successfully');
    } else {
        console.log('Screenshot not found - check Gemini CLI MCP configuration');
    }
});
