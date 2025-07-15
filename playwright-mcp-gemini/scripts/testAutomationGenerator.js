#!/usr/bin/env node

/**
 * Test Automation Script Generator Utility
 * 
 * This utility:
 * 1. Reads test scenarios from saucedemoScenario.docx
 * 2. Uses Gemini CLI with testAutomationPrompt.md to generate Playwright BDD feature files
 * 3. Saves the generated automation scripts to scriptsForReviews folder
 * 
 * Usage: node scripts/testAutomationGenerator.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load configuration from utility folder
const CONFIG_PATH = path.join(__dirname, '../utility/config.json');
let config;

try {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    config = JSON.parse(configContent);
} catch (error) {
    console.error('[ERROR] Failed to load utility/config.json:', error.message);
    process.exit(1);
}

// Generate timestamp for unique filename
const generateTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// File paths from config with timestamp
const SCENARIO_PATH = path.join(__dirname, '..', config.paths.testAutomationInput);
const PROMPT_PATH = path.join(__dirname, '..', config.paths.testAutomationPrompt);
const TEMP_DIR = path.join(__dirname, '..', config.paths.tempDir);

// Generate timestamped output directory
const timestamp = generateTimestamp();
const outputDir = path.join(__dirname, '..', 'scriptsForReviews', `feature-files-${timestamp}`);
const OUTPUT_DIR = outputDir;

class TestAutomationGenerator {
    constructor() {
        this.ensureDirectories();
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        const dirs = [
            OUTPUT_DIR,
            TEMP_DIR
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`[INFO] Created directory: ${dir}`);
            }
        });
    }

    /**
     * Check if required dependencies are installed
     */
    checkDependencies() {
        console.log('[INFO] Checking dependencies...');

        try {
            // Check if Gemini CLI is available
            execSync('gemini --version', { stdio: 'pipe' });
            console.log('[SUCCESS] Gemini CLI is available');
        } catch (error) {
            throw new Error('[ERROR] Gemini CLI not found. Please install Gemini CLI first.');
        }

        // Check if required npm packages are available
        const requiredPackages = ['mammoth'];
        const missingPackages = [];

        requiredPackages.forEach(pkg => {
            try {
                require.resolve(pkg);
                console.log(`[SUCCESS] ${pkg} is available`);
            } catch (error) {
                missingPackages.push(pkg);
            }
        });

        if (missingPackages.length > 0) {
            console.log(`[ERROR] Missing packages: ${missingPackages.join(', ')}`);
            console.log('[INFO] Installing missing packages...');

            try {
                execSync(`npm install ${missingPackages.join(' ')}`, {
                    stdio: 'inherit',
                    cwd: path.join(__dirname, '..')
                });
                console.log('[SUCCESS] Packages installed successfully');
            } catch (error) {
                throw new Error('Failed to install required packages');
            }
        }
    }

    /**
     * Read and extract text from test scenario DOCX file
     */
    async readScenarioDocument() {
        console.log('[INFO] Reading test scenario document...');

        if (!fs.existsSync(SCENARIO_PATH)) {
            throw new Error(`Test scenario file not found: ${SCENARIO_PATH}`);
        }

        try {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: SCENARIO_PATH });

            if (result.messages.length > 0) {
                console.log('[WARNING] Warnings while reading DOCX:', result.messages);
            }

            console.log('[SUCCESS] Test scenario document read successfully');
            return result.value;
        } catch (error) {
            throw new Error(`Failed to read test scenario document: ${error.message}`);
        }
    }

    /**
     * Read the test automation prompt template
     */
    readPromptTemplate() {
        console.log('[INFO] Reading test automation prompt template...');

        if (!fs.existsSync(PROMPT_PATH)) {
            throw new Error(`Prompt file not found: ${PROMPT_PATH}`);
        }

        const promptContent = fs.readFileSync(PROMPT_PATH, 'utf8');
        console.log('[SUCCESS] Test automation prompt template read successfully');
        return promptContent;
    }

    /**
     * Generate automation scripts using Gemini CLI
     */
    async generateAutomationScripts(scenarioContent, promptTemplate) {
        console.log('[INFO] Generating automation scripts with Gemini CLI...');

        // Create temporary files for input
        const tempScenarioFile = path.join(TEMP_DIR, 'scenario_content.txt');
        const tempPromptFile = path.join(TEMP_DIR, 'combined_prompt.txt');
        const tempOutputFile = path.join(TEMP_DIR, 'automation_output.txt');

        try {
            // Write scenario content to temp file
            fs.writeFileSync(tempScenarioFile, scenarioContent);

            // Combine prompt template with scenario content
            const combinedPrompt = `${promptTemplate}\n\n---\n\nFUNCTIONAL TEST SCENARIOS TO ANALYZE:\n\n${scenarioContent}`;
            fs.writeFileSync(tempPromptFile, combinedPrompt);

            // Execute Gemini CLI command
            console.log('[INFO] Calling Gemini CLI (this may take a moment)...');

            // Use proper Gemini CLI syntax with model parameter: read from stdin and output to file
            const geminiCommand = `type "${tempPromptFile}" | gemini --model "gemini-2.5-pro" > "${tempOutputFile}"`;
            execSync(geminiCommand, {
                stdio: 'pipe',
                shell: true,
                cwd: path.join(__dirname, '..')
            });

            // Read the generated automation scripts
            if (!fs.existsSync(tempOutputFile)) {
                throw new Error('Gemini CLI did not generate output file');
            }

            const automationContent = fs.readFileSync(tempOutputFile, 'utf8');

            if (!automationContent.trim()) {
                throw new Error('Gemini CLI generated empty response');
            }

            console.log('[SUCCESS] Automation scripts generated successfully');
            return automationContent;

        } catch (error) {
            throw new Error(`Failed to generate automation scripts: ${error.message}`);
        }
    }

    /**
     * Parse and save individual feature files
     */
    async saveFeatureFiles(automationContent) {
        console.log('[INFO] Parsing and saving individual feature files...');

        try {
            // Split content by feature blocks
            const featureBlocks = this.parseFeatureBlocks(automationContent);
            const savedFiles = [];

            for (const featureBlock of featureBlocks) {
                const featureName = this.extractFeatureName(featureBlock);
                const filename = this.generateFeatureFilename(featureName);
                const filepath = path.join(OUTPUT_DIR, filename);

                // Clean the feature content (remove markdown code blocks)
                const cleanContent = this.cleanFeatureContent(featureBlock);

                fs.writeFileSync(filepath, cleanContent, 'utf8');
                savedFiles.push({
                    filename: filename,
                    filepath: filepath,
                    featureName: featureName
                });

                console.log(`[SUCCESS] Created feature file: ${filename}`);
            }

            // Create a summary file
            const summaryPath = path.join(OUTPUT_DIR, 'README.md');
            this.createSummaryFile(summaryPath, savedFiles);

            console.log('[SUCCESS] All feature files saved successfully');
            return savedFiles;

        } catch (error) {
            throw new Error(`Failed to save feature files: ${error.message}`);
        }
    }

    /**
     * Parse feature blocks from automation content
     */
    parseFeatureBlocks(content) {
        // Split by ```gherkin blocks
        const blocks = content.split('```gherkin');
        const featureBlocks = [];

        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const endIndex = block.indexOf('```');
            if (endIndex !== -1) {
                const featureContent = block.substring(0, endIndex).trim();
                if (featureContent.startsWith('Feature:')) {
                    featureBlocks.push(featureContent);
                }
            }
        }

        return featureBlocks;
    }

    /**
     * Extract feature name from feature block
     */
    extractFeatureName(featureBlock) {
        const lines = featureBlock.split('\n');
        const featureLine = lines.find(line => line.trim().startsWith('Feature:'));
        if (featureLine) {
            return featureLine.replace('Feature:', '').trim();
        }
        return 'Unknown Feature';
    }

    /**
     * Generate filename from feature name
     */
    generateFeatureFilename(featureName) {
        return featureName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '') + '.feature';
    }

    /**
     * Clean feature content (remove markdown formatting)
     */
    cleanFeatureContent(featureBlock) {
        return featureBlock.trim();
    }

    /**
     * Create summary file with list of generated features
     */
    createSummaryFile(summaryPath, savedFiles) {
        const content = `# Generated Feature Files

Generated on: ${new Date().toISOString()}
Source: ${path.basename(SCENARIO_PATH)}
Prompt: ${path.basename(PROMPT_PATH)}

## Feature Files Created:

${savedFiles.map(file => `- **${file.filename}** - ${file.featureName}`).join('\n')}

## Usage:

1. Copy the desired .feature files to your features/ directory
2. Run BDD tests using your existing Cucumber.js setup
3. Execute with Playwright MCP and Gemini CLI

## Files in this directory:

${savedFiles.map(file => `- ${file.filename}`).join('\n')}
`;

        fs.writeFileSync(summaryPath, content, 'utf8');
        console.log('[SUCCESS] Created summary file: README.md');
    }

    /**
     * Clean up temporary files
     */
    cleanup() {
        console.log('[INFO] Cleaning up temporary files...');

        try {
            if (fs.existsSync(TEMP_DIR)) {
                const files = fs.readdirSync(TEMP_DIR);
                files.forEach(file => {
                    fs.unlinkSync(path.join(TEMP_DIR, file));
                });
                fs.rmdirSync(TEMP_DIR);
                console.log('[SUCCESS] Cleanup completed');
            }
        } catch (error) {
            console.log('[WARNING] Cleanup warning:', error.message);
        }
    }

    /**
     * Main execution method
     */
    async run() {
        console.log('[INFO] Starting Test Automation Script Generator...\n');

        try {
            // Step 1: Check dependencies
            this.checkDependencies();

            // Step 2: Read test scenario document
            const scenarioContent = await this.readScenarioDocument();

            // Step 3: Read prompt template
            const promptTemplate = this.readPromptTemplate();

            // Step 4: Generate automation scripts using Gemini CLI
            const automationContent = await this.generateAutomationScripts(scenarioContent, promptTemplate);

            // Step 5: Parse and save individual feature files
            const savedFiles = await this.saveFeatureFiles(automationContent);

            console.log('\n[SUCCESS] Test Automation Script Generation Completed Successfully!');
            console.log(`[INFO] Output directory: ${OUTPUT_DIR}`);
            console.log(`[INFO] Generated ${savedFiles.length} feature files:`);
            savedFiles.forEach(file => {
                console.log(`[INFO]   - ${file.filename} (${file.featureName})`);
            });
            console.log(`[INFO] All feature files are ready for BDD testing with Playwright MCP and Gemini CLI.`);

        } catch (error) {
            console.error('\n[ERROR] Error:', error.message);
            process.exit(1);
        } finally {
            this.cleanup();
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const generator = new TestAutomationGenerator();
    generator.run();
}

module.exports = TestAutomationGenerator;
