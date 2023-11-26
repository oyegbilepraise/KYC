const TEST_URL = "https://sandbox.vtpass.com/api/pay";
const LIVE_URL = "https://vtpass.com/api/pay"
const username = process.env.VT_USERNAME;
const password = process.env.VT_PASSWORD;
const db = require("../models");
const axios = require("axios");
const UTILITIES = db.utilities;
const shortid = require("shortid");
const date_fns = require("date-fns");
const { format, subSeconds, addSeconds } = require('date-fns')
const { Op } = require("sequelize");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(process.env.flutterwave_public_key, process.env.flutterwave_sec_key);

const get_flutterwave_bills_categories = async (req, res) => {
  try {
    const resi = await flw.Bills.fetch_bills_Cat();
    res.status(200).json(resi)
  } catch (error) {
    res.status(500).json({ error })
    console.log({ error });
  }
}

const generateRequestId = () => {
  const str = (new Date()).toLocaleString("en-US", { timeZone: "Africa/Lagos" });
  let date = new Date(str);
  const y = date.getFullYear();
  const m = `0${(date.getMonth() + 1)}`.slice(-2);
  const d = `0${date.getDate().toString()}`.slice(-2);
  const h = `0${date.getHours().toString()}`.slice(-2);
  const min = `0${date.getMinutes().toString()}`.slice(-2);
  return `${y}${m}${d}${h}${min}${Math.random().toString(36).slice(2)}`;
};

const rerunAirtime = async (req, res) => {
  const { serviceID, amount, phone, source, merchant_id, narration, account_number } = req.body;

  try {
    const VT = await axios.post(
      `${LIVE_URL}`,
      {
        request_id: generateRequestId(),
        serviceID,
        amount,
        phone,
      },
      { auth: { username, password } }
    );

    if (VT.data.content.errors) {
      return res.status(400).json({ errors: VT?.data?.content?.errors, status: false, error: true, message: 'Error' })
    }

    let content = VT?.data?.content?.transactions;
    const db_data = await UTILITIES.create({
      phone, amount, status: content?.status || 'N/A', response_description: VT?.data?.response_description, requestId: VT?.data?.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type || serviceID, source, merchant_id,
    })
    res.status(200).json({ data: VT.data.content, status: true, db_data });

  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
    res.status(500).json({ error: error?.response?.data, status: false });
  }
}

const airtime = async (req, res) => {
  const { serviceID, amount, phone, source, merchant_id, narration, account_number } = req.body;
  try {

    const chargeWallet = await axios.post('https://wema.creditclan.com/withdraw/funds', { amount, merchant_id, account_number, narration });
    if (chargeWallet?.data?.status) {
      const VT = await axios.post(
        `${LIVE_URL}`,
        {
          request_id: generateRequestId(),
          serviceID,
          amount,
          phone,
        },
        { auth: { username, password } }
      );

      if (VT.data.content.errors) {
        return res.status(400).json({ errors: VT?.data?.content?.errors, status: false, error: true, message: 'Error' })
      }
      let content = VT?.data?.content?.transactions
      const db_data = await UTILITIES.create({
        phone, amount, status: content?.status || 'N/A', response_description: VT?.data?.response_description, requestId: VT?.data?.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type || serviceID, source, merchant_id, transaction_ref: chargeWallet?.data?.transaction_id
      })
      res.status(200).json({ data: VT.data.content, status: true, db_data });

      if (source === 'WhatsApp') {
      } else {
        const db_data = await UTILITIES.create({
          phone, amount, status: content?.status || 'N/A', response_description: VT?.data?.response_description, requestId: VT?.data?.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type || serviceID, source, merchant_id, transaction_ref: chargeWallet?.data?.transaction_id
        })
        res.status(200).json({ data: VT.data.content, status: true, db_data });
      }
    } else {
      res.status(400).json({ message: 'Error' })
    }

  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
    res.status(500).json({ error: error?.response?.data, status: false });
  }
};

