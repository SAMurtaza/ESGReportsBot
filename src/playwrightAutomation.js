import { chromium } from 'playwright';
import  path  from 'path';

export async function downloadReport(url, downloadPath){
    
    const browser = await chromium.launch(); 
    const context = await browser.newContext({ acceptDownloads: true }); 
    const page = await context.newPage();
  
    if( url.includes('telekom') ){
        try {
            console.log(`Navigating to 'https://www.telekom.com/en/media/publications'`);
            await page.goto('https://www.telekom.com/en/media/publications');
        
            await page.getByRole('link', { name: 'Corporate responsibility', exact: true}).click({ force: true});

            await page.getByLabel('Corporate Responsibility Report', { exact: true }).click({ force: true});

        } catch (error) {

            console.error(`Error downloading from ${url}: ${error.message}`);

        } finally {
            await browser.close(); 
        }
    }
    else if( url.includes('dhl')){
        try {
            //logic-here
        } catch (error) {

            console.error(`${url}: ${error.message}`);

        } finally {

            await browser.close(); 

        }
    }
    else if( url.includes('eaton') ){

        try {
            //logic-here
        } catch (error) {

            console.error(`${url}: ${error.message}`);

        } finally {

            await browser.close(); 

        }

    }
    else{

        browser.close();

    }
};