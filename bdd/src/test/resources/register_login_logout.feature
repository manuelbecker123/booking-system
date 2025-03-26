Feature: Register, Login, Logout, and Manage Meetings

  Scenario: User registers, logs in, books a meeting, edits and deletes a meeting, and logs out successfully
    Given I navigate to the registration page
    When I fill in the registration form with the following details:
      | name          | email               | password       | repeatPassword  | phoneNumber |
      | Test User     | testuser51@example.com | TestPassword123 | TestPassword123 | 0791741069 |
    And I submit the registration form
    Then I should be redirected to the login page

    Given I am on the login page
    When I enter the following login details:
      | email               | password       |
      | testuser12@example.com | TestPassword123 |
    And I click on the login button
    Then I should be redirected to the meetings page

    When I book a meeting with the following details:
      | meetingDate | startTime | title         | numPeople | description              | duration |
      | 24-07-2025  | 15:00     | Test Meeting  | 5         | Meeting description here | 1hr      |
    Then I should see a success message for booking the meeting
    
	When I edit a meeting with the following details:
	  | meetingDate | startTime | title         | numPeople | description             | duration | meetingId |
	  | 24-07-2025  | 16:00     | Updated Title | 10        | Updated meeting details | 1hr      | 56     |
	Then I should see a success message for updating the meeting

    When I delete a meeting
    Then I should see a success message for deleting the meeting

    When I click the logout button
    Then I should be redirected to the homepage
    
    When I enter my email into the subscription form and submit it
    Then I should see a success message for subscribing
