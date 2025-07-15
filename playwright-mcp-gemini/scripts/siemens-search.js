
/**
 * Siemens Website Search Automation
 * This script demonstrates Playwright MCP with Gemini CLI
 */

const { execSync } = require('child_process');
const path = require('path');

async function runSiemensSearch() {
    console.log('🚀 Starting Siemens website search automation...');
    
    // Define the task prompt for Gemini CLI
    const taskPrompt = `
    Using the Playwright MCP server, please perform the following web automation task:
    
    1. Navigate to https://www.siemens.com/global/en.html
    2. Accept any cookie consent dialog that appears
    3. Search for "sigreen" using the website's search functionality
    4. Take a screenshot of the search results
    5. Provide a summary of what was found
    
    Please execute this step by step and confirm each action.
    `;

    try {
        // Execute the Gemini CLI command with the task
        console.log('📱 Calling Gemini CLI with Playwright MCP...');
        
        const command = `gemini -p "${taskPrompt}" --model "gemini-2.5-flash-lite-preview-06-17"`;

        console.log('Executing command:', command);

        // Execute the command
        const result = execSync(command, {
            encoding: 'utf8',
            stdio: 'pipe',
            cwd: process.cwd()
        });
        
        console.log('✅ Task completed successfully!');
        console.log('📋 Result:', result);
        
    } catch (error) {
        console.error('❌ Error executing task:', error.message);
        console.error('Make sure Gemini CLI is properly configured with MCP servers');
        
        // Provide troubleshooting steps
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Verify Gemini CLI installation: gemini --version');
        console.log('2. Check MCP server configuration: gemini /tools');
        console.log('3. Ensure Playwright MCP server is running');
        console.log('4. Verify Google Cloud authentication');
    }
}

// Run the automation
if (require.main === module) {
    runSiemensSearch();
}

module.exports = { runSiemensSearch };