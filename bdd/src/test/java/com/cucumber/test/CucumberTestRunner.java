package com.cucumber.test;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(
  features = "src/test/resources/register_login_logout.feature",  // Path to the feature file
  glue = "com/cucumber/test"  // Path to step definitions
)
public class CucumberTestRunner {
}
