const TEST_URL = "https://sandbox.vtpass.com/api/pay";
const LIVE_URL = "https://vtpass.com/api/pay"
const username = process.env.VT_USERNAME;
const password = process.env.VT_PASSWORD;
const db = require("../models");
const axios = require("axios");
const UTILITIES = db.utilities;

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

const airtime = async (req, res) => {
  const { serviceID, amount, phone, source } = req.body;
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
    let content = VT?.data?.content?.transactions
    const db_data = await UTILITIES.create({
      phone, amount, status: content?.status, response_description: VT.data.response_description, requestId: VT.data.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type, source
    })
    res.status(200).json({ data: VT.data.content, status: true, db_data });
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ error: error?.response?.data, status: false });
  }
};

const international = async (req, res) => {
  try {
    const { serviceID, amount, phone, billersCode, variation_code, operator_id, country_code, product_type_id, email } = req.body;
    const VT = await axios.post(
      `${LIVE_URL}`,
      {
        request_id: generateRequestId(),
        serviceID,
        amount,
        phone,
        billersCode,
        variation_code,
        operator_id,
        country_code,
        product_type_id,
        email
      },
      { auth: { username, password } }
    );
    res.status(200).json({ data: VT.data, status: true });
  } catch (error) {
    res.status(500).json({ error, status: false });
  }
}

const data_subscripton = async (req, res) => {
  const { serviceID, amount, phone, billersCode, variation_code, source } = req.body;
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
    let content = VT?.data?.content?.transactions
    const db_data = await UTILITIES.create({
      phone, amount, status: content?.status, response_description: VT.data.response_description, requestId: VT.data.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type, source
    })

    res.status(200).json({ data: VT.data, status: true, db_data });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error, status: false });
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
  const { serviceID, billersCode } = req.body;
  try {
    const VT = await axios.post(
      `https://vtpass.com/api/merchant-verify`,
      { billersCode, serviceID },
      { auth: { username, password } }
    );
    res.status(200).json({ data: VT.data, status: true });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error, status: false });
  }
};

const renew_catbletv_sub = async (req, res) => {
  const { serviceID, billersCode, amount, phone, variation_code, source } = req.body;
  try {
    const VT = await axios.post(
      `${LIVE_URL}`,
      {
        request_id: generateRequestId(),
        serviceID,
        amount,
        phone,
        billersCode,
        subscription_type: "renew",
        variation_code
      },
      { auth: { username, password } }
    );
    if (VT.data.content.errors) {
      return res.status(400).json({ errors: VT?.data?.content?.errors, status: false, error: true, message: 'Error' })
    }
    let content = VT?.data?.content?.transactions
    const db_data = await UTILITIES.create({
      phone, amount, status: content?.status, response_description: VT.data.response_description, requestId: VT.data.requestId, product_name: content?.product_name, transactionId: content?.transactionId, type: content?.type, source
    })

    res.status(200).json({ data: VT.data, db_data, status: true });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
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
  const { serviceID, billersCode, amount, phone, variation_code, source } = req.body;
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
      phone, amount, status: content.status, response_description: VT.data.response_description, requestId: VT.data.requestId, product_name: content.product_name, transactionId: content.transactionId, type: content.type, source
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
  get_utilities
};
