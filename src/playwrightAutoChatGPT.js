import { chromium } from 'playwright';
import axios from 'axios';

//Function to call ChatGPT API
async function callChatGPT(prompt) {
    console.log('Calling ChatGPT');

    const apiKey = 'api-key';//Removed because of privacy

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: "gpt-4",
            messages: [{ role: "system", content: "You are a web scraping assistant" }, { role: "user", content: prompt }],
            temperature: 0.7
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content;
}

// Function to dynamically generate selectors with ChatGPT help
async function dynamicSelectorSuggestion(pageContent, targetText) {
    console.log('Analyzing the HTML content');

    const prompt = `Analyze this HTML content and suggest the best selector for a section containing "${targetText}":\n\n${pageContent}`;

    const selector = await callChatGPT(prompt);
    console.log(`ChatGPT suggested selector: ${selector}`);

    return selector.trim();
}

export async function downloadReport(url, downloadPath) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    try {
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Extract the page's HTML to send to ChatGPT for analysis if needed
        const pageContent = await page.content();

        console.log('Using ChatGPT to find more precise page selectors...');

        const dynamicSelector = await dynamicSelectorSuggestion(pageContent, 'Corporate Responsibility Report or Sustainability Report');

        const pageElementHandle = await page.$(dynamicSelector);

        if (pageElementHandle) {
                console.log(`Found dynamic page element using ChatGPT: ${dynamicSelector}`);
                
                await pageElementHandle.click({ force: true });
                await findAndDownloadReport(page, downloadPath);
        }
    } catch (error) {

        console.error(`Error on ${url}: ${error.message}`);
        
    } finally {
        await browser.close(); 
    }
}

async function findAndDownloadReport(page, downloadPath) {
    console.log('Using ChatGPT to find more precise report selectors...');

    const dynamicSelector = await dynamicSelectorSuggestion(pageContent, 'Corporate Responsibility Report or Sustainability Report');

    const reportElementHandle = await page.$(dynamicSelector);

      if ( reportElementHandle ) {
        console.log(`Found dynamic page element using ChatGPT: ${dynamicSelector}`);
        
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }); // Handle slow downloads
  
        await page.getByText(dynamicSelector, { exact: true }).click(); // Trigger the download
  
        try {
            const download = await downloadPromise;
            const downloadFilePath = path.join(downloadPath, await download.suggestedFilename());
  
            await download.saveAs(downloadFilePath);

            console.log(`Downloaded report: ${downloadFilePath}`);
            return true; // Report found and downloaded

        } catch ( downloadError ) {

            console.error(`Download failed: ${downloadError.message}`);
            return false;
        }
      }
    return false; // No report found
}