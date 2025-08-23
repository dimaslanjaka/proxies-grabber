import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-extra';
import sleep from './sleep.js';

/**
 * Get the absolute path of the current script.
 * @constant {string} __filename - The file path of the current module.
 * @constant {string} __dirname - The directory path of the current module.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * The absolute path for the user data directory.
 * @constant {string} userDataDir - The path to store browser profile data.
 */
const userDataDir = path.resolve(process.cwd(), '.cache/profile1');

/**
 * @type {import('puppeteer').Browser | null}
 */
let puppeteer_browser = null;
/**
 * @type {import('playwright').Browser | null}
 */
let playwright_browser = null;

/**
 * Launches a new browser instance using `puppeteer-extra` or reuses an existing one.
 *
 * @async
 * @function getPuppeteer
 * @param {Object} [options] - Optional configuration object.
 * @param {Object} [options.puppeteerOptions] - Options to pass to puppeteer.launch().
 * @returns {Promise<{page: import('puppeteer').Page, browser: import('puppeteer').Browser, puppeteer: typeof import('puppeteer-extra')}>}
 *   An object containing:
 *   - `page`: A new Puppeteer `Page` instance.
 *   - `browser`: The launched or reused Puppeteer `Browser` instance.
 *   - `puppeteer`: The `puppeteer-extra` module reference.
 */
export async function getPuppeteer(options = {}) {
  // Add stealth plugin and use defaults (all evasion techniques)
  puppeteer.use(StealthPlugin());

  if (!puppeteer_browser || !puppeteer_browser.connected) {
    let chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(chromePath)) {
      chromePath = undefined;
    }
    const puppeteerOptions = options.puppeteerOptions || {};
    puppeteer_browser = await puppeteer.launch({
      headless: false,
      userDataDir,
      executablePath: chromePath,
      args: [
        '--disable-blink-features=AutomationControlled', // Disables Blink feature: Automation Controlled.
        '--disable-features=HeavyAdIntervention', // Disable Chrome's blocking of intrusive ads
        '--disable-features=AdInterestGroupAPI', // Prevents blocking based on ad interest group
        '--disable-popup-blocking', // Disable pop-up blocking
        '--no-default-browser-check',
        '--no-first-run',
        '--ignore-certificate-errors',
        '--hide-crash-restore-bubble',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=1380,800',
        '--disable-legacy-window', // Disables legacy window support.
        '--disable-gpu', // Disables the GPU hardware acceleration.
        '--disable-dev-shm-usage', // Disables shared memory usage.
        '--disable-features=IsolateOrigins,site-per-process',
        '--blink-settings=imagesEnabled=true',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      ...puppeteerOptions
    });
  }

  const page = await puppeteer_browser.newPage();
  return { page, browser: puppeteer_browser, puppeteer };
}

/**
 * Enables logging of browser console messages to the Node.js console for a Puppeteer or Playwright page.
 *
 * @param {import('puppeteer').Page | import('playwright').Page} page - The page instance to attach the console logger to.
 */
export function enableDebug(page) {
  page.on('console', (msg) => {
    for (let i = 0; i < msg.args().length; ++i) console.log(`BROWSER LOG: ${msg.args()[i]}`);
  });
}

/**
 * Launches a new browser instance using Playwright or reuses an existing one.
 *
 * @async
 * @function getPlaywright
 * @param {Object} [options] - Optional configuration object.
 * @param {Object} [options.playwrightOptions] - Options to pass to chromium.launch().
 * @returns {Promise<{page: import('playwright').Page, browser: import('playwright').Browser, context: import('playwright').BrowserContext, playwright: typeof import('playwright').chromium}>}
 *   An object containing:
 *   - `page`: A new Playwright `Page` instance.
 *   - `browser`: The launched or reused Playwright `Browser` instance.
 *   - `context`: The Playwright `BrowserContext` instance.
 *   - `playwright`: The Playwright `chromium` module reference.
 */
