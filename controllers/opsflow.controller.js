const { default: axios } = require("axios")
const BASE_URL = 'http://opsflow.18.233.64.250.nip.io/'

const create_track = async (req, res) => {
    const { name, description, bucket_name, bucket_description } = req.body;
    try {
        const response = await axios.post(`${BASE_URL}track`, { name, description, bucket_name, bucket_description })
        res.status(200).json({ status: true, error: false, data: response.data.data, message: "created track successfully" });
    } catch (error) {
        res.status(500).json({ error: true, status: false, message: error?.response?.data || 'An error occurred, Please try again later' })
    }
}

const create_observer = async (req, res) => {
    const { fname, lname, email } = req.body;
    try {
        const response = await axios.post(`${BASE_URL}observer`, { fname, lname, email })
        res.status(200).json({ status: true, error: false, data: response.data.data, message: "created observer successfully" });
    } catch (error) {
        res.status(500).json({ error: true, status: false, message: error?.response?.data || 'An error occurred, Please try again later' })
    }
}

const create_bucket = async (req, res) => {
    const { track_id, name } = req.body;
    try {
        const response = await axios.post(`${BASE_URL}bucket`, { track_id, name })
        res.status(200).json({ status: true, error: false, data: response.data.data, message: "created bucket successfully" });
    } catch (error) {
        res.status(500).json({ error: true, status: false, message: error?.response?.data || 'An error occurred, Please try again later' })
    }
}

const register_observer_to_track = async (req, res) => {
    const { track_id } = req.body;
    try {
        const response = await axios.post(`${BASE_URL}observer/${track_id}/track`, { track_id })
        res.status(200).json({ status: true, error: false, data: response.data.data, message: "obect - track successful" });
    } catch (error) {
        res.status(500).json({ error: true, status: false, message: error?.response?.data || 'An error occurred, Please try again later' })
    }
}

const push_object_to_track = async (req, res) => {
    const { track_id, o_identifier } = req.body;
    try {
        const response = await axios.post(`${BASE_URL}rail`, { track_id, o_identifier })
        res.status(200).json({ status: true, error: false, data: response.data.data, message: "Object pushed to track successfully" });
    } catch (error) {
        res.status(500).json({ error: true, status: false, message: error?.response?.data || 'An error occurred, Please try again later' })
    }
}

module.exports = { create_track, create_observer, create_bucket, register_observer_to_track, push_object_to_track };