// const international = async (req, res) => {
//   try {
//     const { serviceID, amount, phone, billersCode, variation_code, operator_id, country_code, product_type_id, email } = req.body;
//     const VT = await axios.post(
//       `${LIVE_URL}`,
//       {
//         request_id: generateRequestId(),
//         serviceID,
//         amount,
//         phone,
//         billersCode,
//         variation_code,
//         operator_id,
//         country_code,
//         product_type_id,
//         email
//       },
//       { auth: { username, password } }
//     );
//     res.status(200).json({ data: VT.data, status: true });
//   } catch (error) {
//     res.status(500).json({ error, status: false });
//   }
// }

const rerun_data_subscripton = async (req, res) => {
  const { serviceID, amount, phone, billersCode, variation_code, source, merchant_id, narration, account_number } = req.body;
  try {
    const VT = await axios.post(
      `${LIVE_URL}`,
      {
        request_id: generateRequestId(),
        serviceID,
        amount,
        phone,
        billersCode,
        variation_code,
      },
      { auth: { username, password } }
    );

    res.json(VT.data)
    // const chargeWallet = await axios.post('https://wema.creditclan.com/withdraw/funds', { amount, merchant_id, account_number, narration });
    // if (chargeWallet?.data?.status) {
    //   if (VT.data.content.errors) {
    //     return res.status(400).json({ errors: VT?.data?.content?.errors, status: false, error: true, message: 'Error' })
    //   }
    //   let content = VT?.data?.content?.transactions
    //   const db_data = await UTILITIES.create({
    //     phone, amount, status: content?.status || 'N/A', response_description: VT.data.response_description, requestId: VT.data.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type || serviceID, source, merchant_id
    //   })
    //   res.status(200).json({ data: VT.data, status: true, db_data });
    // } else {
    //   res.status(400).json({ message: 'Error' })
    // }
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: error?.response?.data, status: false });
  }
};

const data_subscripton = async (req, res) => {
  const { serviceID, amount, phone, billersCode, variation_code, source, merchant_id, narration, account_number } = req.body;
  try {
    const chargeWallet = await axios.post('https://wema.creditclan.com/withdraw/funds', { amount, merchant_id, account_number, narration });
    if (chargeWallet?.data?.status) {
      const VT = await axios.post(
        `${LIVE_URL}`,
        {
          request_id: generateRequestId(),
          serviceID,
          amount,
          phone,
          billersCode,
          variation_code,
        },
        { auth: { username, password } }
      );
      if (VT.data.content.errors) {
        return res.status(400).json({ errors: VT?.data?.content?.errors, status: false, error: true, message: 'Error' })
      }
      let content = VT?.data?.content?.transactions
      const db_data = await UTILITIES.create({
        phone, amount, status: content?.status || 'N/A', response_description: VT.data.response_description, requestId: VT.data.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type || serviceID, source, merchant_id
      })
      res.status(200).json({ data: VT.data, status: true, db_data });
    } else {
      res.status(400).json({ message: 'Error' })
    }
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: error?.response?.data, status: false });
  }
};