export async function getPlaywright(options = {}) {
  // Add the plugin to playwright (any number of plugins can be added)
  chromium.use(StealthPlugin());

  if (!playwright_browser || !playwright_browser.isConnected()) {
    let chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(chromePath)) {
      chromePath = undefined;
    }
    const playwrightOptions = options.playwrightOptions || {};
    playwright_browser = await chromium.launch({
      headless: false,
      userDataDir,
      executablePath: chromePath,
      args: [
        '--disable-features=HeavyAdIntervention',
        '--disable-features=AdInterestGroupAPI',
        '--disable-popup-blocking',
        '--no-default-browser-check',
        '--no-first-run',
        '--ignore-certificate-errors',
        '--hide-crash-restore-bubble',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=1380,800',
        '--disable-legacy-window',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-features=IsolateOrigins,site-per-process',
        '--blink-settings=imagesEnabled=true',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      ...playwrightOptions
    });
  }

  const page = await playwright_browser.newPage();
  const context = await page.context();
  return { page, browser: playwright_browser, context, playwright: chromium };
}

/**
 * Closes the Puppeteer browser instance.
 * @async
 * @function closePuppeteer
 */
export async function closePuppeteer() {
  if (puppeteer_browser) {
    await puppeteer_browser.close();
    puppeteer_browser = null;
  }
}

/**
 * Clears an input field, types a value into it, and triggers input and change events.
 *
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} selector - The CSS selector for the input field.
 * @param {string} value - The value to type into the input field.
 * @returns {Promise<void>} - A promise that resolves after typing and triggering events.
 */
export async function typeAndTrigger(page, selector, value) {
  await page.focus(selector);

  // Clear the input field
  await page.evaluate((sel) => {
    const input = document.querySelector(sel);
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, selector);

  // Type the new value
  await page.type(selector, value, { delay: 100 });

  // Trigger input and change events
  await page.evaluate((sel) => {
    const input = document.querySelector(sel);
    if (input) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, selector);
  await page.keyboard.press('Tab');
  await sleep(300);
}

/**
 * Check if the element exists and optionally if it is visible
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} selector
 * @param {Object} [options] - Options object
 * @param {boolean} [options.visible=true] - Whether to check if the element is visible
 * @returns {Promise<boolean>} - Returns true if the element exists (and is visible if visible=true), otherwise false.
 */
export async function isElementExist(page, selector, options = {}) {
  const { visible = true } = options;
  const element = await page.$(selector);
  if (!element) return false;
  if (!visible) return true;
  // Check visibility using the same logic as isElementVisible
  return await page.evaluate((sel) => {
    const elem = document.querySelector(sel);
    if (!elem) return false;
    const style = window.getComputedStyle(elem);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      elem.offsetWidth > 0 &&
      elem.offsetHeight > 0 &&
      style.opacity !== '0'
    );
  }, selector);
}

/**
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} selector
 * @returns {Promise<boolean>}
 */
export async function isElementVisible(page, selector) {
  return await page.evaluate((sel) => {
    const elem = document.querySelector(sel);
    if (!elem) return false;

    const style = window.getComputedStyle(elem);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      elem.offsetWidth > 0 &&
      elem.offsetHeight > 0 &&
      style.opacity !== '0'
    );
  }, selector);
}

/**
 * Helper function to set value in an iframe element
 * @param {import('puppeteer').Page} page - Puppeteer page object
 * @param {string} iframeSelector - CSS selector for the iframe
 * @param {string} elementSelector - CSS selector for the target element (use #id for IDs)
 * @param {string} value - Value to set
 * @param {Object} options - Options object
 * @param {boolean} options.triggerEvents - Whether to trigger change/input events
 * @param {boolean} options.handleDisabled - Whether to temporarily enable disabled elements
 */
export async function setIframeElementValue(page, iframeSelector, elementSelector, value, options = {}) {
  const { triggerEvents = true, handleDisabled = true } = options;

  await page.evaluate(
    ({ iframeSelector, elementSelector, value, triggerEvents, handleDisabled }) => {
      const iframe = document.querySelector(iframeSelector);
      if (!iframe || !iframe.contentDocument) {
        throw new Error(`Iframe not found or not accessible: ${iframeSelector}`);
      }

      const element = iframe.contentDocument.querySelector(elementSelector);

      if (!element) {
        throw new Error(`Element not found: ${elementSelector}`);
      }

      let wasDisabled = false;
      if (handleDisabled && element.disabled) {
        wasDisabled = true;
        element.disabled = false;
      }

      // Set the value
      element.value = value;

      // Trigger events if requested
      if (triggerEvents) {
        const changeEvent = new iframe.contentWindow.Event('change', { bubbles: true });
        element.dispatchEvent(changeEvent);

        const inputEvent = new iframe.contentWindow.Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
      }

      // Restore disabled state if it was originally disabled
      if (wasDisabled) {
        element.disabled = true;
      }

      return true;
    },
    { iframeSelector, elementSelector, value, triggerEvents, handleDisabled }
  );
}

