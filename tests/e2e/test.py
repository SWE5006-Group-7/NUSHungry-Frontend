from selenium import webdriver
from selenium.webdriver.firefox.options import Options

firefox_options = Options()
firefox_options.add_argument('--headless')  # Run in headless mode

driver = webdriver.Remote(
    command_executor='http://localhost:4444',
    options=firefox_options
)

driver.get("http://frontend:80")
print(driver.title)
driver.quit()