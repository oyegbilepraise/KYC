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

        if (starting.level == 2 && starting.confirmed == 0) {
          let message = `Hi, ${user?.profile?.legal_name} \nYou have a pending confirmation on KYC-Level ${starting.level}`;
          res.status(200).json(message);
        } else if (starting.level == 1 && starting.confirmed == 0) {
          let message = `Hi, ${user?.profile?.legal_name} \nYou have a pending confirmation on KYC-Level ${starting.level}`;
          res.status(200).json(message);
        } else if (starting.level == 2 && starting.confirmed == 1) {
          let message = `Hi, ${user?.profile?.legal_name} \nYou are currently on our highest KYC Level \nThanks`;
          res.status(200).json(message);
        } else {
          if (
            user?.profile?.legal_name != "" &&
            user?.profile?.email != "" &&
            user?.profile?.date_of_birth != "" &&
            user?.profile?.gender != "" &&
            user?.home_address?.home_address != ""
          ) {
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
        }
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
      let message = "Kindly provide your next of kin email.";
      await KYC.update(
        {
          nok_name: response,
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 5) {
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
      let message = "Kindly provide your BVN.";
      await KYC.update(
        {
          nok_phone: response,
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 8) {
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
          bvn: response,
          step,
        },
        { where: { id: starting.id } }
      );
      res.status(200).json(message);
    } else if (stage == 2 && step == 9) {
      if (response == 1) {
        step++;
        await KYC.update(
          {
            nok_relationship: "Parent",
            level: 2,
            step: 0,
            stage: 0,
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
          },
          { where: { id: starting.id } }
        );
      }
      let message =
        "Thank you. We will review your request and get back to you.";
      res.status(200).json(message);
    }

    // if(starting.level == 1 && starting.confirmed == 0) {
    //   let message = `Hi, ${user?.profile?.legal_name} \n You have a pending confirmation on KYC-Level ${starting.level}`
    //   res.status(200).json(message)
    // }
    // else if(starting.level == 2 && starting.confirmed == 0) {
    //   let message = `Hi, ${user?.profile?.legal_name} \n You have a pending confirmation on KYC-Level ${starting.level}`
    //   res.status(200).json(message)
    // } else{
    //   message = await interactive.List(
    //     `Hi, ${user?.profile?.legal_name} \n You're currently on KYC Level ${starting.level}\n \n Kindly Select from the option below`,
    //     [
    //       { id: "2", title: "Level 2" },
    //       { id: "1", title: "Level 1" },
    //     ],
    //     req?.body?.provider
    //   );

    //   step++;
    //   await KYC.update(
    //     {
    //       step,
    //       full_name: user?.profile?.legal_name,
    //       residential_address: user?.home_address?.home_address,
    //       email: user.profile?.email,
    //       dob: user?.profile.date_of_birth,
    //       bvn: user?.profile?.bvn,
    //       gender: user?.profile?.gender == 0 ? "Male" : "Female"
    //     },
    //     { where: { id: starting.id } }
    //   );
    //   res.status(200).json({ message });
    // }
    // else if (step == 1 && stage == 0) {
    //   if (response == 1) {
    //     stage = 1;
    //     let messages =
    //       "For level 1 verification, we will need the following: \n";
    //     messages += "*[1]*. Profile picture \n";
    //     messages += "*[2]*. DOB \n";
    //     messages += "*[3]*. Gender \n";
    //     messages += "*[4]*.Email (if available) \n";

    //     let message = await interactive.productsButtons(
    //       messages,
    //       [{ id: "1", title: "Get Started" }],
    //       req?.body?.provider
    //     );
    //     step++;
    //     await KYC.update(
    //       {
    //         step,
    //         stage,
    //       },
    //       { where: { id: starting.id } }
    //     );
    //     res.status(200).json(message);
    //   } else if (response == 2) {
    //     stage = 2;
    //     let messages =
    //       "For level 2 verification, we will need the following: \n";
    //     messages += "BVN \n";
    //     messages += "NIN \n";
    //     messages += "Signature";

    //     let message = await interactive.productsButtons(
    //       messages,
    //       [{ id: "1", title: "Get Started" }],
    //       req?.body?.provider
    //     );
    //     res.status(200).json(message);
    //     step++;
    //     await KYC.update(
    //       {
    //         step,
    //         stage,
    //       },
    //       { where: { id: starting.id } }
    //     );
    //   }
    // }
    else if (step == 3 && stage == 1) {
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
        },
        { where: { id: starting.id } }
      );
      res
        .status(200)
        .json("Thank you. We will review your request and get back to you.");
    }
    // else if (step == 2 && stage == 2) {
    //   if (response == 1) {
    //     let message = "Kindly provide your BVN.";
    //     res.status(200).json(message);
    //     step++;
    //     await KYC.update(
    //       {
    //         step,
    //       },
    //       { where: { id: starting.id } }
    //     );
    //   }
    // } else if (step == 3 && stage == 2) {
    //   step++;
    //   let message = "Kindly provide your NIN.";
    //   await KYC.update(
    //     {
    //       step,
    //       bvn: response,
    //     },
    //     { where: { id: starting.id } }
    //   );
    //   res.status(200).json(message);
    // } else if (step == 4 && stage == 2) {
    //   step++;
    //   let message = await interactive.productsButtons(
    //     "Kindly enter your signature",
    //     [{ id: "1", title: "Skip" }],
    //     req?.body?.provider
    //   );
    //   await KYC.update(
    //     {
    //       step,
    //       nin: response,
    //     },
    //     { where: { id: starting.id } }
    //   );
    //   res.status(200).json(message);
    // } else if (step == 5 && stage == 2) {
    //   await KYC.update(
    //     {
    //       signature: response,
    //       step: 0, stage: 0, level: 2
    //     },
    //     { where: { id: starting.id } }
    //   );
    //   res
    //     .status(200)
    //     .json("Thank you. We will review your request and get back to you.");
    // }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getAll = async (req, res) => {
  try {
    let ress = await KYC.findAll({ where: { delete: 0 } });
    res.status(200).json({ ress });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const deleteOne = async (req, res) => {
  const { id } = req.body;
  try {
    let data = await KYC.update(
      {
        delete: 1,
        confirmed: 1,
      },
      { where: { id } }
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { customer_kyc, getAll, deleteOne };
