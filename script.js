// const csv = require("csv-parser");
// const fs = require("fs");
const axios = require("axios");
const results = [
  { network: "airtel", amount: "5000", number: "07083618114" },
  { network: "airtel", amount: "5000", number: "08083483398" },
  { network: "airtel", amount: "5000", number: "07087528140" },
  { network: "airtel", amount: "5000", number: "09127622182" },
  { network: "mtn", amount: "5000", number: "09038833454" },
  { network: "mtn", amount: "5000", number: "08106740760" },
  { network: "mtn", amount: "5000", number: "07068862774" },
  { network: "mtn", amount: "5000", number: "08065424004" },
  { network: "mtn", amount: "5000", number: "08130350566" },
  { network: "mtn", amount: "5000", number: "08034664408" },
  { network: "mtn", amount: "5000", number: "08061582225" },
];
const failedResult = [];

const run = async () => {
  for (let i = 0; i < results.length; i++) {
    try {
      const res = await axios.post(
        `https://creditclan-kycs.herokuapp.com/api/more-widget/get_airtime_rerun`,
        {
          serviceID: results[i].network,
          amount: results[i].amount,
          phone: results[i].number,
          source: "Office CUG Top-up",
          merchant_id: "00000",
        }
      );

      console.log(res.data);

      console.log(
        `Done - ${results[i].network} - ${results[i].number} - ${results[i].amount}`
      );
    } catch (error) {
      failedResult.push(results[i]);
      console.log(`failed - ${results[i].number}`);
    }
  }
  // fs.createReadStream('csv.csv')
  //   .pipe(csv())
  //   .on('data', (data) => {
  //     results.push(data);
  //   })
  //   .on('end', async () => {
  //     console.log(failedResult);
  //   });
};

run();
