const axios = require("axios");
const TEST_URL = "https://advancly-api-master.staging.vggdev.com/api/v1/";
const TEST_URL_V2 = "https://advancly-api-master.staging.vggdev.com/api/v2/"
const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const shortid = require("shortid");

const Username = process.env.advancly_username;
const password = process.env.advancly_password;
const advanclt_client_id = process.env.advanclt_client_id;
const advancly_api_key = process.env.advancly_api_key;

const login = async () => {
  try {
    const res = await axios.post(`${TEST_URL}account/custom_login`, { Username, password })
    return res.data.sso_auth_token;
  } catch (error) {
    console.log(error);
  }
}

const get_country_state = async (req, res) => {
  const { country_code } = req.body;
  try {
    const response = await axios.get(`${TEST_URL}account/all_state?country_code=${country_code}`)
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ error: error.response.data || 'An error Occured', status: false, errors: true });
  }
}

const get_country_bank_list = async (req, res) => {
  const { country_code } = req.body;
  try {
    const response = await axios.get(`${TEST_URL}account/signed_banks_country?country_code=${country_code}`)
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ error: error.response.data || 'An error Occured', status: false, errors: true });
  }
}

const get_sectors = async (req, res) => {
  try {
    const response = await axios.get(`${TEST_URL}misc/sectors`)
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ error: error.response.data || 'An error Occured', status: false, errors: true });
  }
}

const get_query_product_by_aggregator = async (req, res) => {
  try {
    const response = await axios.get(`${TEST_URL}misc/query_product_by_aggregator`, {
      headers: {
        Authorization: "Bearer " + (await login()),
      },
    })
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data, token: login() })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ advancly: error.response.data || 'An error Occured', status: false, errors: true, });
  }
}

const get_details = async (phone, email) => {
  try {
    const res = await axios.post(
      'https://mobile.creditclan.com/api/v3/customer/check/details', {
      phone, email
    }, { headers: { 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' } });

    return res?.data?.token;
  } catch (error) {
    console.log(error);
  }
}

const get_deatils_by_id = async (token) => {
  try {
    const details = await axios.post("https://mobile.creditclan.com/api/v3/user/detailsbyid", { token }, {
      headers: {
        "x-api-key": "WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228",
      },
    });

    if (details.data.status) {
      return details?.data.data.userData;
    }
    else {
      return []
    }
  } catch (error) {
    console.log(error);
  }
}

const getCcRequestDetails = async (token, request_id) => {
  const res = await axios.post('https://mobile.creditclan.com/api/v3/loan/details', { token, request_id },
    {
      headers: ({ 'x-api-key': 'WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228' })
    })
  return res.data.data ?? []
}

const loan_application = async (req, res) => {
  const { phone, email, token, request_id, loan_tenure, annual_interest_rate, loan_purpose, customer_category } = req.body;

  const aggregator_loan_ref = uuidv4();

  try {
    const d = await get_details(phone, email);
    const { data } = await get_deatils_by_id(d);
    const cc_details = await getCcRequestDetails(token, request_id);

    let name = data.profile.legal_name.split(' ');
    let bank_account = data.accounts[data.accounts.length - 1];
    let { profile, home_address, work } = data;

    const response = await axios.post(`${TEST_URL}account/loan_application`, { last_name: name[1], first_name: name[0], bank_account_name: bank_account.card_name, email: profile.email, phone_number: phone, gender: profile.gender === '0' ? 'Male' : 'Female', photo_url: profile.file_name, residence_address: home_address.home_address, city: home_address.home_state, state: home_address.home_state_text, date_of_birth: profile.date_of_birth, borrower_type: 1, bank_account_num: bank_account.last_four_digits, bank_code: bank_account.bank_code, aggregator_loan_ref, product_id: 94, sector_code: '2', country_code: 'NG', loan_tenure, loan_amount: cc_details.loandetails.REQUEST_PRINCIPAL, annual_interest_rate, loan_purpose, customer_category, create_wallet: true, bvn: (profile.bvn), identity_number: profile.bvn }, {
      headers: {
        Authorization: "Bearer " + (await login()),
        // 'client-id': advanclt_client_id,
        // 'api-key': advancly_api_key
      },
    })

    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data, aggregator_loan_ref });

  } catch (error) {
    console.log({ error });
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

const get_loan_by_refrence = async (req, res) => {
  const { loan_ref, aggregator_loan_ref } = req.body;
  try {
    const response = await axios.get(`${TEST_URL}eco/agg_search_loans?loan_ref=${loan_ref}&aggregator_loan_ref=${aggregator_loan_ref}`, {
      headers: {
        Authorization: "Bearer " + (await login()),
      },
    })
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    console.log(error?.response?.data?.message);
    res.status(500).json({ message: error?.response?.data, status: false, error: true, });
  }
}

const get_seccurity_questions = async (req, res) => {
  try {
    const response = await axios.get(`${TEST_URL_V2}client/wallet/security_questions`, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ message: error?.response?.data, status: false, error: true, });
  }
}

const get_signed_banks = async (req, res) => {
  try {
    const response = await axios.get(`${TEST_URL_V2}client/wallet/signed_banks`, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

const get_default_wallet = async (req, res) => {
  const { customer_id, phone_number, email } = req.body;
  try {
    const response = await axios.get(`${TEST_URL_V2}client/wallet/default?customer_id=${customer_id}`, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

const get_wallet_transactions = async (req, res) => {
  const { account_number } = req.body;
  try {
    const response = await axios.get(`${TEST_URL_V2}client/wallet/wallet_transactions/${account_number}`, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

const save_security_question = async (req, res) => {
  const { question_id, customer_id, answer } = req.body;
  try {
    const response = await axios.post(`${TEST_URL_V2}client/wallet/answer/security_question`, { question_id, customer_id, answer }, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

const set_pin = async (req, res) => {
  const { customer_id, pin } = req.body;
  try {
    const response = await axios.post(`${TEST_URL_V2}client/wallet/set_pin`, { pin, customer_id }, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    console.log(response)
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

// {{baseUrl}}/api/v2/client/wallet/reset_pin

const reset_pin = async (req, res) => {
  const { question_id, answer, customer_id, aggregator_id, pin } = req.body;
  try {
    const response = await axios.post(`${TEST_URL_V2}client/wallet/reset_pin`, { pin, customer_id, aggregator_id, answer, question_id }, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

const withdraw_funds = async (req, res) => {
  const { sender_account_number, sender_wallet_id, customer_id, recipient_account_number, recipient_bank_code, amount, pin, comment } = req.body;
  try {
    const response = await axios.post(`${TEST_URL_V2}client/wallet/withdraw_funds`, { sender_account_number, sender_wallet_id, customer_id, recipient_account_number, recipient_bank_code, amount, pin, comment }, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

const loan_repayment = async (req, res) => {
  const { loan_ref_no, amount } = req.body;
  try {
    const response = await axios.post(`${TEST_URL_V2}client/loans/initiate_repayment`, { loan_ref_no, amount }, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
  } catch (error) {
    console.log(error?.response?.data);
    res.status(500).json({ message: error?.response?.data, status: false, error: true });
  }
}

module.exports = { get_country_state, get_country_bank_list, get_sectors, get_query_product_by_aggregator, loan_application, get_loan_by_refrence, get_seccurity_questions, get_signed_banks, get_default_wallet, save_security_question, set_pin, reset_pin, get_wallet_transactions, withdraw_funds, loan_repayment }
