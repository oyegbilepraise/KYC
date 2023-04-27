const db = require("../models");
let a = require("dotenv").config();
const interactive = require("../helpers/responses");
const axios = require("axios");
const request = require("../helpers/request")

const KYC = db.kyc;
let step = 0;
let stage = 0;

const callClaimMerchant = async (response, phone, provider, channelId) => {
  try {
    const res = await axios.post('https://wasapnodeserver.herokuapp.com/claim_merchant', { response, phoneNumber: phone, provider, channelId, source: 'field' });

    return res.data ?? null;
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
  }
}

const callBookCredit = async (response, phone, provider, channelId) => {
  try {
    const res = await axios.post('https://wasapnodeserver.herokuapp.com/se_statement', { phoneNumber: phone, response, provider, channelId });

    return res.data ?? null;
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
  }
}

const callOnboardMerchant = async (response, phone, provider, channelId) => {
  try {
    const res = await axios.post('https://wasapnodeserver.herokuapp.com/onboard_merchant', { phoneNumber: phone, response, provider, channelId });

    return res.data ?? null;
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
  }
}

const kyc = async (req, res) => {
  let { phone, response, provider, channelId } = req.body;
  let message;
  let trimmed_res = response.trim().toLowerCase();
  phone = "0" + phone.substr(-10);
  let list = [
    { id: "lead", title: "My Lead" },
    { id: "mtt-se", title: "Transactions Today" },
    { id: "mtt-bm", title: "My Teams Today" },
    { id: "claim", title: "Claim Merchant" },
    { id: "report-card", title: "Report Card" },
    { id: 'b-k', title: 'Book Credit' },
    { id: 'o-m', title: 'Onboard Merchant' }
  ]

  let [starting, created] = await KYC.findOrCreate({
    where: { phone: "0" + phone.substr(-10) },
    defaults: { phone: "0" + phone.substr(-10) },
  });

  if (starting) {
    step = starting.step;
    stage = starting.stage;
  }

  if (trimmed_res === 'field') {
    step = 0, stage = 0;
    await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
  }

  if (trimmed_res === 'lead' || trimmed_res === 'mtt-se' || trimmed_res === 'mtt-bm' || trimmed_res === 'claim' || trimmed_res === 'report-card') {
    step = 1, stage = 0;
    await KYC.update({ step, stage }, { where: { id: starting.id } });
  }

  try {
    if (step == 0 && stage == 0 && trimmed_res == "field") {
      const user = await request.getStaffDetails(phone);
      if (user) {
        let messages = `Welcome *${user.data.full_name}* \n\nPlease select from options below`;
        message = await interactive.List(messages, list);
        await KYC.update({ step: 1, stage: 0, location: user?.data?.id }, { where: { id: starting.id } });
      } else {
        let messages = 'You are not allowed to use this service '
        message = await interactive.List(messages, list);
      }
    } else if (step === 1 && stage === 0) {
      if (response === 'lead') {
        let { data } = await request.getStaffDetails(phone);
        if (data.lead !== null) {
          let messages = `You are already attached to a Team Lead \n\nThank you!`
          message = await interactive.List(messages, list);
          step = 0, stage = 0;
        } else {
          message = 'Please enter team lead number';
          step++;
        }
        await KYC.update({ step, stage }, { where: { id: starting.id } });
      } else if (response === 'mtt-se') {
        const data = await request.merchantCount(phone, 'today');
        const merchant = await request.getMerchantTransactions(data.merchant_ids, 1)
        const url = `https://cc-payments.netlify.app/report/${starting.location}/today`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        let count = (+merchant.inflows || 0) + (+merchant.outflow || 0);
        message = `Inflow Count: ${merchant.inflows || 0}, \nOutflow Count: ${merchant.outflows || 0}, \nMerchant Count: ${data.onboarded_merchants_count || 0}, \n Transaction Count: ${count || 0}. \n\nClick on the link below to check details \n\n ${body?.data?.url}`
        await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
      } else if (response === 'mtt-bm') {
        const data = await request.teamLeadCount(phone, 'today');
        const url = `https://cc-payments.netlify.app/report/bm/${starting.location}/today`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        message = `Inflow Amount: ${data.inflows || 0}, \nOutflow Amount: ${data.outflows || 0}, \nMerchant Count: ${data.onboarded_merchants_count}, \nTeam Members: ${data.team_members.length || 0} \n\n Click on the link below for details \n\n ${body?.data?.url}`;
        await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
      } else if (response === 'claim') {
        const claim = await callClaimMerchant('claim', phone, provider, channelId)
        message = claim.message
        await KYC.update({ step: 1, stage: 3 }, { where: { id: starting.id } });
      } else if (response === 'report-card') {
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
        await KYC.update({ step: 1, stage: 4 }, { where: { id: starting.id } });
      } else if (response === 'b-k') {
        const claim = await callBookCredit('statement', phone, provider, channelId);
        message = claim.message;
        await KYC.update({ step: 1, stage: 5 }, { where: { id: starting.id } });
      } else if (response === 'o-m') {
        const claim = await callOnboardMerchant('merchant', phone, provider, channelId);
        message = claim.message;
        await KYC.update({ step: 1, stage: 6 }, { where: { id: starting.id } });
      }
    } else if (step === 2 && stage === 0) {
      let data = await request.getStaffDetails(response);
      if (data.status) {
        if (phone === data?.data?.mobile) {
          let messages = 'You can not add yourself as team lead. Please enter your team lead\'s number'
          message = await interactive.List(messages, list);
        } else {
          let messages =
            `The Team lead name is ${data?.data?.full_name}`;
          message = await interactive.productsButtons(
            messages,
            [
              { id: "2", title: "No! Cancel" },
              { id: "1", title: "Yes! Continue" },
            ],
            req?.body?.provider
          );
          step++;
          await KYC.update({ step, other_name: data?.data?.mobile }, { where: { id: starting.id } });
        }
      } else {
        let messages = 'This number does not belong to any team lead, please try again'
        message = await interactive.List(messages, list);
      }
    } else if (step === 3 && stage === 0) {
      if (response === '1') {
        await request.attachAgentToLead(starting.other_name, phone);
        let messages = 'You have successfully been attached to this team lead.';
        message = await interactive.List(messages, list);
        await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
      }
      else if (response === '2') {
        message = 'Please enter team lead number';
        await KYC.update({ step: 2 }, { where: { id: starting.id } });
      }
    } else if (step === 1 && stage === 4) {
      if (response === '1') {
        const data = await request.merchantCount(phone, 'month');
        const merchant = await request.getMerchantTransactions(data.merchant_ids, 2);
        const url = `https://cc-payments.netlify.app/report/${starting.location}/month`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        let count = (+merchant.inflows || 0) + (+merchant.outflows || 0);
        let messages = `Inflow Count: ${merchant.inflows || 0}, \nOutflow Count: ${merchant.outflows || 0}, \nMerchant Count: ${data.onboarded_merchants_count || 0}, \nTransaction Count: ${count || 0}   \n\nClick on the link below to check details \n\n ${body?.data?.url}`
        message = await interactive.List(messages, list);
        await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
      } else if (response === '2') {
        const data = await request.teamLeadCount(phone, 'month');
        const merchant = await request.getMerchantTransactions(data.merchant_ids, 2);
        const url = `https://cc-payments.netlify.app/report/bm/${starting.location}/month`;
        const body = await axios.get(`https://cclan.cc/?url=${url}&format=json`);
        let messages = `Inflow Amount: ${merchant?.inflows || 0}, \nOutflow Amount: ${merchant?.outflows || 0}, \nMerchant Count: ${data?.onboarded_merchants_count || 0}, \nTeam Members: ${data?.team_members?.length || 0} \n\nClick on the link below to check details \n\n ${body?.data?.url}`;
        await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
        message = await interactive.List(messages, list);
      }
    } else if (step === 1 & stage === 3) {
      const claim = await callClaimMerchant(response, phone, provider, channelId);
      let messages = claim.message;
      await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
      message = await interactive.List(messages, list);
    } else if (step === 1 && stage === 5) {
      const claim = await callBookCredit(response, phone, provider, channelId);
      if (claim.status) {
        let messages = claim.message;
        await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
        message = await interactive.List(messages, list);
      } else {
        message = claim.message;
      }
    } else if (step === 1 && stage === 6) {
      const claim = await callOnboardMerchant(response, phone, provider, channelId);
      if (claim.status) {
        let messages = claim.message;
        await KYC.update({ step: 0, stage: 0 }, { where: { id: starting.id } });
        message = await interactive.List(messages, list);
      } else {
        message = claim.message;
      }
    }
    return res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    console.log(error.response?.data);
    res.status(500).json({ error: error?.response?.data });
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