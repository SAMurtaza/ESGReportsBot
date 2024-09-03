import { chromium } from 'playwright';
import  path  from 'path';

export async function downloadReport(url, downloadPath){
    
    const browser = await chromium.launch({ headless: false }); 
    const context = await browser.newContext({ acceptDownloads: true }); 
    const page = await context.newPage();
  
        try {
            console.log(`Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle' });

            //Selectors to get the initial Page
            const targetPageSelectors = ['Corporate Responsibility', 'Sustainability Roadmap', 'Sustainability'];
            let foundPageElement = false;

            for (const pSelector of targetPageSelectors) {

                const pageElementHandle = await page.$("text="+pSelector);

                if ( pageElementHandle ) {
                    console.log(`Found page element: ${pSelector}`);

                    await page.getByRole('link', { name: pSelector, exact: true}).click({ force: true});

                    //Selectors to get the specific reports page
                    const targetReportSelectors = ['CR Report', 'ESG Presentation'];
                    let foundReportElement = false;

                    for (const rSelector of targetReportSelectors) {

                        const reportElementHandle = await page.$("text="+rSelector);

                        if ( reportElementHandle ) {
                            console.log(`Found report element: ${rSelector}`);

                            await page.getByRole('link', { name: rSelector, exact: true}).click({ force: true});

                            foundReportElement  = true;
                            foundPageElement    = true;
                            break;
                        }
                    }

                    //Didnt find any report to download on the 2nd page, going for 3rd page possibly final
                    if( !foundReportElement ){

                        //Selectors to get the 3rd Page
                        const target3PageSelectors = ['ESG Reporting'];

                        for (const p3Selector of target3PageSelectors) {

                            const page3ElementHandle = await page.$("text="+p3Selector);

                            if ( page3ElementHandle ) {
                                console.log(`Found 3rd page element: ${p3Selector}`);
            
                                await page.getByRole('link', { name: p3Selector, exact: true}).click({ force: true});

                                //Selectors to get the specific reports page
                                let d = new Date();
                                let year = d.getFullYear()-1;

                                const target3ReportSelectors = ['CR Report', 'ESG Presentation'];

                                for (const r3Selector of target3ReportSelectors) {
                                    console.log("text="+r3Selector)

                                    const report3ElementHandle = await page.$("text="+r3Selector);
            
                                    if ( report3ElementHandle ) {
                                        console.log(`Found report element: ${r3Selector}`);
            
                                        const downloadPromise = page.waitForEvent('download');

                                        await page.getByText(r3Selector, { exact: true}).click();

                                        const download = await downloadPromise;

                                        await download.saveAs(downloadPath + download.suggestedFilename());
            
                                        foundReportElement  = true;
                                        foundPageElement    = true;
                                        break;
                                    }
                                }
                            }

                        }
                    }
                }
            }

            if ( !foundPageElement ) {
                console.error(`"Corporate Responsibility", "Sustainability" link not found on ${url}`);
                return;
            }

        } catch (error) {

            console.error(`Error: ${url}: ${error.message}`);

        } finally {
            await browser.close(); 
        }
    
};