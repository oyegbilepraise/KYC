const TEST_URL = "https://sandbox.vtpass.com/api/pay";
const username = "technical@creditclan.com";
const password = "cr3d!tcl@nDonotD3l3t3!@t@!!@gain!s@y@t@ll";

const token = `${username}:${password}`;

const axios = require("axios");

const today = new Date();

const date = `${today.getFullYear()}${
  today.getMonth() < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1
}${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}${
  today.getHours() < 12 ? "0" + today.getHours() : today.getHours()
}${today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()}${
  Math.random().toString(30).substring(2, 15) +
  Math.random().toString(30).substring(2, 15)
}`;

console.log(date);

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

    res.status(200).json({ data: VT.data });
  } catch (error) {
    res.json({ error });
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

module.exports = { airtime, data_variation_codes, data_subscripton };