/**
 * Clears an input field inside an iframe, types a value into it, and triggers input and change events.
 * This is the iframe-compatible version of typeAndTrigger.
 *
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} iframeSelector - CSS selector for the iframe.
 * @param {string} elementSelector - CSS selector for the input field inside the iframe (use #id for IDs, .class for classes, etc.).
 * @param {string} value - The value to type into the input field.
 * @param {Object} options - Options object
 * @param {number} options.delay - Typing delay in milliseconds
 * @param {boolean} options.clearFirst - Whether to clear the field before typing
 * @returns {Promise<void>} - A promise that resolves after typing and triggering events.
 */
export async function typeAndTriggerIframe(page, iframeSelector, elementSelector, value, options = {}) {
  const { delay = 100, clearFirst = true } = options;

  await page.evaluate(
    ({ iframeSelector, elementSelector, value, delay, clearFirst }) => {
      const iframe = document.querySelector(iframeSelector);
      if (!iframe || !iframe.contentDocument) {
        throw new Error(`Iframe not found or not accessible: ${iframeSelector}`);
      }

      const element = iframe.contentDocument.querySelector(elementSelector);

      if (!element) {
        throw new Error(`Element not found: ${elementSelector}`);
      }

      // Focus the element
      element.focus();

      // Clear the field if requested
      if (clearFirst) {
        element.value = '';
        element.dispatchEvent(new iframe.contentWindow.Event('input', { bubbles: true }));
      }

      // Type the value character by character with delay
      let currentValue = element.value;
      const typeChar = (char, index) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            currentValue += char;
            element.value = currentValue;

            // Trigger input event for each character
            element.dispatchEvent(new iframe.contentWindow.Event('input', { bubbles: true }));
            resolve();
          }, index * delay);
        });
      };

      // Type all characters
      const typePromises = Array.from(value).map((char, index) => typeChar(char, index));

      return Promise.all(typePromises).then(() => {
        // More robust event triggering after typing is complete
        const events = ['input', 'change', 'blur', 'keyup'];
        events.forEach((eventType) => {
          const event = new iframe.contentWindow.Event(eventType, {
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(event);
        });

        // Also trigger jQuery events if jQuery is available in the iframe
        if (typeof iframe.contentWindow.$ !== 'undefined' && iframe.contentWindow.$(element).length) {
          iframe.contentWindow.$(element).trigger('change').trigger('blur');
        }

        // For datepicker or special inputs, also trigger specific events
        if (
          element.id.includes('tgl') ||
          element.classList.contains('datepicker') ||
          element.getAttribute('data-role') === 'datepicker'
        ) {
          const specificEvents = ['datechange', 'dp.change', 'changeDate'];
          specificEvents.forEach((eventType) => {
            try {
              const event = new iframe.contentWindow.Event(eventType, {
                bubbles: true,
                cancelable: true
              });
              element.dispatchEvent(event);
            } catch (_e) {
              // Ignore if event type doesn't exist
            }
          });
        }

        // Simulate tab key press by blurring the element
        element.blur();

        return true;
      });
    },
    { iframeSelector, elementSelector, value, delay, clearFirst }
  );

  // Add a small delay after typing completion
  await sleep(1000);
}

/**
 * Types a value into an input field inside an iframe using Puppeteer's Frame API.
 *
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} iframeSelector - CSS selector for the iframe.
 * @param {string} elementSelector - CSS selector for the input field inside the iframe.
 * @param {string} value - The value to type into the input field.
 * @param {Object} [options] - Options object.
 * @param {number} [options.delay=100] - Typing delay in milliseconds.
 * @param {boolean} [options.clearFirst=false] - Whether to clear the field before typing.
 * @returns {Promise<void>} - A promise that resolves after typing is complete.
 */
