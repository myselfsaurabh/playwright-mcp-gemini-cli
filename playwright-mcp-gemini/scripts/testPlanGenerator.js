#!/usr/bin/env node

/**
 * Test Plan Generator Utility
 * 
 * This utility:
 * 1. Reads PRD from SauceDemo_PRD.docx
 * 2. Uses Gemini CLI to generate detailed test plan
 * 3. Converts response to saucedemoplan.docx
 * 
 * Usage: node scripts/testPlanGenerator.js
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
const PRD_PATH = path.join(__dirname, '..', config.paths.prd);
const PROMPT_PATH = path.join(__dirname, '..', config.paths.testPlanPrompt);
const TEMP_DIR = path.join(__dirname, '..', config.paths.tempDir);

// Generate timestamped output filename
const timestamp = generateTimestamp();
const outputDir = path.join(__dirname, '..', path.dirname(config.paths.testPlanOutput));
const outputFilename = `saucedemoplan${timestamp}.docx`;
const OUTPUT_PATH = path.join(outputDir, outputFilename);

class TestPlanGenerator {
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
     * Read and extract text from DOCX file
     */
    async readPRDDocument() {
        console.log('[INFO] Reading PRD document...');

        if (!fs.existsSync(PRD_PATH)) {
            throw new Error(`PRD file not found: ${PRD_PATH}`);
        }

        try {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ path: PRD_PATH });

            if (result.messages.length > 0) {
                console.log('[WARNING] Warnings while reading DOCX:', result.messages);
            }

            console.log('[SUCCESS] PRD document read successfully');
            return result.value;
        } catch (error) {
            throw new Error(`Failed to read PRD document: ${error.message}`);
        }
    }

    /**
     * Read the test plan generator prompt
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
     * Generate test plan using Gemini CLI
     */
    async generateTestPlan(prdContent, promptTemplate) {
        console.log('[INFO] Generating test plan with Gemini CLI...');

        // Create temporary files for input
        const tempPrdFile = path.join(TEMP_DIR, 'prd_content.txt');
        const tempPromptFile = path.join(TEMP_DIR, 'combined_prompt.txt');
        const tempOutputFile = path.join(TEMP_DIR, 'test_plan_output.md');

        try {
            // Write PRD content to temp file
            fs.writeFileSync(tempPrdFile, prdContent);

            // Combine prompt template with PRD content
            const combinedPrompt = `${promptTemplate}\n\n---\n\nPRD CONTENT TO ANALYZE:\n\n${prdContent}`;
            fs.writeFileSync(tempPromptFile, combinedPrompt);

            // Execute Gemini CLI command
            console.log('[INFO] Calling Gemini CLI (this may take a moment)...');

            // Use proper Gemini CLI syntax with model parameter: read from stdin and use -p for prompt
            const geminiCommand = `type "${tempPromptFile}" | gemini --model "gemini-2.5-flash-lite-preview-06-17" > "${tempOutputFile}"`;
            execSync(geminiCommand, {
                stdio: 'pipe',
                shell: true,
                cwd: path.join(__dirname, '..')
            });

            // Read the generated test plan
            if (!fs.existsSync(tempOutputFile)) {
                throw new Error('Gemini CLI did not generate output file');
            }

            const testPlanContent = fs.readFileSync(tempOutputFile, 'utf8');

            if (!testPlanContent.trim()) {
                throw new Error('Gemini CLI generated empty response');
            }

            console.log('[SUCCESS] Test plan generated successfully');
            return testPlanContent;

        } catch (error) {
            throw new Error(`Failed to generate test plan: ${error.message}`);
        }
    }

    /**
     * Convert markdown test plan to DOCX format
     */
    async convertToDocx(testPlanContent) {
        console.log('[INFO] Converting test plan to DOCX format...');

        try {
            const officegen = require('officegen');

            // Create a new DOCX document
            const docx = officegen('docx');

            // Set document properties from config
            docx.setDocTitle(config.docx.testPlan.title);
            docx.setDocSubject(config.docx.testPlan.subject);
            docx.setDocKeywords(config.docx.testPlan.keywords);
            docx.setDescription(config.docx.testPlan.description);

            // Process markdown content and add to document
            this.processMarkdownToDocx(docx, testPlanContent);

            // Save the document
            return new Promise((resolve, reject) => {
                const output = fs.createWriteStream(OUTPUT_PATH);

                output.on('error', (err) => {
                    reject(new Error(`Failed to write DOCX file: ${err.message}`));
                });

                output.on('close', () => {
                    console.log('[SUCCESS] Test plan saved as DOCX successfully');
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
        console.log('[INFO] Starting Test Plan Generator...\n');

        try {
            // Step 1: Check dependencies
            this.checkDependencies();

            // Step 2: Read PRD document
            const prdContent = await this.readPRDDocument();

            // Step 3: Read prompt template
            const promptTemplate = this.readPromptTemplate();

            // Step 4: Generate test plan using Gemini CLI
            const testPlanContent = await this.generateTestPlan(prdContent, promptTemplate);

            // Step 5: Convert to DOCX
            const outputPath = await this.convertToDocx(testPlanContent);

            console.log('\n[SUCCESS] Test Plan Generation Completed Successfully!');
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
    const generator = new TestPlanGenerator();
    generator.run();
}

module.exports = TestPlanGenerator;
