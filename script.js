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
          const res = await axios.post(`https://creditclan-kycs.herokuapp.com/api/more-widget/get_airtime_rerun`,
            {
              "serviceID": "mtn",
              "amount": "1500",
              "phone": results[i].NUMBER,
              "source": "Office CUG Top-up",
              "merchant_id": "00000"
            })

          // if (res?.data?.status) {
          console.log(`Done - ${results[i].NUMBER}`);
          // }
        } catch (error) {
          failedResult.push(results[i]);
          console.log(`failed - ${results[i].NUMBER}`);
        }
      }
      console.log(failedResult);
    });
}

run();