package com.cucumber.test;

import org.openqa.selenium.*;
import io.cucumber.java.en.*;
import static org.junit.Assert.assertTrue;
import io.cucumber.java.Before;
import io.cucumber.java.After;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;
import io.cucumber.datatable.DataTable;

public class RegisterLoginLogoutSteps {

    private WebDriver driver;

    @Before
    public void setUp() {
        // Make sure the path is correct
        System.setProperty("webdriver.chrome.driver", "C:\\Users\\Marie-C. Becker\\tools\\chromedriver-123\\chromedriver.exe");
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @Given("I navigate to the registration page")
    public void i_navigate_to_the_registration_page() {
        driver.get("http://localhost:4200/register");
    }

    @When("I fill in the registration form with the following details:")
    public void i_fill_in_the_registration_form_with_valid_details(DataTable table) {
        String name = table.cell(1, 0);
        String email = table.cell(1, 1);
        String password = table.cell(1, 2);
        String repeatPassword = table.cell(1, 3);
        String phoneNumber = table.cell(1, 4);

        WebElement nameElement = driver.findElement(By.id("name"));
        WebElement emailElement = driver.findElement(By.id("email"));
        WebElement passwordElement = driver.findElement(By.id("password"));
        WebElement repeatPasswordElement = driver.findElement(By.id("repeatPassword"));
        WebElement phoneNumberElement = driver.findElement(By.id("phone_number"));

        nameElement.sendKeys(name);
        emailElement.sendKeys(email);
        passwordElement.sendKeys(password);
        repeatPasswordElement.sendKeys(repeatPassword);
        phoneNumberElement.sendKeys(phoneNumber);
    }
    
    @When("I submit the registration form")
    public void i_submit_the_registration_form() {
        WebElement submitBtn = driver.findElement(By.id("submitBtn"));
        
        // Scroll to the submit button to ensure it's in view
        scrollToElement(submitBtn);
        
        // Wait for the submit button to be clickable before clicking
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.elementToBeClickable(submitBtn));

        submitBtn.click();
    }

