const csv = require('csv-parser')
const fs = require('fs')
const axios = require("axios");
const results = [];
const failedResult = [];

const run = async () => {
  fs.createReadStream('csv.csv')
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      for (let i = 0; i < results.length; i++) {
        try {
          const res = await axios.post(`https://creditclan-kycs.herokuapp.com/api/more-widget/rerun_data_subscripton`,
            {
              "serviceID": "mtn-data",
              "amount": "1000",
              "phone": results[i].NUMBER,
              "billersCode": results[i].NUMBER,
              "variation_code": "mtn-1200mb-1000",
              "source": "Office CUG"
            })

          if (res?.data?.status) {
            console.log(`Done - ${results[i].NUMBER}`);
          }
        } catch (error) {
          failedResult.push(results[i]);
          console.log(`failed - ${results[i].NUMBER}`);
        }
      }
      console.log(failedResult);
    });
}

run();