#!/usr/bin/env node

/**
 * Test Scenario Generator Utility
 * 
 * This utility:
 * 1. Reads test plan from saucedemoplan.docx
 * 2. Uses Gemini CLI to generate detailed test scenarios
 * 3. Converts response to saucedemoScenario.docx
 * 
 * Usage: node scripts/testScenarioGenerator.js
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

// Function to find the most recent test plan file
const findLatestTestPlan = () => {
    const testPlanDir = path.join(__dirname, '..', path.dirname(config.paths.testPlanOutput));

    if (!fs.existsSync(testPlanDir)) {
        throw new Error(`Test plan directory not found: ${testPlanDir}`);
    }

    const files = fs.readdirSync(testPlanDir)
        .filter(file => file.startsWith('saucedemoplan') && file.endsWith('.docx'))
        .map(file => ({
            name: file,
            path: path.join(testPlanDir, file),
            stats: fs.statSync(path.join(testPlanDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

    if (files.length === 0) {
        throw new Error('No test plan files found. Please generate a test plan first.');
    }

    return files[0].path;
};

// File paths from config with timestamp
const TEST_PLAN_PATH = findLatestTestPlan();
const PROMPT_PATH = path.join(__dirname, '..', config.paths.testScenarioPrompt);
const TEMP_DIR = path.join(__dirname, '..', config.paths.tempDir);

// Generate timestamped output filename
const timestamp = generateTimestamp();
const outputDir = path.join(__dirname, '..', path.dirname(config.paths.testScenarioOutput));
const outputFilename = `saucedemoScenario${timestamp}.docx`;
const OUTPUT_PATH = path.join(outputDir, outputFilename);

class TestScenarioGenerator {
    constructor() {
        this.ensureDirectories();
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        const dirs = [
            path.dirname(OUTPUT_PATH),
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
        const requiredPackages = ['mammoth', 'officegen'];
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
     * Read and extract text from test plan DOCX file
     */
    async readTestPlanDocument() {
        console.log('[INFO] Reading test plan document...');
        console.log(`[INFO] Using test plan file: ${path.basename(TEST_PLAN_PATH)}`);

        if (!fs.existsSync(TEST_PLAN_PATH)) {
            throw new Error(`Test plan file not found: ${TEST_PLAN_PATH}`);
        }

        try {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: TEST_PLAN_PATH });
            
            if (result.messages.length > 0) {
                console.log('[WARNING] Warnings while reading DOCX:', result.messages);
            }
            
            console.log('[SUCCESS] Test plan document read successfully');
            return result.value;
        } catch (error) {
            throw new Error(`Failed to read test plan document: ${error.message}`);
        }
    }

    /**
     * Read the test scenario generator prompt
     */
    readPromptTemplate() {
        console.log('[INFO] Reading prompt template...');
        
        if (!fs.existsSync(PROMPT_PATH)) {
            throw new Error(`Prompt file not found: ${PROMPT_PATH}`);
        }

        const promptContent = fs.readFileSync(PROMPT_PATH, 'utf8');
        console.log('[SUCCESS] Prompt template read successfully');
        return promptContent;
    }

    /**
     * Generate test scenarios using Gemini CLI
     */
    async generateTestScenarios(testPlanContent, promptTemplate) {
        console.log('[INFO] Generating test scenarios with Gemini CLI...');
        
        // Create temporary files for input
        const tempTestPlanFile = path.join(TEMP_DIR, 'testplan_content.txt');
        const tempPromptFile = path.join(TEMP_DIR, 'combined_prompt.txt');
        const tempOutputFile = path.join(TEMP_DIR, 'test_scenarios_output.md');

        try {
            // Write test plan content to temp file
            fs.writeFileSync(tempTestPlanFile, testPlanContent);
            
            // Combine prompt template with test plan content
            const combinedPrompt = `${promptTemplate}\n\n---\n\nTEST PLAN CONTENT TO ANALYZE:\n\n${testPlanContent}`;
            fs.writeFileSync(tempPromptFile, combinedPrompt);

            // Execute Gemini CLI command
            console.log('[INFO] Calling Gemini CLI (this may take a moment)...');
            
            // Use proper Gemini CLI syntax with model parameter: read from stdin
            const geminiCommand = `type "${tempPromptFile}" | gemini --model "gemini-2.5-flash-lite-preview-06-17" > "${tempOutputFile}"`;
            execSync(geminiCommand, {
                stdio: 'pipe',
                shell: true,
                cwd: path.join(__dirname, '..')
            });

            // Read the generated test scenarios
            if (!fs.existsSync(tempOutputFile)) {
                throw new Error('Gemini CLI did not generate output file');
            }

            const testScenariosContent = fs.readFileSync(tempOutputFile, 'utf8');
            
            if (!testScenariosContent.trim()) {
                throw new Error('Gemini CLI generated empty response');
            }

            console.log('[SUCCESS] Test scenarios generated successfully');
            return testScenariosContent;

        } catch (error) {
            throw new Error(`Failed to generate test scenarios: ${error.message}`);
        }
    }

    /**
     * Convert markdown test scenarios to DOCX format
     */
    async convertToDocx(testScenariosContent) {
        console.log('[INFO] Converting test scenarios to DOCX format...');
        
        try {
            const officegen = require('officegen');
            
            // Create a new DOCX document
            const docx = officegen('docx');
            
            // Set document properties from config
            docx.setDocTitle(config.docx.testScenario.title);
            docx.setDocSubject(config.docx.testScenario.subject);
            docx.setDocKeywords(config.docx.testScenario.keywords);
            docx.setDescription(config.docx.testScenario.description);

            // Process markdown content and add to document
            this.processMarkdownToDocx(docx, testScenariosContent);

            // Save the document
            return new Promise((resolve, reject) => {
                const output = fs.createWriteStream(OUTPUT_PATH);
                
                output.on('error', (err) => {
                    reject(new Error(`Failed to write DOCX file: ${err.message}`));
                });

                output.on('close', () => {
                    console.log('[SUCCESS] Test scenarios saved as DOCX successfully');
                    resolve(OUTPUT_PATH);
                });

                docx.generate(output);
            });

        } catch (error) {
            throw new Error(`Failed to convert to DOCX: ${error.message}`);
        }
    }

    /**
     * Process markdown content and add to DOCX document
     */
    processMarkdownToDocx(docx, markdownContent) {
        const lines = markdownContent.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) {
                // Add empty paragraph for spacing
                docx.createP();
                continue;
            }

            // Handle different markdown elements
            if (line.startsWith('# ')) {
                // Main heading
                const heading = docx.createP();
                heading.addText(line.substring(2), { bold: true, font_size: 16 });
            } else if (line.startsWith('## ')) {
                // Sub heading
                const subheading = docx.createP();
                subheading.addText(line.substring(3), { bold: true, font_size: 14 });
            } else if (line.startsWith('### ')) {
                // Sub-sub heading
                const subsubheading = docx.createP();
                subsubheading.addText(line.substring(4), { bold: true, font_size: 12 });
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                // Bullet point
                const bullet = docx.createP();
                bullet.addText(line.substring(2));
            } else if (line.match(/^\d+\. /)) {
                // Numbered list
                const numbered = docx.createP();
                numbered.addText(line);
            } else {
                // Regular paragraph
                const paragraph = docx.createP();
                
                // Handle bold text **text**
                if (line.includes('**')) {
                    this.addFormattedText(paragraph, line);
                } else {
                    paragraph.addText(line);
                }
            }
        }
    }

    /**
     * Add formatted text with bold support
     */
    addFormattedText(paragraph, text) {
        const parts = text.split('**');
        
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                // Regular text
                if (parts[i]) {
                    paragraph.addText(parts[i]);
                }
            } else {
                // Bold text
                if (parts[i]) {
                    paragraph.addText(parts[i], { bold: true });
                }
            }
        }
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
        console.log('[INFO] Starting Test Scenario Generator...\n');
        
        try {
            // Step 1: Check dependencies
            this.checkDependencies();
            
            // Step 2: Read test plan document
            const testPlanContent = await this.readTestPlanDocument();
            
            // Step 3: Read prompt template
            const promptTemplate = this.readPromptTemplate();
            
            // Step 4: Generate test scenarios using Gemini CLI
            const testScenariosContent = await this.generateTestScenarios(testPlanContent, promptTemplate);
            
            // Step 5: Convert to DOCX
            const outputPath = await this.convertToDocx(testScenariosContent);
            
            console.log('\n[SUCCESS] Test Scenario Generation Completed Successfully!');
            console.log(`[INFO] Output file: ${outputPath}`);
            console.log(`[INFO] Filename: ${outputFilename}`);
            console.log(`[INFO] File size: ${fs.statSync(outputPath).size} bytes`);
            
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
    const generator = new TestScenarioGenerator();
    generator.run();
}

module.exports = TestScenarioGenerator;
