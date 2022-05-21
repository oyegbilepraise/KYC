const db = require("../models");
let a = require("dotenv").config();
const interactive = require("../helpers/responses");
const axios = require("axios");

const KYC = db.cc_kyc;

let step = 0;
let stage = 0;

const customer_kyc = async (req, res) => {
  const { phoneNumber, response } = req.body;

  let [starting, created] = await KYC.findOrCreate({
    where: { phone: "0" + phoneNumber.substr(-10) },
    defaults: { phone: "0" + phoneNumber.substr(-10) },
  });

  if (starting) {
    step = starting.step;
    stage = starting.stage;
  }

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

        let user = newFetch.data.data.userData.data;

        if(starting.level == 1 && starting.confirmed == 0) {
          let message = `Hi, ${user?.profile?.legal_name} \n You have a pending confirmation on KYC-Level ${starting.level}`
          res.status(200).json(message)
        }
        else if(starting.level == 2 && starting.confirmed == 0) {
          let message = `Hi, ${user?.profile?.legal_name} \n You have a pending confirmation on KYC-Level ${starting.level}`
          res.status(200).json(message)
        } else{
          message = await interactive.productsButtons(
            ` Hi, ${user?.profile?.legal_name} \n You're currently on KYC Level ${starting.level}\n \n Kindly Choose from the option below`,
            [
              { id: "2", title: "Level 2" },
              { id: "1", title: "Level 1" },
            ],
            req?.body?.provider
          );
  
          step++;
          await KYC.update(
            {
              step,
              full_name: user?.profile?.legal_name,
              residential_address: user?.home_address?.home_address,
              email: user.profile?.email,
              dob: user?.profile.date_of_birth,
              bvn: user?.profile?.bvn,
              gender: user?.profile?.gender == 0 ? "Male" : "Female"
            },
            { where: { id: starting.id } }
          );
          res.status(200).json({ message });
        }
      } else {
        res.status(200).json({ message: fetch.data.message });
      }
    } else if (step == 1 && stage == 0) {
      if (response == 1) {
        stage = 1;
        let messages =
          "For level 1 verification, we will need the following: \n";
        messages += "*[1]*. Profile picture \n";
        messages += "*[2]*. DOB \n";
        messages += "*[3]*. Gender \n";
        messages += "*[4]*.Email (if available) \n";

        let message = await interactive.productsButtons(
          messages,
          [{ id: "1", title: "Get Started" }],
          req?.body?.provider
        );
        step++;
        await KYC.update(
          {
            step,
            stage,
          },
          { where: { id: starting.id } }
        );
        res.status(200).json(message);
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
        await KYC.update(
          {
            step,
            stage,
          },
          { where: { id: starting.id } }
        );
      }
    } else if (step == 2 && stage == 1) {
      if (response == 1) {
        let message = "Kindly enter your date of birth.";
        res.status(200).json(message);
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      }
    } else if (step == 3 && stage == 1) {
      step++;
      let message = "Kindly enter your gender.";
      await KYC.update(
        {
          step,
          dob: response,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (step == 4 && stage == 1) {
      step++;
      let message = await interactive.productsButtons(
        "Kindly enter your email",
        [{ id: "1", title: "Skip" }],
        req?.body?.provider
      );
      await KYC.update(
        {
          step,
          gender: response,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (step == 5 && stage == 1) {
      if (response == 1) {
        let message = "Kindly Upload your profile picture.";
        res.status(200).json(message);
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      } else {
        step++;
        let message = "Kindly Upload your profile picture.";
        await KYC.update(
          {
            step,
            email: response,
          },
          { where: { id: starting.id } }
        );
        res.status(200).json(message);
      }
    } else if (step == 6 && stage == 1) {
      await KYC.update(
        {
          step: 0, stage: 0,
          profile_picture: response,
          level: 1, 
        },
        { where: { id: starting.id } }
      );
      res
        .status(200)
        .json("Thank you. We will review your request and get back to you.");
    } else if (step == 2 && stage == 2) {
      if (response == 1) {
        let message = "Kindly provide your BVN.";
        res.status(200).json(message);
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      }
    } else if (step == 3 && stage == 2) {
      step++;
      let message = "Kindly provide your NIN.";
      await KYC.update(
        {
          step,
          bvn: response,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (step == 4 && stage == 2) {
      step++;
      let message = await interactive.productsButtons(
        "Kindly enter your signature",
        [{ id: "1", title: "Skip" }],
        req?.body?.provider
      );
      await KYC.update(
        {
          step,
          nin: response,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (step == 5 && stage == 2) {
      await KYC.update(
        {
          signature: response,
          step: 0, stage: 0, level: 2
        },
        { where: { id: starting.id } }
      );
      res
        .status(200)
        .json("Thank you. We will review your request and get back to you.");
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getAll = async (req, res) => {
  try{
    let ress = await KYC.findAll({ where: { delete: 0 }})
    res.status(200).json({ress})
  } catch (error) {
    res.status(500).json({ error });
  }
}

const deleteOne = async (req, res) => {
  const {id} = req.body
  try{
    let data = await KYC.update(
      {
        delete: 1
      },
      { where: { id } }
    );

    res.status(200).json(data)
  } catch(error){
    res.status(500).json({ error });
  }
}

module.exports = { customer_kyc, getAll, deleteOne };