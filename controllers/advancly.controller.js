const axios = require("axios");
const TEST_URL = "https://api-sandbox.advancly.com/api/v1/";
const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require('uuid');



const Username = process.env.VT_USERNAME;
const password = process.env.VT_PASSWORD;

const login = async () => {
  try {
    const res = await axios.post('https://api-sandbox.advancly.com/api/v1/account/custom_login', { Username, password })
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
    res.status(500).json({ error: error.response.data || 'An error Occured', status: false, error: true });
  }
}

const get_country_bank_list = async (req, res) => {
  const { country_code } = req.body;
  try {
    const response = await axios.get(`${TEST_URL}account/signed_banks_country?country_code=${country_code}`)
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ error: error.response.data || 'An error Occured', status: false, error: true });
  }
}

const get_sectors = async (req, res) => {
  try {
    const response = await axios.get(`${TEST_URL}misc/sectors`)
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ error: error.response.data || 'An error Occured', status: false, error: true });
  }
}

const get_query_product_by_aggregator = async (req, res) => {
  try {
    const response = await axios.get(`${TEST_URL}misc/query_product_by_aggregator`, {
      headers: {
        Authorization: "Bearer " + (await login()),
      },
    })
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    res.status(500).json({ error: error.response.data || 'An error Occured', status: false, error: true });
  }
}

const loan_application = async (req, res) => {
  const identity_number = uuidv4();
  const aggregator_loan_ref = uuidv4();

  const { last_name, first_name, bank_account_name, email, phone_number, gender, photo_url, residence_address, city, state, date_of_birth, borrower_type, company_name, registration_number, company_address, company_city, company_state, bank_account_num, bank_code, product_id, sector_code, country_code, loan_tenure, loan_amount, annual_interest_rate, loan_purpose, customer_category, create_wallet, BVN, bvn } = req.body;

  try {
    const response = await axios.post(`${TEST_URL}account/loan_application`, { last_name, first_name, bank_account_name, email, phone_number, gender, photo_url, residence_address, city, state, date_of_birth, borrower_type, company_name, identity_number, registration_number, company_address, company_city, company_state, bank_account_num, bank_code, aggregator_loan_ref, product_id, sector_code, country_code, loan_tenure, loan_amount, annual_interest_rate, loan_purpose, customer_category, create_wallet, BVN, bvn }, {
      headers: {
        Authorization: "Bearer " + (await login()),
      },
    })
    res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
  } catch (error) {
    console.log(error.response.data.message);
    res.status(500).json({ message: error?.response?.data?.message, status: false, error: true });
  }
}

module.exports = { get_country_state, get_country_bank_list, get_sectors, get_query_product_by_aggregator, loan_application };

// {
//   "last_name": "Oyegbile",
//   "first_name" : "Praise",
//   "bank_account_name" : "", //required for non nigeria aggregator's alone
//   "email" : "oluwadhammieh@gmail.com",
//   "phone_number" : "09039719017", 
//   "gender": "male", 
//   "photo_url": "", 
//   "residence_address": "my residence_address", 
//   "city": "lagos", 
//   "state": "Lagos", 
//   "date_of_birth": "01 02 2022",
//   "borrower_type": "1", //1 for individual, 2 for corporates
//   "company_name": "", // for corporate borrowers 
//   "registration_number": "", // for corporate borrowers
//   "company_address": "", // for corporate borrowers
//   "company_city": "", // for corporate borrowers
//   "company_state": "", // for corporate borrowers
//   "bank_account_num": "0231755549", 
//   "bank_code": "058", 
//   "product_id": "147", 
//   "sector_code": "1", 
//   "country_code": "NG", 
//   "loan_tenure": "12", 
//   "loan_amount": "1000000", 
//   "annual_interest_rate": "",  //The loan interest rate. If the interest rate is zero, the loan product's interest rate will be used.
//   "loan_purpose": "The reason for which the the loan is created.", 
//   "customer_category": "IT", 
//   "create_wallet": "true" //This indicates if wallet is to be created for a user or not (true or false)
// }