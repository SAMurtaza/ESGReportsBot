import { readUrlsFromCsv } from "./readCSVFile.js";
import { downloadReport } from "./playwrightAutomation.js";
import   fs  from 'fs'; 

const csvFilePath = '../urls/TestESG.csv';
const downloadFolder = '../downloads'; 

  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
  }

  try {
    const urls = await readUrlsFromCsv(csvFilePath); 
    console.log(`Found ${urls.length} URLs to process`);
    console.log(urls)

    for (const url of urls) {
      await downloadReport(url, downloadFolder);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }