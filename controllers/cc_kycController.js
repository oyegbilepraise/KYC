const db = require("../models");
let a = require("dotenv").config();
const interactive = require("../helpers/responses");
const axios = require("axios");

const KYC = db.cc_kyc;
const AGENT = db.agent

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

  // 2348183130278
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

        if (
          user.next_of_kin?.nok_name != null &&
          user.next_of_kin?.nok_phone &&
          user.next_of_kin?.nok_address != null &&
          user?.next_of_kin?.nok_relationship != null
        ) {
          res.json(user);
        } else if (
          user?.profile?.legal_name != "" &&
          user?.profile?.email != "" &&
          user?.profile?.date_of_birth != "" &&
          user?.profile?.gender != "" &&
          user?.home_address?.home_address != ""
        ) {
          let search = await KYC.findAll({
            where: { id: starting.id, completed: 1 },
          });

          if (search.length > 0) {
            let message = `Hi, ${user?.profile?.legal_name} \nYou have a pending confirmation on KYC-Level ${starting.level}`;
            res.status(200).json(message);
          } else {
            step++;
            await KYC.update(
              {
                step,
                full_name: user?.profile?.legal_name,
                residential_address: user?.home_address?.home_address,
                email: user.profile?.email,
                dob: user?.profile.date_of_birth,
                bvn: user?.profile?.bvn,
                level: 1,
                stage: 2,
                gender: user?.profile?.gender == 0 ? "Male" : "Female",
              },
              { where: { id: starting.id } }
            );

            let messages = `Hi ${user?.profile?.legal_name} \n You're currently on KYC Level 1`;
            let message = await interactive.productsButtons(
              messages,
              [{ id: "1", title: "Upgrade to Level 2" }],
              req?.body?.provider
            );
            res.status(200).json({ message });
          }
        } else {
          step++;
          await KYC.update(
            {
              step,
              stage: 1,
              full_name: user?.profile?.legal_name,
              residential_address: user?.home_address?.home_address,
              email: user.profile?.email,
              dob: user?.profile.date_of_birth,
              bvn: user?.profile?.bvn,
              level: 0,
              gender: user?.profile?.gender == 0 ? "Male" : "Female",
            },
            { where: { id: starting.id } }
          );
          let messages = `Hi ${user?.profile?.legal_name} \n You're currently on KYC Level 0`;
          let message = await interactive.productsButtons(
            messages,
            [{ id: "1", title: "Upgrade" }],
            req?.body?.provider
          );
          res.status(200).json({ message });
        }
        // }
      } else {
        res.status(200).json({ message: fetch.data.message });
      }
    } else if (stage == 2 && step == 1) {
      if (response == 1) {
        let messages =
          "For level 2 verification, we will need the following: \n";
        messages += "BVN \n";
        messages += "NIN \n";
        messages += "Next of Kin Details \n";
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
    } else if (step == 1 && stage == 1) {
      message = await interactive.List(
        `Kindly Select from the option below`,
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
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (step == 2 && stage == 1) {
      if (response == 1) {
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
        step = 3;
        stage = 1;
        await KYC.update(
          {
            step: 3,
            stage: 1,
          },
          { where: { id: starting.id } }
        );
        res.status(200).json(message);
      } else if (response == 2) {
        let messages =
          "For level 2 verification, we will need the following: \n";
        messages += "BVN \n";
        messages += "NIN \n";
        messages += "Next of Kin Details \n";
        messages += "Signature";

        let message = await interactive.productsButtons(
          messages,
          [{ id: "1", title: "Get Started" }],
          req?.body?.provider
        );
        res.status(200).json(message);
        step = 2;
        stage = 2;
        await KYC.update(
          {
            step: 2,
            stage: 2,
          },
          { where: { id: starting.id } }
        );
      }
    } else if (stage == 2 && step == 2) {
      step++;
      let message = "Kindly provide your NIN.";
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 3) {
      step++;
      let message = "Kindly provide your next of kin name.";
      await KYC.update(
        {
          nin: response,
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 4) {
      step++;
      let messages = "Kindly provide your next of kin email.";
      let message = await interactive.productsButtons(
        messages,
        [{ id: "1", title: "Skip" }],
        req?.body?.provider
      );
      await KYC.update(
        {
          nok_name: response,
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 5) {
      if (response == 1) {
        step++;
        let message = "Kindly provide your next of kin address.";
        res.status(200).json(message);
      } else {
        step++;
        let message = "Kindly provide your next of kin address.";
        await KYC.update(
          {
            nok_email: response,
            step,
          },
          { where: { id: starting.id } }
        );
        res.status(200).json(message);
      }
    } else if (stage == 2 && step == 6) {
      step++;
      let message = "Kindly provide your next of kin phone.";
      await KYC.update(
        {
          nok_address: response,
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 7) {
      step++;
      let messages = "Kindly Select your relationship with the next of kin.";
      let message = await interactive.List(messages, [
        { id: "1", title: "Parent" },
        { id: "2", title: "Spouse" },
        { id: "3", title: "Relatives" },
        { id: "4", title: "Colleague" },
        { id: "5", title: "Sibling" },
        { id: "6", title: "Friend" },
      ]);
      await KYC.update(
        {
          nok_phone: response,
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 8) {
      if (response == 1) {
        step++;
        await KYC.update(
          {
            nok_relationship: "Parent",
            level: 2,
            step: 0,
            stage: 0,
            completed: 1,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 2) {
        step++;
        await KYC.update(
          {
            nok_relationship: "Spouse",
            level: 2,
            step: 0,
            stage: 0,
            completed: 1,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 3) {
        step++;
        await KYC.update(
          {
            nok_relationship: "Relatives",
            level: 2,
            step: 0,
            stage: 0,
            completed: 1,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 4) {
        step++;
        await KYC.update(
          {
            nok_relationship: "Colleagues",
            level: 2,
            step: 0,
            stage: 0,
            completed: 1,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 5) {
        step++;
        await KYC.update(
          {
            nok_relationship: "Siblings",
            level: 2,
            step: 0,
            stage: 0,
            completed: 1,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 6) {
        step++;
        await KYC.update(
          {
            nok_relationship: "Friend",
            level: 2,
            step: 0,
            stage: 0,
            completed: 1,
          },
          { where: { id: starting.id } }
        );
      }
      let message =
        "Thank you. We will review your request and get back to you.";
      res.status(200).json(message);
    } else if (step == 3 && stage == 1) {
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
    } else if (step == 4 && stage == 1) {
      step++;
      let messages = "Kindly select your gender.";
      let message = await interactive.List(messages, [
        { id: "1", title: "Male" },
        { id: "2", title: "Female" },
      ]);
      await KYC.update(
        {
          step,
          dob: response,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (step == 5 && stage == 1) {
      step++;
      let message = await interactive.productsButtons(
        "Kindly enter your email",
        [{ id: "1", title: "Skip" }],
        req?.body?.provider
      );
      if (response == 1) {
        await KYC.update(
          {
            step,
            gender: "Male",
          },
          { where: { id: starting.id } }
        );
      } else if (response == 2) {
        await KYC.update(
          {
            step,
            gender: "Female",
          },
          { where: { id: starting.id } }
        );
      }
      res.status(200).json(message);
    } else if (step == 6 && stage == 1) {
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
    } else if (step == 7 && stage == 1) {
      await KYC.update(
        {
          step: 0,
          stage: 0,
          profile_picture: response,
          level: 1,
          completed: 1,
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
  try {
    let ress = await KYC.findAll({ where: { delete: 0, completed: 1 } });
    res.status(200).json({ ress });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const deleteOne = async (req, res) => {
  const { id } = req.body;
  try {
    let data = await KYC.destroy({ where: { id } });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const Agent = async (req, res) => {
  const { phoneNumber, response } = req.body;
  let newPhone = "0" + phoneNumber.substr(-10);

  let [starting, created] = await AGENT.findOrCreate({
    where: { phoneNumber: "0" + phoneNumber.substr(-10) },
    defaults: { phoneNumber: "0" + phoneNumber.substr(-10) },
  });
  
  const { data } = await axios.post(
    "https://sellbackend.creditclan.com/parent/index.php/rent/getAgents",
    { phone: newPhone }
  );


  try {
    if (
      step === 0 &&
      stage === 0 &&
      response.trim().toLowerCase() === "ercan"
    ) {
      if(data.status === true){
        let message = await interactive.List(
          `Welcome *${data.message.full_name}* to Agent Portal \n What will you like to do?. `,
          [
            { id: "2", title: "Check Referrer Balance" },
            { id: "1", title: "Refer a customer" },
          ],
          req?.body?.provider
        );

        res.status(200).json(message)
        step++
      } else {
        let message = 'Sorry, You"re not eligible to use this service'
        res.status(200).json(message)
      }
    } 
    else if (stage === 0 && step === 1) {
      if(response == 1){
        let message = 'Kindly Provide the customer"s name.'
        res.status(200).json(message)
        step++
      } else if (response == 2){
        let message = `You have ${data.message.balance} left`
        res.status(200).json(message)
      }
    } else if (stage === 0 && step === 2) {
      // Save Customer Name
        let message = 'Kindly provide customer"s phone number'
        await AGENT.update(
          {
            name: response,
          },
          { where: { id: starting.id } }
        );
        res.status(200).json(message)
        step++
      } else if (stage === 0 && step === 3) {
        // Save Customer Number
        await AGENT.update(
          {
            referal_phone: response,
          },
          { where: { id: starting.id } }
        );
        let message = await interactive.List(
          `What Services did the customer use?.`,
          [
            { id: "2", title: "Renew Rent" },
            { id: "1", title: "Found House" },
            { id: "3", title: "Found me a House" },
          ],
          req?.body?.provider
        );
        res.status(200).json(message)
        step++
      } else if (stage === 0 && step === 4) {
        if (response == 1) {
          await AGENT.update(
            {
              keyword: 'Found House',
            },
            { where: { id: starting.id } }
          );
        } else if (response == 2){
          await AGENT.update(
            {
              keyword: 'Renew Rent',
            },
            { where: { id: starting.id } }
          );
        } else if (response == 3){
          await AGENT.update(
            {
              keyword: 'Find me a house',
            },
            { where: { id: starting.id } }
          );
        }

        let me = await AGENT.findOne({ where: { id: starting.id}})

        await axios.post('https://sellbackend.creditclan.com/parent/index.php/rent/sendRequest', {
          agent_id: data.message.id,
          keyword: me.keyword,
          phone: me.referal_phone
        }).then( res => {
          console.log(res.data)
        })
        res.status(200).json('Completed! Thank You')
        step = 0
        stage = 0
      }
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { customer_kyc, getAll, deleteOne, Agent };