export async function typeToIframe(page, iframeSelector, elementSelector, value, options = {}) {
  const { delay = 100, clearFirst = false } = options;
  const iframeElement = await page.$(iframeSelector);
  const iframe = await iframeElement.contentFrame();
  await iframe.focus(elementSelector);
  if (clearFirst) {
    // Clear the input field inside the iframe
    await iframe.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, elementSelector);
    await iframe.type(elementSelector, '', { delay });
  }
  await iframe.type(elementSelector, value, { delay });
  await iframe.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, elementSelector);
  await page.keyboard.press('Tab'); // Simulate tab key press to blur
  await sleep(300); // Wait for any potential UI updates after typing
}

/**
 * Check if an element exists and is visible inside an iframe
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} iframeSelector - CSS selector for the iframe
 * @param {string} elementSelector - CSS selector for the target element inside the iframe (use #id for IDs)
 * @param {Object} options - Options object
 * @param {boolean} options.checkVisibility - Whether to check if element is visible (default: true)
 * @returns {Promise<boolean>} - Returns true if the element exists and is visible inside the iframe
 */
export async function isIframeElementVisible(page, iframeSelector, elementSelector, options = {}) {
  const { checkVisibility = true } = options;

  try {
    return await page.evaluate(
      ({ iframeSelector, elementSelector, checkVisibility }) => {
        const iframe = document.querySelector(iframeSelector);
        if (!iframe || !iframe.contentDocument) {
          return false;
        }

        const element = iframe.contentDocument.querySelector(elementSelector);

        if (!element) {
          return false;
        }

        // If we don't need to check visibility, just return true since element exists
        if (!checkVisibility) {
          return true;
        }

        // Check if element is visible using the iframe's window for getComputedStyle
        const style = iframe.contentWindow.getComputedStyle(element);
        const isVisible =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          element.offsetWidth > 0 &&
          element.offsetHeight > 0 &&
          style.opacity !== '0';

        return isVisible;
      },
      { iframeSelector, elementSelector, checkVisibility }
    );
  } catch (_error) {
    // If there's an error (e.g., iframe not accessible), return false
    return false;
  }
}

/**
 * Click an element inside an iframe
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} iframeSelector - CSS selector for the iframe
 * @param {string} elementSelector - CSS selector for the target element inside the iframe
 * @param {Object} options - Options object
 * @param {boolean} options.checkVisibility - Whether to check if element is visible before clicking (default: true)
 * @returns {Promise<boolean>} - Returns true if click was successful, false otherwise
 */
export async function clickIframeElement(page, iframeSelector, elementSelector, options = {}) {
  const { checkVisibility = true } = options;

  try {
    return await page.evaluate(
      ({ iframeSelector, elementSelector, checkVisibility }) => {
        const iframe = document.querySelector(iframeSelector);
        if (!iframe || !iframe.contentDocument) {
          throw new Error(`Iframe not found or not accessible: ${iframeSelector}`);
        }

        const element = iframe.contentDocument.querySelector(elementSelector);

        if (!element) {
          throw new Error(`Element not found: ${elementSelector}`);
        }

        // Check visibility if requested
        if (checkVisibility) {
          const style = iframe.contentWindow.getComputedStyle(element);
          const isVisible =
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            element.offsetWidth > 0 &&
            element.offsetHeight > 0 &&
            style.opacity !== '0';

          if (!isVisible) {
            throw new Error(`Element is not visible: ${elementSelector}`);
          }
        }

        // Click the element
        element.click();
        return true;
      },
      { iframeSelector, elementSelector, checkVisibility }
    );
  } catch (error) {
    console.error(`Failed to click iframe element: ${error.message}`);
    return false;
  }
}

/**
 * Extracts attribute values and common properties from input and textarea elements.
 *
 * @param {(HTMLInputElement | HTMLTextAreaElement)[]} elements - Array of input or textarea elements.
 * @returns {Array<Record<string, string>>} Array of flattened objects containing all attributes plus name, value, id, disabled, and isVisible.
 */
