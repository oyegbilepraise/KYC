const db = require("../models");
let a = require("dotenv").config();
const interactive = require("../helpers/responses");
const axios = require("axios");

let step = 0;
let stage = 0;

const customer_kyc = async (req, res) => {
  const { phoneNumber, response } = req.body;

  let newPhone = "0" + phoneNumber.substr(-10);

  try {
    if (step == 0 && stage == 0 && response.trim().toLowerCase() == "cc-kyc") {
      stage = 0;
      step = 0;
      let fetch = await axios.post(
        "https://mobile.creditclan.com/api/v3/customer/check/details",
        { phone: newPhone },
        {
          headers: {
            "x-api-key":
              "WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228",
          },
        }
      );

      if (fetch.data.status === true) {
        let newFetch = await axios.post(
          "https://mobile.creditclan.com/api/v3/user/detailsbyid",
          { token: fetch.data.token },
          {
            headers: {
              "x-api-key":
                "WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228",
            },
          }
        );

        await axios.post(
          "https://ccendpoints.herokuapp.com/api/v2/create-kyc",
          {
            phone: phoneNumber,
          }
        );

        message = await interactive.productsButtons(
          "Kindly Choose from the option below",
          [
            { id: "2", title: "Level 2" },
            { id: "1", title: "Level 1" },
          ],
          req?.body?.provider
        );
        step++;
        res.status(200).json({ message });
      } else {
        res.status(200).json({ message: fetch.data.message });
      }
    } else if (step == 1 && stage == 0) {
      if (response == 1) {
        stage = 1;
        let messages =
          "For level 1 verification, we will need the following: \n";
        messages += "Profile picture \n";
        messages += "DOB \n";
        messages += "Gender \n";
        messages += "Email (if available) \n";

        let message = await interactive.productsButtons(
          messages,
          [{ id: "1", title: "Get Started" }],
          req?.body?.provider
        );
        res.status(200).json(message);
        step++;
      } else if (response == 2) {
        stage = 2;
        let messages =
          "For level 2 verification, we will need the following: \n";
        messages += "BVN \n";
        messages += "NIN \n";
        messages += "Signature";

        let message = await interactive.productsButtons(
          messages,
          [{ id: "1", title: "Get Started" }],
          req?.body?.provider
        );
        res.status(200).json(message);
        step++;
      }
    } else if (step == 2 && stage == 1) {
      if (response == 1) {
        let message = "Kindly enter your date of birth.";
        res.status(200).json(message);
        step++;
      }
    } else if (step == 3 && stage == 1) {
      await axios.post("https://ccendpoints.herokuapp.com/api/v2/kyc/update", {
        phone: phoneNumber,
        DOB: response,
      });
      let message = "Kindly enter your gender.";
      res.status(200).json(message);
      step++;
    } else if (step == 4 && stage == 1) {
      await axios.post("https://ccendpoints.herokuapp.com/api/v2/kyc/update", {
        phone: phoneNumber,
        Gender: response,
      });
      let message = await interactive.productsButtons(
        "Kindly enter your email",
        [{ id: "1", title: "Skip" }],
        req?.body?.provider
      );
      res.status(200).json(message);
      step++;
    } else if (step == 5 && stage == 1) {
      if (response == 1) {
        let message = "Kindly Upload your profile picture.";
        res.status(200).json(message);
        step++;
      } else {
        await axios.post(
          "https://ccendpoints.herokuapp.com/api/v2/kyc/update",
          {
            phone: phoneNumber,
            Email: response,
          }
        );
        let message = "Kindly Upload your profile picture.";
        res.status(200).json(message);
        step++;
      }
    } else if (step == 6 && stage == 1) {
      await axios.post("https://ccendpoints.herokuapp.com/api/v2/kyc/update", {
        phone: phoneNumber,
        profile_picture: response,
      });
      res
        .status(200)
        .json("Thank you. We will review your request and get back to you.");
    } else if (step == 2 && stage == 2) {
      if (response == 1) {
        let message = "Kindly provide your BVN.";
        res.status(200).json(message);
        step++;
      }
    } else if (step == 3 && stage == 2) {
      await axios.post("https://ccendpoints.herokuapp.com/api/v2/kyc/update", {
        phone: phoneNumber,
        bvn: response,
      });
      let message = "Kindly provide your NIN.";
      res.status(200).json(message);
      step++;
    } else if (step == 4 && stage == 2) {
      await axios.post("https://ccendpoints.herokuapp.com/api/v2/kyc/update", {
        phone: phoneNumber,
        nin: response,
      });
      let message = await interactive.productsButtons(
        "Kindly enter your signature",
        [{ id: "1", title: "Skip" }],
        req?.body?.provider
      );
      res.status(200).json(message);
      step++;
    } else if (step == 5 && stage == 2) {
      await axios.post("https://ccendpoints.herokuapp.com/api/v2/kyc/update", {
        phone: phoneNumber,
        signature: response,
      });
      res
        .status(200)
        .json("Thank you. We will review your request and get back to you.");
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { customer_kyc };