const axios = require("axios");
const TEST_URL = "https://advancly-api-master.staging.vggdev.com/api/v1/";
const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const qs = require('querystring')


const client_id = process.env.bolt_client_id;
const client_secret = process.env.bolt_client_secret;

const db = require("../models");
const BOLT = db.bolt;


const login = async () => {
    let body = {
        client_id, client_secret, grant_type: 'client_credentials', scope: 'business-integrations:api'
    }
    try {
        const res = await axios.post(`https://oidc.bolt.eu/token`, qs.stringify(body), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        return res.data.access_token;
    } catch (error) {
        console.log(error);
        console.log(error?.response?.data);
    }
}

const getActivePeople = async (req, res) => {
    try {
        const response = await axios.get('https://node.taxify.eu/business-integration/businessIntegration/v2/getActivePeople', {
            headers: {
                Authorization: "Bearer " + (await login()),
            },
        });

        res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data.data })
    } catch (error) {
        res.json({ error: true, status: false, message: error?.response?.data || 'An error occurred'})
    }
}

const deactivatePeople = async (req, res) => {
    const { email } = req.body
    try {
        const response = await axios.post('https://node.taxify.eu/business-integration/businessIntegration/v2/deactivatePerson', { email }, {
            headers: {
                Authorization: "Bearer " + (await login()),
            },
        });

        res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data });
    } catch (error) {
        console.log(error?.response?.data);
        res.status(500).json({ error: error?.response?.data || 'An error Occured', status: false, error: true });
    }
}

const updatePeopleProfile = async (req, res) => {
    const { last_name, email, first_name, external_user_id, phone } = req.body

    try {
        const response = await axios.post('https://node.taxify.eu/business-integration/businessIntegration/v2/updatePersonProfile', { email, last_name, first_name, external_user_id, phone }, {
            headers: {
                Authorization: "Bearer " + (await login()),
            },
        });

        res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
    } catch (error) {
        res.status(500).json({ error: error.response.data || 'An error Occured', status: false, error: true });
    }
}

const addPeopleProfile = async (req, res) => {
    const { last_name, email, first_name, phone, external_group_id } = req.body;
    try {
        const response = await axios.post('https://node.taxify.eu/business-integration/businessIntegration/v2/addorActivatePerson', { user: { email, first_name, phone, last_name }, user_group: { external_group_id } }, {
            headers: {
                Authorization: "Bearer " + (await login()),
            },
        });

        await BOLT.create({...req.body})

        res.status(200).json({ status: true, statusCode: 200, error: false, message: 'Success', data: response.data })
    } catch (error) {
        res.status(500).json({ error: error.response.data || 'An error Occured', status: false, error: true });
    }
}



module.exports = { getActivePeople, deactivatePeople, updatePeopleProfile, addPeopleProfile, login }