function extractFormValues(elements) {
  return elements.map((el) => {
    const attrs = Array.from(el.attributes).reduce((acc, attr) => {
      acc[attr.name] = String(attr.value);
      return acc;
    }, {});

    const isVisible = !!(el.offsetParent || el.offsetWidth > 0 || el.offsetHeight > 0);
    let textLabel = '';
    let currentEl = el; // Start from the target element

    for (let i = 0; i < 6 && currentEl; i++) {
      const labelEl = currentEl.querySelector('.form-item-label');
      if (labelEl) {
        textLabel = labelEl.textContent.trim();
        break;
      }
      currentEl = currentEl.parentElement; // Move one level up
    }

    return {
      ...attrs,
      name: el.name || '',
      value: el.value,
      id: el.id || '',
      disabled: String(el.disabled),
      isVisible: String(isVisible),
      label: textLabel
    };
  });
}

/**
 * Get values of all input and textarea elements within a container.
 * Works with both Page and Frame contexts.
 *
 * @param {import('puppeteer').Page|import('puppeteer').Frame} context - The Puppeteer page or frame instance.
 * @param {string} containerSelector - The CSS selector for the container.
 * @returns {Promise<ReturnType<typeof extractFormValues>>} - Returns an array of objects containing name, value, id, disabled, and all attributes of each input/textarea.
 */
export async function getFormValues(context, containerSelector) {
  return await context.$$eval(`${containerSelector} input, ${containerSelector} textarea`, extractFormValues);
}

/**
 * Get values of all input and textarea elements within a container inside an iframe.
 *
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @param {string} iframeSelector - The CSS selector for the iframe.
 * @param {string} containerSelector - The CSS selector for the container inside the iframe.
 * @returns {Promise<ReturnType<typeof getFormValues>>}
 */
export async function getFormValuesFromFrame(page, iframeSelector, containerSelector) {
  const iframeElement = await page.$(iframeSelector);
  if (!iframeElement) throw new Error(`Iframe not found: ${iframeSelector}`);

  const frame = await iframeElement.contentFrame();
  if (!frame) throw new Error(`Failed to get frame from iframe element`);

  return await getFormValues(frame, containerSelector);
}

/**
 * Triggers 'input' and 'change' events on an input or textarea element,
 * optionally within an iframe. Does NOT change the element’s value.
 *
 * @param {import('puppeteer').Page} page - Puppeteer Page object
 * @param {string} selector - CSS selector for the input or textarea
 * @param {Object} [options]
 * @param {string} [options.frameSelector] - Optional iframe CSS selector
 * @param {string} [options.frameName] - Optional iframe name
 */
export async function triggerInputChange(page, selector, options = {}) {
  const { frameSelector, frameName } = options;

  let frame = page.mainFrame();

  if (frameSelector) {
    const iframeHandle = await page.$(frameSelector);
    if (!iframeHandle) throw new Error(`Iframe not found with selector: ${frameSelector}`);
    frame = await iframeHandle.contentFrame();
  } else if (frameName) {
    frame = page.frames().find((f) => f.name() === frameName);
    if (!frame) throw new Error(`Iframe not found with name: ${frameName}`);
  }

  if (!frame) throw new Error('Target frame could not be resolved.');

  await frame.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, selector);
}

/**
 * Validates that a value was properly set in an iframe element and optionally retries with enhanced event triggering
 * @param {Object} page - Puppeteer page object
 * @param {string} iframeSelector - CSS selector for the iframe
 * @param {string} elementSelector - CSS selector for the element within the iframe
 * @param {string} expectedValue - Expected value that should be in the element
 * @param {Object} options - Options for retry behavior
 * @returns {Promise<boolean>} - True if validation passed, false otherwise
 */
