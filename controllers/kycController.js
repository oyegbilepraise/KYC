const db = require("../models");
let a = require("dotenv").config();
const interactive = require("../helpers/responses");
const axios = require("axios");
const request = require("../helpers/request")

const KYC = db.kyc;
let step = 0;
let stage = 0;

const kyc = async (req, res) => {
  let { phone, response } = req.body;

  let [starting, created] = await KYC.findOrCreate({
    where: { phone: "0" + phone.substr(-10) },
    defaults: { phone: "0" + phone.substr(-10) },
  });

  if (starting) {
    step = starting.step;
    stage = starting.stage;
  }

  let message;

  try {
    if (step == 0 && stage == 0 && response.trim().toLowerCase() == "field") {
      stage = 0;
      step = 0;
      step++;
      const user = await request.getStaffDetails(phone);
      console.log({ user });
      let messages = `Welcome ${user.data.full_name} Please select from below options`;
      message = await interactive.List(messages, [
        { id: "1", title: "My Lead" },
        { id: "2", title: "My Transactions Today" },
        { id: "3", title: "My Teams Today" },
        { id: "4", title: "Claim Merchant" },
        { id: "5", title: "Report Card" },
      ]);
      await KYC.update({ step, location: user?.data?.id }, { where: { id: starting.id } });
    } else if (step === 1 && stage === 0) {
      if (response === '1') {
        let { data } = await request.getStaffDetails(phone);
        if (data.lead !== null) {
          message = `You are already attached to a Team Lead \n\n Thank you!`
          step = 0, stage = 0;
        } else {
          message = 'Please enter team lead number';
          step++;
        }
        await KYC.update({ step, stage }, { where: { id: starting.id } });
      } else if (response === '2') {
        const data = await request.merchantCount(phone, 'today');
        const merchant = await request.getMerchantTransactions(data.merchant_ids, 1)
        const url = `https://cc-payments.netlify.app/report/${starting.location}/today`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        step = 0, stage = 0;
        let count = (+merchant.inflows || 0) + (+merchant.outflow || 0);
        message = `Inflow Count: ${merchant.inflows || 0}, \n Outflow Count: ${merchant.outflows || 0}, \n Merchant Count: ${data.onboarded_merchants_count || 0}, \n Transaction Count: ${count || 0}. \n\n Click on the link below to check details \n\n ${body?.data?.url}`
        await KYC.update({ step, stage }, { where: { id: starting.id } });
      } else if (response === '3') {
        const data = await request.teamLeadCount(phone, 'today');
        const url = `https://cc-payments.netlify.app/report/bm/${starting.location}/today`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        message = `Inflow Amount: ${data.inflows || 0}, \n Outflow Amount: ${data.outflows || 0}, \n Merchant Count: ${data.onboarded_merchants_count}, \n Team Members: ${data.team_members.length || 0} \n\n Click on the link below for details \n\n ${body?.data?.url}`;
        step = 0, stage = 0;
        await KYC.update({ step, stage }, { where: { id: starting.id } });
      } else if (response === '4') {
        message = 'Claim Merchant'
        step = 1, stage = 3;
      } else if (response === '5') {
        let messages =
          `Please choose an option`;
        message = await interactive.productsButtons(
          messages,
          [
            { id: "1", title: "Me" },
            { id: "2", title: "My Team" },
          ],
          req?.body?.provider
        );
        step = 1, stage = 4;
        await KYC.update({ step, stage }, { where: { id: starting.id } });
      }
    } else if (step === 2 && stage === 0) {
      let { data } = await request.getStaffDetails(response);
      let messages =
        `The Team lead name is ${data.full_name}`;
      message = await interactive.productsButtons(
        messages,
        [
          { id: "2", title: "No! Cancel" },
          { id: "1", title: "Yes! Continue" },
        ],
        req?.body?.provider
      );
      step++;
      await KYC.update({ step, other_name: data.mobile }, { where: { id: starting.id } });
    } else if (step === 3 && stage === 0) {
      if (response === '1') {
        await request.attachAgentToLead(starting.other_name, phone);
        message = 'You have successfully been attached to this team lead.';
        stage = 0;
        step = 0;
        await KYC.update({ step, stage }, { where: { id: starting.id } });
      }
      else if (response === '2') {
        message = 'Please enter team lead number';
        step = 2;
        await KYC.update({ step }, { where: { id: starting.id } });
      }
    } else if (step === 1 && stage === 4) {
      if (response === '1') {
        const data = await request.merchantCount(phone, 'month');
        const merchant = await request.getMerchantTransactions(data.merchant_ids, 1);
        const url = `https://cc-payments.netlify.app/report/${starting.location}/month`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        let count = (+merchant.inflows || 0) + (+merchant.outflows || 0);
        message = `Inflow Count: ${merchant.inflows || 0}, \n Outflow Count: ${merchant.outflows || 0}, \n Merchant Count: ${data.onboarded_merchants_count || 0}, \n Transaction Count: ${count || 0}   \n\n Click on the link below to check details \n\n ${body?.data?.url}`
      } else if (response === '2') {
        const data = await request.teamLeadCount(phone, 'month');
        const url = `https://cc-payments.netlify.app/report/bm/${starting.location}/month`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        message = `Inflow Amount: ${data.inflows || 0}, \n Outflow Amount: ${data.outflows || 0}, \n Merchant Count: ${data.onboarded_merchants_count || 0}, \n Team Members: ${data.team_members.length || 0} \n\n Please click on the link below for details ---  \n\n Click on the link below to check details \n\n ${body?.data?.url}`;
      }
    }
    return res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    console.log(error.response?.data);
    res.status(500).json({ error: error?.response?.data })
  }
};

const hygeia = async (req, res) => {
  const { start } = req.body
  try {
    const response = await axios.post(
      `https://mobile.creditclan.com/api/v3/hygeiae/requests`,
      { start },
      {
        headers: {
          "x-api-key":
            "WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228",
        },
      }
    );
    res
      .status(200)
      .json({ status: true, error: false, message: "Success", data: response.data });
  } catch (error) {
    return res.status(200).json({ message: "Failed", error });
  }
};

const hygeia_schedule = async (req, res) => {
  const { creditclan_request_id } = req.body
  try {
    const response = await axios.post('https://mobile.creditclan.com/api/v3/loan/recovery', { creditclan_request_id }, {
      headers: {
        "x-api-key":
          "WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228",
      },
    })
    res
      .status(200)
      .json({ status: true, error: false, message: "Success", data: response.data });
  } catch (error) {
    return res.status(200).json({ message: "Failed", error });
  }
}

module.exports = { kyc, hygeia, hygeia_schedule };
