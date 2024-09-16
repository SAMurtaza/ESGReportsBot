import { chromium } from 'playwright';
import  path  from 'path';

export async function downloadReport(url, downloadPath){
    
    const browser = await chromium.launch({ headless: false }); 
    const context = await browser.newContext({ acceptDownloads: true }); 
    const page = await context.newPage();
  
        try {
            console.log(`Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000});

            //Selectors to get the initial Page
            const targetPageSelectors = ['CR Report', 'ESG Report', 'Corporate Responsibility', 'Sustainability Roadmap', 'Sustainability'];
            let foundPageElement = false;

            for (const pSelector of targetPageSelectors) {

                const pageElementHandle = await page.$("text="+pSelector);

                if ( pageElementHandle ) {
                    console.log(`Found page element: ${pSelector}`);

                    //Try to download the report directly from first page, if possible
                    const reportFoundFirstPage = await findAndDownloadReport(page, downloadPath);

                    await page.getByRole('link', { name: pSelector, exact: true}).click({ force: true});
                    
                    //Try to find report on the second page
                    const reportFound = await findAndDownloadReport(page, downloadPath);

                    //Didnt find any report to download on the 2nd page, going for 3rd page possibly final
                    if ( reportFound ) {

                        foundPageElement = true;
                        break;
                    } 
                    else {

                        // Proceed to the next potential page if the report wasn't found
                        await handleMultiPageReports(page, downloadPath);

                        foundPageElement = true;
                        break;
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

//Selectors Function for finding and downloading the report
async function findAndDownloadReport(page, downloadPath) {

    const targetReportSelectors = ['CR Report', 'ESG Presentation', 'ESG Report'];

    for (const rSelector of targetReportSelectors) {

      const reportElementHandle = await page.$(`text=${rSelector}`);

      if ( reportElementHandle ) {
        console.log(`Found report element: ${rSelector}`);

        
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }); // Handle slow downloads
  
        await page.getByText(rSelector, { exact: true }).click(); // Trigger the download
  
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
    }
    return false; // No report found
  }
  
  //Selectors to get the 3rd Page
  async function handleMultiPageReports(page, downloadPath) {

    const multiPageSelectors = ['ESG Reporting'];

    for (const pSelector of multiPageSelectors) {

      const pageElementHandle = await page.$(`text=${pSelector}`);

      if ( pageElementHandle ) {
        console.log(`Found 3rd page element: ${pSelector}`);

        await page.getByRole('link', { name: pSelector, exact: true }).click({ force: true });
  
        // Try to find report on the new page
        const reportFound = await findAndDownloadReport(page, downloadPath);

        if (reportFound) return true;
      }
    }
    return false;
  }