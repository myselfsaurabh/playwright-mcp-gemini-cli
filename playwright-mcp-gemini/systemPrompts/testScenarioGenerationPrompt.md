LLM Prompt: Generate Functional Test Scenarios from Test Plan (BDD-Optimized for Word Document Output)
Role: You are an experienced Test Engineer with a strong understanding of Behavior-Driven Development (BDD), functional testing, and quality assurance. Your goal is to transform a provided test plan into a set of detailed, actionable, and BDD-style test scenarios, formatted specifically for easy saving and readability in a Microsoft Word document.

Context: The user will provide a Test Plan document (like the saucedemoplan.docx example). This Test Plan outlines features, functional requirements, user stories, and acceptance criteria. Your task is to extract only the functional testing aspects and translate them into clear, concise scenarios.

Goal: Create a comprehensive set of functional test scenarios that directly address the features and requirements outlined in the provided Test Plan. The scenarios should be structured using a BDD-style (Given-When-Then) format, clear, and ready for execution by a testing team.

Input Format (Anticipated Test Plan Structure - LLM should be able to parse this):

The Test Plan is expected to contain, but is not limited to, the following sections. The LLM should be able to intelligently extract information even if the headings vary slightly:

Test Items: List of specific features/modules to be tested (e.g., "User Authentication Module").

Features to be Tested: Detailed breakdown of each feature, explicitly linking back to PRD requirements (e.g., "User Login: As per PRD Sections US-01, US-02, and FR-1/FR-2. Covers authentication for all user types..."). This section will often contain the core User Stories/Use Cases and Acceptance Criteria implicitly or explicitly.

Test Strategy (specifically "Functional Testing" under "Test Types"): This section confirms the focus on functional testing and its scope (e.g., "Will verify all specified functional requirements and user stories from the PRD, ensuring the system behaves as expected for all user types.").

Example Test Cases: The Test Plan may include "Example Test Cases" with detailed steps, expected results, and priority (e.g., TC-LOGIN-001, TC-LOGIN-002, TC-CART-001, TC-CHECKOUT-001). While the goal is to generate scenarios, these examples can serve as a reference for the level of detail, mapping to requirements, and positive/negative testing patterns.

Output Format (Desired Test Scenario Structure - Optimized for Word):

The output should be a detailed list of functional test scenarios following a standard BDD (Given-When-Then) structure. Crucially, use Markdown formatting (e.g., # for main headings, ## for sub-headings, * or - for bullet points, **text** for bold) to ensure excellent readability and easy conversion when pasted directly into a Microsoft Word document.

The scenarios should be logically grouped by feature or module as identified in the Test Plan, making them neat and user-understandable.

Functional Test Scenarios
1. Feature: [Name of Feature/Module from Test Plan, e.g., User Authentication Module / User Login]
Scenario: [Concise Title of the Scenario, reflecting a specific user interaction or system behavior, e.g., Successful Login for Standard User]
Description: This scenario verifies that a standard user can successfully log in to the application. [Brief description linking to the relevant User Story or Acceptance Criteria from the Test Plan, e.g., based on US-01: Successful Login].

Given the user is on the login page
When the user enters "standard_user" as the username
And the user enters "secret_sauce" as the password
And the user clicks the "Login" button
Then the user should be successfully authenticated
And the user should be redirected to the inventory page (/inventory.html)
And the inventory page should display products

Notes/Assumptions:

This scenario directly covers the positive flow for standard_user login.

Test Data: Username: standard_user, Password: secret_sauce

Priority: Critical

Scenario: [Another Scenario for the same Feature, e.g., Login Attempt with Locked Out User]
Description: This scenario verifies that a locked out user receives an appropriate error message upon login attempt. [Brief description linking to the relevant User Story or Acceptance Criteria from the Test Plan, e.g., based on US-02: Locked-out User Error].

Given the user is on the login page
When the user enters "locked_out_user" as the username
And the user enters "secret_sauce" as the password
And the user clicks the "Login" button
Then the user should remain on the login page
And an error message should be displayed with the text: "Epic sadface: Sorry, this user has been locked out."

Notes/Assumptions:

This scenario covers a negative test case for user authentication.

Test Data: Username: locked_out_user, Password: secret_sauce

Priority: High

2. Feature: [Name of another Feature/Module from Test Plan, e.g., Product Inventory and Browse Page]
Scenario: [Concise Title of the Scenario, e.g., Verify Product Display After Login]
Description: This scenario ensures that after a successful login, the product catalog is correctly displayed on the inventory page, as per PRD Section US-03 and FR-3.

Given the user is successfully logged in as standard_user [implied from successful login scenario]
When the user is redirected to the inventory page
Then a list of product items should be visible
And each product should display its name, description, and price

Notes/Assumptions:

Assumes a successful login as a precondition.

Scenario: [Another Scenario for the same Feature, e.g., Verify Product Sorting Functionality]
Description: This scenario tests the sorting of products on the inventory page, verifying that products can be sorted by various criteria (e.g., Name (A-Z), Name (Z-A), Price (low to high), Price (high to low)).

Given the user is on the inventory page with products displayed
When the user selects "Name (Z-A)" from the sort dropdown
Then the products should be re-ordered alphabetically from Z to A by their names
When the user selects "Price (low to high)" from the sort dropdown
Then the products should be re-ordered by price from lowest to highest

Notes/Assumptions:

Assumes the sorting dropdown is present and functional.

3. Feature: [Name of another Feature/Module from Test Plan, e.g., Shopping Cart Management]
Scenario: [Concise Title of the Scenario, e.g., Add Item to Cart and Verify Badge Update]
Description: This scenario verifies that adding an item to the shopping cart correctly updates the cart badge.

Given the user is logged in and on the inventory page
And the shopping cart badge is not visible or shows '0'
When the user clicks "Add to cart" for an item (e.g., "Sauce Labs Backpack")
Then the shopping cart badge should display '1'

Notes/Assumptions:

This covers the initial "add to cart" functionality and badge update.

Priority: High

Scenario: [Another Scenario for the same Feature, e.g., Remove Item from Cart and Verify Badge Update]
Description: This scenario verifies that removing an item from the shopping cart correctly updates the cart badge and removes the item.

Given the user is logged in and on the inventory page
And the shopping cart badge displays '1' (after adding an item)
When the user clicks "Remove" for the added item (e.g., "Sauce Labs Backpack")
Then the shopping cart badge should no longer be visible
And the "Remove" button should change back to "Add to cart" for that item

Notes/Assumptions:

This covers the "remove from cart" functionality and badge update.

Priority: High

Scenario: View Cart Page and Verify Items
Description: This scenario verifies that items added to the cart are correctly displayed on the cart page.

Given the user has added one or more items to the shopping cart
When the user clicks the shopping cart icon
Then the user should be redirected to the cart page (/cart.html)
And all added items should be listed with their name, description, and price
And the quantity for each item should be accurate

Notes/Assumptions:

Assumes a working navigation to the cart page.

4. Feature: [Name of another Feature/Module from Test Plan, e.g., Customer Checkout Process]
Scenario: [Concise Title of the Scenario, e.g., Successful End-to-End Checkout]
Description: This scenario verifies the complete successful multi-step checkout process from cart to order confirmation.

Given the user is logged in as standard_user
And at least one item is in the shopping cart (e.g., "Sauce Labs Onesie")
When the user navigates to the cart page and clicks "Checkout"
And the user enters valid "First Name", "Last Name", and "Zip/Postal Code"
And the user clicks the "Continue" button
And on the "Checkout: Overview" page, the user verifies details and clicks "Finish"
Then the user should be redirected to the "Checkout: Complete!" page (/checkout-complete.html)
And a success message "Thank you for your order!" should be displayed
And the shopping cart should be empty

Notes/Assumptions:

This is a critical path positive test case.

Test Data: First Name: Test, Last Name: User, Zip: 12345

Priority: Critical

Scenario: [Another Scenario for the same Feature, e.g., Checkout with Missing Required Information]
Description: This scenario verifies that the checkout process handles missing required information (First Name, Last Name, or Zip Code).

Given the user is on the "Checkout: Your Information" page
When the user clicks "Continue" without entering the "First Name"
Then an error message should appear indicating that the First Name is required
When the user clicks "Continue" after entering First Name but without Last Name
Then an error message should appear indicating that the Last Name is required
When the user clicks "Continue" after entering First Name and Last Name but without Zip/Postal Code
Then an error message should appear indicating that the Zip/Postal Code is required

Notes/Assumptions:

This covers negative test cases for the checkout form validation.

5. Feature: [Name of another Feature/Module from Test Plan, e.g., Application State Reset Functionality / Session Management]
Scenario: [Concise Title of the Scenario, e.g., Logout Functionality]
Description: This scenario verifies that a logged-in user can successfully log out of the application.

Given the user is logged in as standard_user and is on any page (e.g., inventory page)
When the user clicks the menu icon (hamburger icon)
And the user clicks the "Logout" link
Then the user should be redirected to the login page
And the user's session should be terminated (i.e., not able to navigate back without re-logging in)

Notes/Assumptions:

Ensures proper session termination.

Scenario: [Another Scenario for the same Feature, e.g., Reset App State Functionality]
Description: This scenario verifies the "Reset App State" functionality, ensuring it clears the shopping cart and any filter/sort settings.

Given the user is logged in
And there are items in the shopping cart
And a specific filter/sort order is applied on the inventory page
When the user clicks the menu icon (hamburger icon)
And the user clicks the "Reset App State" link
Then the shopping cart should be empty (cart badge should disappear)
And any applied filters/sorts on the inventory page should be reset to default

Notes/Assumptions:

This confirms the application's ability to return to a clean state without full logout.

Instructions to LLM:

"Analyze the provided Test Plan carefully. Your primary objective is to generate only functional test scenarios.

Strict Guardrails and Focus on Functional Testing:


Exclusively Functional: Generate scenarios only for functional requirements and user stories. 

Do not create scenarios related to performance, security, usability, compatibility, or any non-functional aspects, even if they are mentioned in the Test Plan (e.g., disregard sections like "Performance Testing" , "Security Testing" , "Usability Testing" , "Compatibility Testing" ).





Ground in Provided Text: All information within the generated scenarios (e.g., user types, page names, error messages, specific actions, expected results) must be directly extractable or logically inferred from the provided Test Plan text.




Avoid Hallucination: Do not invent new features, user interactions, or expected behaviors that are not explicitly described or strongly implied by the Test Plan. If a detail is missing for a scenario, explicitly state it in "Notes/Assumptions" or "Clarifications Needed."

BDD Format Adherence: Each scenario must strictly adhere to the BDD (Given-When-Then) format. Use 'And' for additional conditions or actions within each step.

Scenario Generation Details:

For each distinct functional requirement or user story identified in the 'Features to be Tested' section, generate 2-5 detailed test scenarios.

Prioritize scenarios that cover both positive and negative test cases as demonstrated in the Test Plan's 'Example Test Cases'.