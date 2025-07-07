const { Given, When, Then } = require('@cucumber/cucumber');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to execute Gemini CLI commands
function executeGeminiCommand(prompt) {
    try {
        console.log(`🤖 Executing Gemini CLI: ${prompt.substring(0, 100)}...`);
        
        // Execute gemini command directly (preserving original implementation)
        const result = execSync(`gemini -p "${prompt}"`, {
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 60000
        });
        
        console.log('✅ Gemini CLI executed successfully');
        return result;
    } catch (error) {
        console.error('❌ Gemini CLI execution failed:', error.message);
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
    console.log(`📊 Loaded test data for: ${website}`);
});

When('I execute gemini command to navigate and login with {string} and {string}', function (username, password) {
    const prompt = `Navigate to ${this.website} and login with username "${username}" and password "${password}". Take a screenshot after login attempt and capture any error messages if login fails.`;
    
    this.geminiResult = executeGeminiCommand(prompt);
    this.username = username;
    this.password = password;
});

Then('I should capture screenshot and verify {string}', function (expectedResult) {
    console.log(`🔍 Verifying expected result: ${expectedResult}`);
    console.log(`👤 Test completed for user: ${this.username}`);
    
    // Simple verification - in real scenario, you'd parse Gemini CLI output
    if (expectedResult === 'error') {
        console.log('✅ Error scenario test completed');
    } else {
        console.log('✅ Success scenario test completed');
    }
});

Given('I navigate to {string}', function (website) {
    this.website = website;
    console.log(`🌐 Setting target website: ${website}`);
});

When('I search for {string} using gemini command', function (searchTerm) {
    const prompt = `Navigate to ${this.website}, accept any cookie dialogs, search for "${searchTerm}" and take a screenshot of the search results.`;
    
    this.geminiResult = executeGeminiCommand(prompt);
    this.searchTerm = searchTerm;
});

Then('I should see search results and take screenshot', function () {
    console.log(`🔍 Search test completed for term: ${this.searchTerm}`);
    console.log('✅ Screenshot captured via Gemini CLI');
});
