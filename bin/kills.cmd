@echo off

call wmic process where "name like 'chrome.exe'" delete
call wmic process where "name like 'webdriver.exe'" delete
call wmic process where "name like 'chromedriver.exe'" delete
call wmic process where "name like 'php.exe'" delete
call wmic process where "name like 'python.exe'" delete
call wmic process where "name like 'node.exe'" delete