export async function validateAndRetryIframeInput(page, iframeSelector, elementSelector, expectedValue, options = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check if the value was properly set
    const currentValue = await page.evaluate(
      ({ iframeSelector, elementSelector }) => {
        const iframe = document.querySelector(iframeSelector);
        if (!iframe || !iframe.contentDocument) {
          return null;
        }

        const element = iframe.contentDocument.querySelector(elementSelector);
        return element ? element.value : null;
      },
      { iframeSelector, elementSelector }
    );

    if (currentValue === expectedValue) {
      return true;
    }

    if (attempt < maxRetries) {
      console.log(
        `Validation failed for ${elementSelector}, attempt ${attempt + 1}/${maxRetries + 1}. Expected: "${expectedValue}", Got: "${currentValue}". Retrying...`
      );

      // Enhanced retry with more aggressive event triggering
      await page.evaluate(
        ({ iframeSelector, elementSelector, expectedValue }) => {
          const iframe = document.querySelector(iframeSelector);
          if (!iframe || !iframe.contentDocument) {
            return;
          }

          const element = iframe.contentDocument.querySelector(elementSelector);
          if (!element) {
            return;
          }

          // Force set the value
          element.value = expectedValue;

          // Trigger all possible events that might be needed
          const allEvents = [
            'input',
            'change',
            'blur',
            'focus',
            'keyup',
            'keydown',
            'keypress',
            'paste',
            'cut',
            'beforeinput',
            'afterinput'
          ];

          allEvents.forEach((eventType) => {
            try {
              const event = new iframe.contentWindow.Event(eventType, {
                bubbles: true,
                cancelable: true
              });
              element.dispatchEvent(event);
            } catch (_e) {
              // Ignore if event type doesn't exist
            }
          });

          // Trigger jQuery events if available
          if (typeof iframe.contentWindow.$ !== 'undefined' && iframe.contentWindow.$(element).length) {
            iframe.contentWindow.$(element).trigger('change').trigger('blur').trigger('input');
          }

          // For Kendo UI components (common in enterprise apps)
          if (typeof iframe.contentWindow.kendo !== 'undefined') {
            const kendoWidget = iframe.contentWindow.kendo.widgetInstance(element);
            if (kendoWidget && typeof kendoWidget.trigger === 'function') {
              kendoWidget.trigger('change');
            }
          }
        },
        { iframeSelector, elementSelector, expectedValue }
      );

      await sleep(retryDelay);
    }
  }

  console.warn(`Failed to validate input after ${maxRetries + 1} attempts for ${elementSelector}`);
  return false;
}

/**
 * Wait until DOM becomes stable (no changes for `quietTime` ms).
 *
 * @param {import('puppeteer').Page} page
 * @param {number} quietTime - Time window where no mutations must occur (ms).
 * @param {number} timeout - Maximum total wait time (ms).
 */
export async function waitForDomStable(page, quietTime = 500, timeout = 5000) {
  if (quietTime > timeout) {
    timeout = quietTime + 5000; // extend timeout
  }

  await page.evaluate(
    ({ quietTime, timeout }) =>
      new Promise((resolve, reject) => {
        let timer = null;
        let finished = false;

        const observer = new MutationObserver(() => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(done, quietTime);
        });

        function done() {
          if (finished) return;
          finished = true;
          observer.disconnect();
          resolve();
        }

        observer.observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
        });

        // Start initial quiet timer
        timer = setTimeout(done, quietTime);

        // Fail-safe timeout
        setTimeout(() => {
          if (finished) return;
          finished = true;
          observer.disconnect();
          reject(new Error('DOM did not stabilize within timeout'));
        }, timeout);
      }),
    { quietTime, timeout }
  );
}

/**
 * Wait until DOM becomes stable indefinitely (no timeout, no quietTime).
 * Resolves only when there are no more mutations for a full cycle.
 *
 * @param {import('puppeteer').Page} page
 */
export async function waitForDomStableIndefinite(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let pendingMutations = false;

        const observer = new MutationObserver(() => {
          pendingMutations = true;
        });

        observer.observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
        });

        function checkStability() {
          if (!pendingMutations) {
            observer.disconnect();
            resolve();
          } else {
            pendingMutations = false;
            requestAnimationFrame(checkStability); // check again in next frame
          }
        }

        requestAnimationFrame(checkStability);
      })
  );
}

/**
 * Check if any element matching the selector contains the given text and is visible
 * @param {import('puppeteer').Page} page Puppeteer Page object
 * @param {string} selector CSS selector to match elements
 * @param {string} text Text content to match
 * @returns {Promise<boolean>} true if at least one element matches
 */
