#!/usr/bin/env node

/**
 * Step Definition Generator Utility
 *
 * This utility:
 * 1. Reads feature files from reviwedScript/ directory
 * 2. Uses Gemini CLI with testStepGeneratorPrompt.md to generate step definition files
 * 3. Saves the generated step definition files to step-definitions folder
 *
 * Usage: node scripts/stepdefGenerator.js [feature-file-name]
 * Example: node scripts/stepdefGenerator.js checkout-process.feature
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

// File paths
const FEATURES_DIR = path.join(__dirname, '..', 'reviwedScript');
const PROMPT_PATH = path.join(__dirname, '..', 'systemPrompts', 'testStepGeneratorPrompt.md');
const TEMP_DIR = path.join(__dirname, '..', config.paths.tempDir);
const OUTPUT_DIR = path.join(__dirname, '..', 'step-definitions');

/**
 * Step Definition Generator Class
 */
class StepdefGenerator {
    constructor() {
        this.ensureDirectories();
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        [TEMP_DIR, OUTPUT_DIR].forEach(dir => {
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
            throw new Error('[ERROR] Gemini CLI not found.  Please install Gemini CLI first.');
        }
    }

    /**
     * Find feature files in reviwedScript directory
     */
    findFeatureFiles(specificFile = null) {
        if (!fs.existsSync(FEATURES_DIR)) {
            throw new Error(`[ERROR] ReviwedScript directory not found: ${FEATURES_DIR}`);
        }

        // Find .feature files
        const files = fs.readdirSync(FEATURES_DIR)
            .filter(file => file.endsWith('.feature'))
            .map(file => ({
                name: file,
                path: path.join(FEATURES_DIR, file)
            }));

        if (specificFile) {
            const found = files.find(f => f.name === specificFile);
            if (!found) {
                throw new Error(`[ERROR] Feature file not found: ${specificFile}`);
            }
            return [found];
        }

        return files;
    }

    /**
     * Read feature file content
     */
    readFeatureFile(featureFilePath) {
        console.log(`[INFO] Reading feature file: ${path.basename(featureFilePath)}`);
        
        if (!fs.existsSync(featureFilePath)) {
            throw new Error(`[ERROR] Feature file not found: ${featureFilePath}`);
        }

        return fs.readFileSync(featureFilePath, 'utf8');
    }

    /**
     * Read prompt template
     */
    readPromptTemplate() {
        console.log('[INFO] Reading step definition prompt template...');
        
        if (!fs.existsSync(PROMPT_PATH)) {
            throw new Error(`[ERROR] Prompt template not found: ${PROMPT_PATH}`);
        }

        return fs.readFileSync(PROMPT_PATH, 'utf8');
    }

    /**
     * Generate step definition using Gemini CLI
     */
    async generateStepDefinition(featureContent, promptTemplate, featureName) {
        console.log(`[INFO] Generating step definition for: ${featureName}`);

        // Create temporary files for input
        const tempFeatureFile = path.join(TEMP_DIR, `temp-feature-${Date.now()}.feature`);
        const tempPromptFile = path.join(TEMP_DIR, `temp-prompt-${Date.now()}.md`);
        const tempOutputFile = path.join(TEMP_DIR, `temp-output-${Date.now()}.js`);

        try {
            // Write feature content to temp file
            fs.writeFileSync(tempFeatureFile, featureContent);

            // Combine prompt template with feature content
            const combinedPrompt = `${promptTemplate}\n\nFEATURE FILE CONTENT:\n\n${featureContent}`;
            fs.writeFileSync(tempPromptFile, combinedPrompt);

            // Execute Gemini CLI command
            console.log('[INFO] Calling Gemini CLI (this may take a moment)...');

            // Use proper Gemini CLI syntax with model parameter
            const geminiCommand = `type "${tempPromptFile}" | gemini --model "gemini-2.5-pro" > "${tempOutputFile}"`;
            execSync(geminiCommand, {
                stdio: 'pipe',
                shell: true,
                cwd: path.join(__dirname, '..')
            });

            // Read the generated step definition
            if (!fs.existsSync(tempOutputFile)) {
                throw new Error('Gemini CLI did not generate output file');
            }

            const stepDefinitionContent = fs.readFileSync(tempOutputFile, 'utf8');

            // Clean up temp files
            [tempFeatureFile, tempPromptFile, tempOutputFile].forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });

            return stepDefinitionContent;

        } catch (error) {
            // Clean up temp files on error
            [tempFeatureFile, tempPromptFile, tempOutputFile].forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });
            throw error;
        }
    }

    /**
     * Save step definition file
     */
    saveStepDefinitionFile(stepDefinitionContent, featureName) {
        // Generate filename: application-state-reset-functionality.feature -> application-state-reset-functionality.js
        const baseFilename = featureName.replace('.feature', '.js');
        const outputPath = path.join(OUTPUT_DIR, baseFilename);

        // Clean the content (remove any markdown code blocks if present)
        let cleanContent = stepDefinitionContent;
        
        // Remove markdown code blocks
        cleanContent = cleanContent.replace(/```javascript\n?/g, '');
        cleanContent = cleanContent.replace(/```\n?/g, '');
        
        // Ensure content is properly formatted
        cleanContent = cleanContent.trim();

        fs.writeFileSync(outputPath, cleanContent, 'utf8');
        console.log(`[SUCCESS] Created step definition file: ${baseFilename}`);
        
        return {
            filename: baseFilename,
            filepath: outputPath,
            size: fs.statSync(outputPath).size
        };
    }

    /**
     * Main execution method
     */
    async run(specificFeatureFile = null) {
        console.log('\n=== Step Definition Generator ===\n');
        
        try {
            // Step 1: Check dependencies
            this.checkDependencies();

            // Step 2: Find feature files
            const featureFiles = this.findFeatureFiles(specificFeatureFile);
            console.log(`[INFO] Found ${featureFiles.length} feature file(s) to process`);

            // Step 3: Read prompt template
            const promptTemplate = this.readPromptTemplate();

            // Step 4: Process each feature file
            const results = [];
            
            for (const featureFile of featureFiles) {
                console.log(`\n[INFO] Processing: ${featureFile.name}`);
                
                // Read feature content
                const featureContent = this.readFeatureFile(featureFile.path);
                
                // Generate step definition
                const stepDefinitionContent = await this.generateStepDefinition(
                    featureContent, 
                    promptTemplate, 
                    featureFile.name
                );
                
                // Save step definition file
                const result = this.saveStepDefinitionFile(stepDefinitionContent, featureFile.name);
                results.push(result);
            }

            console.log('\n[SUCCESS] Step Definition Generation Completed Successfully!');
            console.log(`[INFO] Generated ${results.length} step definition file(s):`);
            
            results.forEach(result => {
                console.log(`  - ${result.filename} (${result.size} bytes)`);
            });

        } catch (error) {
            console.error('\n[ERROR] Step Definition Generation Failed:');
            console.error(error.message);
            process.exit(1);
        }
    }
}

// Main execution
if (require.main === module) {
    const specificFile = process.argv[2]; // Optional: specific feature file name
    const generator = new StepdefGenerator();
    generator.run(specificFile);
}

module.exports = StepdefGenerator;