const data_variation_codes = async (req, res) => {
  const { network } = req.body;
  try {
    const VT = await axios.get(`https://vtpass.com/api/service-variations?serviceID=${network}`);
    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const cabletv_variation_codes = async (req, res) => {
  const { serviceID } = req.body;
  try {
    const VT = await axios.get(
      `https://vtpass.com/api/service-variations?serviceID=${serviceID}`
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
};

const verify_smartcard_number = async (req, res) => {
  const { item_code, code, customer } = req.body;
  try {
    const payload = { item_code, code, customer };
    const response = await flw.Bills.validate(payload);
    res.status(200).json(response);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: error?.response?.data, status: false });
  }
};

const renew_catbletv_sub = async (req, res) => {
  const { customer, amount, type, country, merchant_id, source, phone } = req.body;
  const trackingReference = "cc-" + shortid.generate();
  try {
    const resi = await axios.post('https://mobile.creditclan.com/api/v3/bills/payment', { country, customer, amount, type, reference: trackingReference }, { headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' } });

    console.log(resi.data);

    await UTILITIES.create({
      phone, amount, status: resi?.status, product_name: resi?.data?.network, transactionId: resi?.data?.reference, flw_ref: resi?.data?.flw_ref, source, merchant_id
    })

    res.status(200).json({ data: resi.data, message: 'Success' });
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
    res.status(500).json({ error: true, message: error?.response?.data });
  }
};

const verify_meter_number = async (req, res) => {
  try {
    const { serviceID, billersCode, type } = req.body;
    const VT = await axios.post(
      `https://vtpass.com/api/merchant-verify`,
      { billersCode, serviceID, type },
      { auth: { username, password } }
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
};

const renew_meter_subscription = async (req, res) => {
  const { serviceID, billersCode, amount, phone, variation_code, source, merchant_id } = req.body;
  try {
    const VT = await axios.post(
      `${LIVE_URL}`,
      {
        request_id: generateRequestId(),
        serviceID,
        amount,
        phone,
        billersCode,
        variation_code,
      },
      { auth: { username, password } }
    );
    if (VT.data.content.errors) {
      return res.status(400).json({ errors: VT?.data?.content?.errors, status: false, error: true, message: 'Error' })
    }
    let content = VT.data.content.transactions
    const db_data = await UTILITIES.create({
      phone, amount, status: content.status, response_description: VT.data.response_description, requestId: VT.data.requestId, product_name: content.product_name, transactionId: content.transactionId, type: content.type, source, merchant_id
    })
    res.status(200).json({ data: VT.data, db_data, status: true });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
};

const query_status = async (req, res) => {
  const { request_id } = req.body;
  try {
    const VT = await axios.post(
      `https://vtpass.com/api/requery`,
      { request_id },
      { auth: { username, password } }
    );
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
}

const get_utilities = async (req, res) => {
  try {
    const response = await UTILITIES.findAll();
    res.status(200).json({ data: response, error: false, message: 'Success', status: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}

const getUtilsByPhone = async (req, res) => {
  const { phone } = req.body
  try {
    const response = await UTILITIES.findAll({
      where: { phone }, order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: response, error: false, message: 'Success', status: true });
  } catch (error) {
    console.log({ error });
  }
}

const getUtilsbyFilters = async (req, res) => {
  const { amount, merchant_id, date_added, transaction_ref } = req.body;

  const dateAddedDate = new Date(date_added);
  
  const tenSecondsAgo = subSeconds(dateAddedDate, 30)
  const tenSecondsLater = addSeconds(dateAddedDate, 30)

  try {
    if (transaction_ref) {
      const response = await UTILITIES.findOne({
        where: {
          transaction_ref
        }
      })
      res.status(200).json({ data: response, error: false, message: 'Success', status: true });

    } else {
      const response = await UTILITIES.findAll({
        where: {
          amount,
          merchant_id,
          createdAt: {
            [Op.between]: [tenSecondsAgo, tenSecondsLater],
          },
        }
      })
      res.status(200).json({ data: response[0] || {}, error: false, message: 'Success', status: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}

const saveUtils = async (req, res) => {
  try {
    const db_data = await UTILITIES.create({ ...req.body })
    res.status(200).json({ data: db_data, status: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}

const balance = async (req, res) => {
  try {
    const VT = await axios.get(
      `https://vtpass.com/api/balance`,
      { auth: { username, password } }

      ); 


      res.json({data: VT.data?.contents, error: false, message: 'Success'});
  
  } catch (error) {
    console.log(error?.response?.data);
    // console.log({ error });
  }
}

module.exports = {
  airtime,
  data_variation_codes,
  data_subscripton,
  cabletv_variation_codes,
  verify_smartcard_number,
  renew_catbletv_sub,
  verify_meter_number,
  renew_meter_subscription,
  international,
  query_status,
  get_utilities,
  get_flutterwave_bills_categories,
  getUtilsByPhone,
  getUtilsbyFilters,
  rerunAirtime,
  rerun_data_subscripton,
  saveUtils,
  balance
};