export async function anyElementWithTextExists(page, selector, text) {
  const elementHandles = await page.$$(selector); // get all matching elements

  for (const el of elementHandles) {
    const matchesText = await page.evaluate(
      (element, expectedText) => {
        // Normalize: lowercase, trim, remove special chars, collapse spaces
        const normalize = (str) => {
          if (!str) return '';
          return str
            .toLowerCase()
            .replace(/[^\p{L}\p{N} ]+/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };
        const style = window.getComputedStyle(element);
        const isVisible = style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        const elementText = normalize(element.textContent);
        const normalizedExpected = normalize(expectedText);
        return isVisible && elementText.includes(normalizedExpected);
      },
      el,
      text
    );

    if (matchesText) return true; // found a match
  }

  return false; // no matches found
}

/**
 * Checks if an element matching the selector exists and is visible on the page.
 *
 * @param {import('puppeteer').Page} page - Puppeteer Page instance
 * @param {string} selector - CSS selector for the element to check
 * @returns {Promise<boolean>} Resolves to true if the element exists and is visible, false otherwise
 */
export async function elementExists(page, selector) {
  const elementHandle = await page.$(selector);
  if (!elementHandle) return false;

  const isVisible = await page.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }, elementHandle);

  return isVisible;
}

/**
 * Check if an element exists with specific text content and is visible
 * @param {import('puppeteer').Page} page Puppeteer Page object
 * @param {string} selector CSS selector to match elements
 * @param {string} text Text content to match
 * @returns {Promise<boolean>} true if element exists and contains the text
 */
export async function elementWithTextExists(page, selector, text) {
  const elementHandle = await page.$(selector);
  if (!elementHandle) return false;

  const matchesText = await page.evaluate(
    (el, expectedText) => {
      const style = window.getComputedStyle(el);
      const isVisible = style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      return isVisible && el.textContent?.includes(expectedText);
    },
    elementHandle,
    text
  );

  return matchesText;
}

/**
 * Clears all cookies for the current page's domain using CDP.
 *
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 */
export async function clearCurrentPageCookies(page) {
  const client = await page.createCDPSession();
  const url = new URL(page.url());

  // Get cookies for current domain
  const { cookies } = await client.send('Network.getCookies', {
    urls: [url.origin]
  });

  for (const cookie of cookies) {
    await client.send('Network.deleteCookies', {
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path // important, otherwise deletion may fail
    });
  }

  // Verify
  const { cookies: remaining } = await client.send('Network.getCookies', {
    urls: [url.origin]
  });

  if (remaining.length > 0) {
    console.warn(`⚠️ Some cookies not cleared for ${url.hostname}:`, remaining);
  } else {
    console.log(`✅ All cookies cleared for ${url.hostname}`);
  }

  const xclient = await page.target().createCDPSession();
  await xclient.send('Network.clearBrowserCookies');
}

/**
 * Clicks the first element matching the selector whose text content matches the given text (case-insensitive).
 *
 * This function searches for all elements matching the provided selector, normalizes their text content by removing
 * zero-width and special characters (keeping only letters, numbers, and spaces), collapses multiple spaces, trims,
 * and converts to lowercase. It then compares the normalized text to the provided `text` (also lowercased).
 *
 * If a match is found, the element is clicked and the function returns true. If no match is found, returns false.
 * Throws if no elements are found for the selector.
 *
 * @param {import('puppeteer').Page} page - Puppeteer Page instance
 * @param {string} selector - CSS selector to match elements
 * @param {string} text - Text to match (case-insensitive, normalized)
 * @returns {Promise<boolean>} true if an element was clicked, false otherwise
 * @throws {Error} If no elements are found for the given selector
 */
export async function clickElementByText(page, selector, text) {
  const elements = await page.$$(selector);
  if (elements.length === 0) {
    throw new Error(`No elements found for selector: ${selector}`);
  }

  for (const el of elements) {
    const elementText = await el.evaluate((el) => {
      let t = el.innerText || '';

      // Remove zero-width characters
      t = t.replace(/[\u200B-\u200D\uFEFF]/g, '');
      // Remove special characters but keep letters, numbers, spaces
      t = t.replace(/[^\p{L}\p{N} ]/gu, '');
      // Collapse multiple spaces and trim
      t = t.replace(/\s+/g, ' ').trim().toLowerCase();

      return t;
    });

    if (elementText === text.toLowerCase()) {
      await el.click();
      return true;
    }
  }
  return false;
}
