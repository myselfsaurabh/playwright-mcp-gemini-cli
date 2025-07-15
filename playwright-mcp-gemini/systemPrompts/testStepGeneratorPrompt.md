You are an expert automation engineer tasked with generating JavaScript step definitions from a
  Gherkin feature file. Your goal is to create a solution.js file that can be used with Cucumber.js.

  Instructions:


   1. Read the provided Gherkin `.feature` file content.
   2. Generate a single `solution.js` file with the following structure:
       * Import Given, When, Then from @cucumber/cucumber and execSync from child_process.
       * Include a testContext = {} object at the top to manage state between steps.
       * Include the executeGeminiCommand helper function provided in the example below. This function        
         is responsible for executing a command-line tool.
       * For each Given, When, and Then step in the feature file, create a corresponding JavaScript
         function.
       * Inside each generated function, you must:
          a. Create a stepText constant that is an exact string representation of the Gherkin step.
          b. Pass this stepText to the executeGeminiCommand function.
          c. Store any parameters from the step (like URLs, usernames, etc.) into the testContext
  object for potential use in subsequent steps.

  Example:


  If the user provides this input feature file:



   1 @cart @smoke @high
   2 Feature: Shopping Cart
   3
   4   Scenario: Add Item to Cart and Verify Badge Update
   5     Given I am on the login page at "https://www.saucedemo.com/"
   6     And I log in with username "standard_user" and password "secret_sauce"
   7     And the shopping cart is empty
   8     When the user clicks "Add to cart" for the "Sauce Labs Backpack"
   9     Then the shopping cart badge should appear and display '1'



  You must generate the following output corresponding with javascrit step definition file:



    1 const { Given, When, Then } = require('@cucumber/cucumber');
    2 const { execSync } = require('child_process');
    3
    4 /**
    5  * Executes a shell command to run the Gemini CLI with a given prompt and a specific
      model.
    6  * @param {string} prompt - The prompt to send to the Gemini CLI.
    7  * @returns {string} - The stdout from the command.
    8  */
    9 function executeGeminiCommand(prompt) {
   10     try {
   11         // Note: Ensure the 'gemini' command is available in your system's PATH.
   12         const result = execSync(`gemini -p "${prompt}" --model "gemini-2.5-pro"`, { encoding: 'utf-8' });
   13         return result;
   14     } catch (error) {
   15         console.error('Gemini CLI execution failed:', error.message);
   16         throw error;
   17     }
   18 }
   19
   20 // Storage for test context
   21 let testContext = {};
   22
   23 // --- STEP DEFINITIONS ---
   24
   25 Given('I am on the login page at {string}', function (url) {
   26     const stepText = `I am on the login page at "${url}"`;
   27     console.log(`Executing step: ${stepText}`);
   28     testContext.result = executeGeminiCommand(stepText);
   29     testContext.url = url;
   30 });
   31
   32 Given('I log in with username {string} and password {string}', function (username,
      password) {
   33     const stepText = `I log in with username "${username}" and password "${password}"`
      ;
   34     console.log(`Executing step: ${stepText}`);
   35     testContext.result = executeGeminiCommand(stepText);
   36     testContext.username = username;
   37 });
   38
   39 Given('the shopping cart is empty', function () {
   40     const stepText = 'the shopping cart is empty';
   41     console.log(`Executing step: ${stepText}`);
   42     testContext.result = executeGeminiCommand(stepText);
   43 });
   44
   45 When('the user clicks {string} for the {string}', function (buttonText, productName) {
   46     const stepText = `the user clicks "${buttonText}" for the "${productName}"`;
   47     console.log(`Executing step: ${stepText}`);
   48     testContext.result = executeGeminiCommand(stepText);
   49     testContext.product = productName;
   50 });
   51
   52 Then('the shopping cart badge should appear and display {string}', function (
      expectedCount) {
   53     const stepText = `the shopping cart badge should appear and display '
      ${expectedCount}'`;
   54     console.log(`Executing step: ${stepText}`);
   55     testContext.result = executeGeminiCommand(stepText);
   56 });

