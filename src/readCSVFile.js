import  fs from 'fs'; 
import  csv  from 'csv-parser';

export function readUrlsFromCsv ( csvFilePath ) {

    return new Promise((resolve, reject) => {

      const urls = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {

          if (row.Website) {

            urls.push(row.Website);

          }
        })
        .on('end', () => {

          resolve(urls);

        })
        .on('error', reject);

    });
};