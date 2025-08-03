Feature: Website Automation with Gemini CLI
  As a test automation engineer
  I want to test websites using Gemini CLI with Playwright MCP
  So that I can verify website functionality with BDD approach

  @login @smoke
  Scenario Outline: Test website login with different credentials
    Given I have test data  for "<website>"
    When I execute gemini command to navigate and login with "<username>" and "<password>"
    Then I should capture screenshot and verify "<expectedResult>"

    Examples:
      | website                        | username        | password     | expectedResult |
      | https://www.saucedemo.com/     | standard_user   | secret_sauce | success        |
      | https://www.saucedemo.com/     | locked_out_user | secret_sauce | error          |
      | https://www.saucedemo.com/     | invalid_user    | wrong_pass   | error          |

  @search @regression
  Scenario: Search functionality test
    Given I navigate to "https://www.siemens.com/global/en.html"
    When I search for "sigreen" using gemini command
    Then I should see search results and take screenshot
