const TEST_URL = "https://sandbox.vtpass.com/api/pay";
const username = "technical@creditclan.com";
const password = "cr3d!tcl@nDonotD3l3t3!@t@!!@gain!s@y@t@ll";
const axios = require("axios");
const today = new Date();

let africa = today.toLocaleString("en-US", { timeZone: "Africa/Lagos" });

let a = new Date(africa).getHours();

const date = `${today.getFullYear()}${
  today.getMonth() < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1
}${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}${
  a < 10 ? "0" + a : a
}${today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()}`;

const airtime = async (req, res) => {
  const { serviceID, amount, phone, name } = req.body;

  try {
    const VT = await axios.post(
      `${TEST_URL}`, 
      {
        request_id: date,
        serviceID,
        amount,
        phone,
      },
      { auth: { username, password } }
    );

    res.status(200).json({ data: VT.data, status: true });
  } catch (error) {
    res.json({ error, status: false });
  }
};

const data_subscripton = async (req, res) => {
  const { serviceID, amount, phone, name, billersCode, variation_code } =
    req.body;

  try {
    const VT = await axios.post(
      `${TEST_URL}`,
      {
        request_id: date,
        serviceID,
        amount,
        phone,
        billersCode,
        variation_code,
      },
      { auth: { username, password } }
    );

    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
  }
};

const data_variation_codes = async (req, res) => {
  const { network } = req.body;
  try {
    const VT = await axios.get(
      `https://sandbox.vtpass.com/api/service-variations?serviceID=${network}`
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
  }
};

const cabletv_variation_codes = async (req, res) => {
  const { serviceID } = req.body;
  try {
    const VT = await axios.get(
      `https://sandbox.vtpass.com/api/service-variations?serviceID=${serviceID}`
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
  }
};

const verify_smartcard_number = async (req, res) => {
  const { serviceID, billersCode } = req.body;
  try {
    const VT = await axios.post(
      `https://sandbox.vtpass.com/api/merchant-verify`,
      { billersCode, serviceID },
      { auth: { username, password } }
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
  }
};

const renew_catbletv_sub = async (req, res) => {
  const { serviceID, billersCode, amount, phone } = req.body;
  try {
    const VT = await axios.post(
      `${TEST_URL}`,
      {
        request_id: date,
        serviceID,
        amount,
        phone,
        billersCode,
        subscription_type: "renew",
      },
      { auth: { username, password } }
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
  }
};

const verify_meter_number = async (req, res) => {
  try {
    const { serviceID, billersCode, type } = req.body;
    const VT = await axios.post(
      `https://sandbox.vtpass.com/api/merchant-verify`,
      { billersCode, serviceID, type },
      { auth: { username, password } }
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
  }
};

const renew_meter_subscription = async (req, res) => {
  const { serviceID, billersCode, amount, phone, variation_code } = req.body;
  try {
    const VT = await axios.post(
      `${TEST_URL}`,
      {
        request_id: date,
        serviceID,
        amount,
        phone,
        billersCode,
        variation_code,
      },
      { auth: { username, password } }
    );
    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
  }
};

module.exports = {
  airtime,
  data_variation_codes,
  data_subscripton,
  cabletv_variation_codes,
  verify_smartcard_number,
  renew_catbletv_sub,
  verify_meter_number,
  renew_meter_subscription,
};
