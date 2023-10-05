const axios = require("axios");

const getStaffDetails = async (phone) => {
  try {
    const body = await axios.get(`https://sellbackend.creditclan.com/merchantclan/public/index.php/api/agent?phone=${phone}`);
    return body.data || null;
  } catch (error) {
    console.log(error?.response?.body ?? error);
    return false;
  }
}

const attachAgentToLead = async (lead_phone, agent_phone) => {
  try {
    const body = await axios.post(`https://sellbackend.creditclan.com/merchantclan/public/index.php/api/agent/lead`, { lead_phone, agent_phone });
    console.log(body.data);
    return body.data.data || null;

  } catch (error) {
    console.log(error);
    console.log(error?.response?.body ?? error);
    return false;
  }
}

const merchantCount = async (agent_phone, filter) => {
  try {
    const body = await axios.get(`https://sellbackend.creditclan.com/merchantclan/public/index.php/api/agent/report?filter=${filter}&agent_phone=${agent_phone}`);
    return body.data.data || null;
  } catch (error) {
    console.log(error?.response?.body ?? error);
    return false;
  }
}

const teamLeadCount = async (agent_phone, filter) => {
  try {
    const body = await axios.get(`https://sellbackend.creditclan.com/merchantclan/public/index.php/api/agent/report?agent_phone=${agent_phone}&filter=${filter}&lead=true`)
    return body?.data?.data || null;

  } catch (error) {
    console.log(error?.response?.body ?? error);
    return false;
  }
}

const getMerchantTransactions = async (merchant_id, period) => {
  console.log(merchant_id, period);
  try {
    const body = await axios.post(`https://wema.creditclan.com/api/v3/summary/transsummary/`, { merchant_id, period })

    console.log(body.data);

    return body?.data?.data
  } catch (error) {
    console.log(error?.response?.data ?? error);
    return false;
  }
}

module.exports = { getStaffDetails, attachAgentToLead, merchantCount, teamLeadCount, getMerchantTransactions }