    @Then("I should be redirected to the login page")
    public void i_should_be_redirected_to_the_login_page() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.urlContains("/login"));
        assertTrue("Registration did not redirect to login page!", driver.getCurrentUrl().contains("/login"));
    }

    @Given("I am on the login page")
    public void i_am_on_the_login_page() {
        driver.get("http://localhost:4200/login");
    }

    @When("I enter the following login details:")
    public void i_enter_the_registered_email_and_password(DataTable table) {
        String email = table.cell(1, 0);
        String password = table.cell(1, 1);

        WebElement loginEmail = driver.findElement(By.id("email"));
        WebElement loginPassword = driver.findElement(By.id("password"));

        loginEmail.sendKeys(email);
        loginPassword.sendKeys(password);
    }

    @When("I click on the login button")
    public void i_click_on_the_login_button() {
        WebElement loginBtn = driver.findElement(By.id("loginBtn"));
        loginBtn.click();
    }

    @Then("I should be redirected to the meetings page")
    public void i_should_be_redirected_to_the_meetings_page() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.urlContains("/meetings"));
        assertTrue("Login did not redirect to meetings page!", driver.getCurrentUrl().contains("/meetings"));
    }

    @When("I book a meeting with the following details:")
    public void i_book_a_meeting_with_valid_details(DataTable table) {
        String meetingDate = table.cell(1, 0);
        String startTime = table.cell(1, 1);
        String title = table.cell(1, 2);
        String numPeople = table.cell(1, 3);
        String description = table.cell(1, 4);
        String duration = table.cell(1, 5);

        WebElement meetingDateElement = driver.findElement(By.id("meetingDate"));
        WebElement startTimeElement = driver.findElement(By.id("startTime"));
        WebElement titleElement = driver.findElement(By.id("title"));
        WebElement numPeopleElement = driver.findElement(By.id("numPeople"));
        WebElement descriptionElement = driver.findElement(By.id("description"));
        WebElement durationElement = driver.findElement(By.id("duration"));
        WebElement submitBtn = driver.findElement(By.id("submitBtn"));

        // Fill in the meeting details
        meetingDateElement.sendKeys(meetingDate);
        startTimeElement.sendKeys(startTime);
        titleElement.sendKeys(title);
        numPeopleElement.sendKeys(numPeople);
        descriptionElement.sendKeys(description);
        durationElement.sendKeys(duration);

        // Scroll to the submit button to ensure it's in view
        scrollToElement(submitBtn);

        // Wait for the submit button to be clickable
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.elementToBeClickable(submitBtn));

        // Submit the form
        submitBtn.click();

        // Wait for form submission to process and for the success message to appear
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));
        assertTrue("Success message was not displayed!", successMessage.isDisplayed());
    }
    
    
    
    @When("I edit a meeting with the following details:")
    public void i_edit_a_meeting_with_the_following_details(DataTable table) {
        String meetingId = table.cell(1, 6); // Assuming meetingId is in the DataTable

        // Wait for the Edit button to be clickable
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        WebElement editButton = driver.findElement(By.id("editBtn-" + meetingId));
        
        // Scroll to the Edit button to make sure it's in the view
        scrollToElement(editButton);

        // Wait for the Edit button to be clickable
        wait.until(ExpectedConditions.elementToBeClickable(editButton));
        
        // If the button is clickable, click it
        System.out.println("Clicking the edit button with ID: " + "editBtn-" + meetingId);  // Debugging output
        editButton.click();
        
        // Wait for 2 seconds to give time for the input fields to become visible after toggling
        try {
            Thread.sleep(2000);  // 2 seconds delay
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // Proceed with editing the meeting
        String meetingDate = table.cell(1, 0);
        String startTime = table.cell(1, 1);
        String title = table.cell(1, 2);
        String numPeople = table.cell(1, 3);
        String description = table.cell(1, 4);
        

        // Find the elements using the same method as the edit button and wait for them to be clickable
        WebElement meetingDateElement = wait.until(ExpectedConditions.elementToBeClickable(By.id("date-" + meetingId)));
        WebElement startTimeElement = wait.until(ExpectedConditions.elementToBeClickable(By.id("startTime-" + meetingId)));
        WebElement titleElement = wait.until(ExpectedConditions.elementToBeClickable(By.id("title-" + meetingId)));
        WebElement numPeopleElement = wait.until(ExpectedConditions.elementToBeClickable(By.id("numPeople-" + meetingId)));
        WebElement descriptionElement = wait.until(ExpectedConditions.elementToBeClickable(By.id("description-" + meetingId)));
        
        // Populate the form with new details
        meetingDateElement.clear();
        meetingDateElement.sendKeys(meetingDate);

        startTimeElement.clear();
        startTimeElement.sendKeys(startTime);

        titleElement.clear();
        titleElement.sendKeys(title);

        numPeopleElement.clear();
        numPeopleElement.sendKeys(numPeople);

        descriptionElement.clear();
        descriptionElement.sendKeys(description);


        // Scroll to the submit button to ensure it's in view
        WebElement saveBtn = driver.findElement(By.id("saveBtn-" + meetingId));
        scrollToElement(saveBtn);

        // Wait for the save button to be visible and enabled
        wait.until(ExpectedConditions.and(
            ExpectedConditions.visibilityOf(saveBtn),
            ExpectedConditions.elementToBeClickable(saveBtn)
        ));

        // Submit the form
        System.out.println("Clicking the save button with ID: " + "saveBtn-" + meetingId);  // Debugging output
        saveBtn.click();

        // Wait for form submission to process and for the success message to appear
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));
        assertTrue("Success message for editing the meeting was not displayed!", successMessage.isDisplayed());
    }

    @Then("I should see a success message for updating the meeting")
    public void i_should_see_a_success_message_for_updating_the_meeting() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));
        assertTrue("Success message for updating the meeting was not displayed!", successMessage.isDisplayed());
    }
    
    @When("I delete a meeting")
    public void i_delete_a_meeting() {
        // Extract the meeting ID (e.g., from a DataTable or other context)
        String meetingId = "56";  // Replace with how you get the meeting ID
        
        // Wait for the Delete button to be clickable using the dynamic ID
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        
        // Find the delete button based on the dynamic ID, like "deleteBtn-" followed by the meeting ID
        WebElement deleteButton = driver.findElement(By.id("deleteBtn-" + meetingId));
        
        // Scroll to the Delete button to make sure it's in the view
        scrollToElement(deleteButton);
        
        // Wait for the Delete button to be clickable
        wait.until(ExpectedConditions.elementToBeClickable(deleteButton));
        
        // If the button is clickable, click it
        System.out.println("Clicking the delete button with ID: " + "deleteBtn-" + meetingId);  // Debugging output
        deleteButton.click();
        
        // Wait for the success message to appear after deletion
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));
        
        // Assert that the success message is displayed
        assertTrue("Success message was not displayed for deletion!", successMessage.isDisplayed());
    }


    @Then("I should see a success message for deleting the meeting")
    public void i_should_see_a_success_message_for_deleting_the_meeting() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));
        assertTrue("Success message for deleting the meeting was not displayed!", successMessage.isDisplayed());
    }



    @Then("I should see a success message for booking the meeting")
    public void i_should_see_a_success_message_for_booking_the_meeting() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));

        assertTrue("Success message for booking the meeting was not displayed!", successMessage.isDisplayed());
    }

    @When("I click the logout button")
    public void i_click_the_logout_button() {
        WebElement logoutBtn = driver.findElement(By.id("logoutBtn"));
        logoutBtn.click();
    }

    @Then("I should be redirected to the homepage")
    public void i_should_be_redirected_to_the_homepage() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.urlContains("/"));
        assertTrue("Logout did not redirect to homepage!", driver.getCurrentUrl().equals("http://localhost:4200/"));
    }
    
    @When("I enter my email into the subscription form and submit it")
    public void i_enter_my_email_into_the_subscription_form_and_submit_it() {
        // Define the email you want to subscribe with
        String emailToSubscribe = "testuser89@example.com";  // Replace with the actual email you want to test with

        // Find the email input field by ID
        WebElement emailInput = driver.findElement(By.id("subscribe"));
        
        // Enter the email into the input field
        emailInput.sendKeys(emailToSubscribe);

        // Find the submit button by ID
        WebElement submitButton = driver.findElement(By.id("submitSubscribe"));

        // Click the submit button
        submitButton.click();

        // Wait for the success message to appear (use an appropriate selector for the success message)
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));  // Replace with the actual success message ID or selector

        // Assert that the success message is displayed
        assertTrue("Success message for subscription was not displayed!", successMessage.isDisplayed());
    }

    @Then("I should see a success message for subscribing")
    public void i_should_see_a_success_message_for_subscribing() {
        // Wait for the success message to appear (adjust selector as needed)
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement successMessage = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("successMessage")));  // Replace with the correct ID or selector

        // Assert that the success message is displayed
        assertTrue("Success message for subscription was not displayed!", successMessage.isDisplayed());
    }


    // Helper method to scroll an element into view
    private void scrollToElement(WebElement element) {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});", element);

        try {
            Thread.sleep(1000); // Optional delay to ensure smooth scrolling
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
