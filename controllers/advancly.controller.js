const axios = require("axios");
const TEST_URL = "https://advancly-api-master.staging.vggdev.com/api/v1/";
const TEST_URL_V2 = "https://advancly-api-master.staging.vggdev.com/api/v2/"
const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require('uuid');

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

const loan_application = async (req, res) => {
  // const identity_number = uuidv4();
  const aggregator_loan_ref = uuidv4();

  const { last_name, first_name, bank_account_name, email, phone_number, gender, photo_url, residence_address, city, state, date_of_birth, borrower_type, company_name, registration_number, company_address, company_city, company_state, bank_account_num, bank_code, product_id, sector_code, country_code, loan_tenure, loan_amount, annual_interest_rate, loan_purpose, customer_category, create_wallet, identity_number, BVN, bvn } = req.body;

  try {
    const response = await axios.post(`${TEST_URL_V2}client/loans/application`, { last_name, first_name, bank_account_name, email, phone_number, gender, photo_url, residence_address, city, state, date_of_birth, borrower_type, company_name, identity_number, registration_number, company_address, company_city, company_state, bank_account_num, bank_code, aggregator_loan_ref, product_id, sector_code, country_code, loan_tenure, loan_amount, annual_interest_rate, loan_purpose, customer_category, create_wallet, BVN, bvn }, {
      headers: {
        // Authorization: "Bearer " + (await login()),
        'client-id': advanclt_client_id,
        'api-key': advancly_api_key
      },
    })
    console.log(response.data);
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data, aggregator_loan_ref })
  } catch (error) {
    console.log(error?.response?.data?.message);
    res.status(500).json({ message: error?.response?.data, status: false, error: true, payload: req.body });
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
    const response = await axios.get(`${TEST_URL_V2}client/wallet/default/${customer_id}?phone=${phone_number}&email=${email}`, { headers: { 'client-id': advanclt_client_id, 'api-key': advancly_api_key } });
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
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
module.exports = { get_country_state, get_country_bank_list, get_sectors, get_query_product_by_aggregator, loan_application, get_loan_by_refrence, get_seccurity_questions, get_signed_banks, get_default_wallet, save_security_question, set_pin, reset_pin };
