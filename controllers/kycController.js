const db = require("../models");
let a = require("dotenv").config();
const interactive = require("../helpers/responses");

const KYC = db.kyc;
let step = 0;
let stage = 0;
let sub_step = 0;

let data = {
  name: "Oyegbile Praise",
  address: "Lorem Ipsum Dolor",
};

const kyc = async (req, res) => {
  let { phoneNumber, response } = req.body;
  let [starting, created] = await KYC.findOrCreate({
    where: { phone: "0" + phoneNumber.substr(-10) },
    defaults: { phone: "0" + phoneNumber.substr(-10) },
  });
  let message;

  try {
    if (step == 0 && stage == 0 && response.trim().toLowerCase() == "kyc") {
      stage = 0
      step = 0
      step++;
      message =
        "This is a verification tool for creditclan. \nKindly enter customer's phone number";
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 1 && stage == 0) {
      let messages = `Here is the detail of the customer \nName: ${data.name} \nAddress: ${data.address} \n\nDoes the above address matches or related property visited?`;

      message = await interactive.productsButtons(
        messages,
        [
          { id: "2", title: "No" },
          { id: "1", title: "Yes" },
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
    } else if (step == 2 && stage == 0) {
      if (response == 1) {
        stage = 1;
        await KYC.update({ stage }, { where: { id: starting.id } });
        step = 0;
        let messages =
          "Do you require access to enter if address is in an estate?";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
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
      } else if (response == 2) {
        stage = 2;
        await KYC.update({ stage }, { where: { id: starting.id } });
        step = 0;
        let messages =
          "I confirmed the name through a neighbor or the customer";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
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
      }
    } else if (stage == 2 && step == 1) {
      let messages = "Customer has new address";
      message = await interactive.productsButtons(
        messages,
        [
          { id: "2", title: "No" },
          { id: "1", title: "Yes" },
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
    } else if (step == 2 && stage == 2) {
      if (response == 1) {
        sub_step = 3;
        message = "Enter new address";
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 2) {
        sub_step = 4;
        let messages = "Customer address not found at all";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
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
      }
    } else if (step == 3 && stage == 2) {
      if (sub_step == 3) {
        await KYC.update({ address: response }, { where: { id: starting.id } });
        message = "Send Location of the new address";
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      } else if ((sub_step = 4)) {
        message = "Send your location";
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      }
    } else if (step == 4 && stage == 2 && sub_step == 3) {
      await KYC.update({ location: response }, { where: { id: starting.id } });
      message = "Take photo of the property";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 5 && stage == 2 && sub_step == 3) {
      await KYC.update({ picture: response }, { where: { id: starting.id } });
      message = "Provide closest landmark";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 6 && stage == 2 && sub_step == 3) {
      await KYC.update({ landmark: response }, { where: { id: starting.id } });
      message = "Take photo of the landmark";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 7 && stage == 2 && sub_step == 3) {
      await KYC.update(
        { landmark_picture: response },
        { where: { id: starting.id } }
      );
      message = await KYC.findOne({ where: { id: starting.id } });
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 1 && stage == 2) {
      if (response == 1) {
        let messages = "Customer has new address";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
          ],
          req?.body?.provider
        );
      }
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 1 && stage == 1) {
      if (response == 1) {
        sub_step = 0;
        let messages = "I confirmed address in the estate";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
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
      } else if (response == 2) {
        sub_step = 1;
        let messages = "I confirmed the name from a neighbor";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
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
      }
    } else if (step == 2 && stage == 1 && sub_step == 1) {
      if (response == 1) {
        let messages = "Customer has another name";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
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
      } else if (response == 2) {
        message = "Thank you. your exercise has been completed";
      }
    } else if (step == 3 && stage == 1 && sub_step == 1) {
      if (response == 1) {
        message = "Provide the other name";
      } else if (response == 2) {
        let messages = "Select the type of property the customer reside";
        message = await interactive.List(messages, [
          { id: "1", title: "1 Storey" },
          { id: "2", title: "2 Storey" },
          { id: "3", title: "More than 2 Storey" },
          { id: "4", title: "Office Building" },
          { id: "5", title: "Bungalow" },
        ]);
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      } else {
        await KYC.update(
          { other_name: response },
          { where: { id: starting.id } }
        );
        let messages = "Select the type of property the customer reside";
        message = await interactive.List(messages, [
          { id: "1", title: "1 Storey" },
          { id: "2", title: "2 Storey" },
          { id: "3", title: "More than 2 Storey" },
          { id: "4", title: "Office Building" },
          { id: "5", title: "Bungalow" },
        ]);
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      }
    } else if (step == 4 && stage == 1 && sub_step == 1) {
      await KYC.update(
        { house_type: response },
        { where: { id: starting.id } }
      );
      message = "Share location of the property";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 5 && stage == 1 && sub_step == 1) {
      await KYC.update({ location: response }, { where: { id: starting.id } });
      message = "Kindly take picture of the house";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 6 && stage == 1 && sub_step == 1) {
      await KYC.update({ picture: response }, { where: { id: starting.id } });
      message = "Provide a landmark closest to the address";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 7 && stage == 1 && sub_step == 1) {
      await KYC.update({ landmark: response }, { where: { id: starting.id } });
      message = "kindly take picture of the landmark";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 8 && stage == 1 && sub_step == 1) {
      await KYC.update(
        { landmark_picture: response },
        { where: { id: starting.id } }
      );
      message = await KYC.findOne({ where: { id: starting.id } });
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 2 && stage == 1 && sub_step == 0) {
      if (response == 1) {
        let messages = "I confirmed customer lives in the estate";
        message = await interactive.productsButtons(
          messages,
          [
            { id: "2", title: "No" },
            { id: "1", title: "Yes" },
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
      } else if (response == 2) {
        message = "Thank you. your exercise has been completed";
      }
    } else if (step == 3 && stage == 1 && sub_step == 0) {
      if (response == 1) {
        message = await interactive.productsButtons(
          `Share location of the estate📍`,
          [{ id: "1", title: "Show me how" }],
          req.body.provider
        );
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 2) {
        message = "Thank you. your exercise has been completed";
      }
    } else if (step == 4 && stage == 1 && sub_step == 0) {
      await KYC.update({ location: response }, { where: { id: starting.id } });
      message = "Take Picture of estate entrance";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 5 && stage == 1 && sub_step == 0) {
      await KYC.update({ picture: response }, { where: { id: starting.id } });
      message = "Thank you. your exercise has been completed";
    }
    return res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// "{\"latitude\":6.428798249999999,\"longitude\":3.4361785}"
// {latitude:6.428798249999999,longitude:3.4361785}

// {"latitude":"6.428798249999999","longitude":"3.4361785"}
// {"latitude":'6.428798249999999',"longitude":'3.4361785'}

// const kyc = async (req, res) => {
//   let { phoneNumber, response } = req.body;
//   try {
//     let [starting, created] = await KYC.findOrCreate({
//       where: { phone: "0" + phoneNumber.substr(-10) },
//       defaults: { phone: "0" + phoneNumber.substr(-10) },
//     });
//     let message;
//     if (step == 0 && stage == 0 && response.trim().toLowerCase() == "kyc") {
//       step++;
//       message =
//         "This is a verification tool for creditclan. \nKindly enter customer's phone number";
//     } else if (step == 1 && stage == 0) {
//       let messages = `Here is the detail of the customer \nName: ${data.name} \nAddress: ${data.address} \n\nDoes the above address matches or related property visited?`;

//       message = await interactive.productsButtons(
//         messages,
//         [
//           { id: "2", title: "No" },
//           { id: "1", title: "Yes" },
//         ],
//         req?.body?.provider
//       );
//       step++;
//     } else if (response == 1 && step == 2 && stage == 0) {
//       stage = 1;
//       await KYC.update({ stage }, { where: { id: starting.id } });
//       step = 0;
//       let messages =
//         "Do you require access to enter if address is in an estate";
//       message = await interactive.productsButtons(
//         messages,
//         [
//           { id: "2", title: "No" },
//           { id: "1", title: "Yes" },
//         ],
//         req?.body?.provider
//       );
//       step++;
//     } else if (response == 1 && stage == 1 && step == 1) {
//       let messages = "I confirmed address in the estate";
//       message = await interactive.productsButtons(
//         messages,
//         [
//           { id: "2", title: "No" },
//           { id: "1", title: "Yes" },
//         ],
//         req?.body?.provider
//       );
//       step++;
//     } else if (response == 1 && stage == 1 && step == 2 && sub_step == 0) {
//       let messages = "I confirmed customer lives in the estate";
//       message = await interactive.productsButtons(
//         messages,
//         [
//           { id: "2", title: "No" },
//           { id: "1", title: "Yes" },
//         ],
//         req?.body?.provider
//       );
//       step++;
//     } else if (response == 1 && stage == 1 && step == 3 && sub_step == 0) {
//       message = await interactive.productsButtons(
//         `Share location of the estate📍`,
//         [{ id: "1", title: "Show me how" }],
//         req.body.provider
//       );
//       step++;
//     } else if (response && stage == 1 && step == 4 && sub_step == 0) {
//       await KYC.update({
//         location: response,
//       });
//       message = "Take Picture of estate entrance";
//       step++;
//     } else if (stage == 1 && step == 5 && sub_step == 0) {
//       message = "Thank you. your exercise has been completed";
//     } else if (response == 2 && stage == 1 && step == 2 && sub_step == 0) {
//       message = "Thank you. your exercise has been completed";
//     } else if (response == 2 && step == 1 && stage == 1) {
//       sub_step = 1;
//       let messages = "I confirmed the name from a neighbor";
//       message = await interactive.productsButtons(
//         messages,
//         [
//           { id: "2", title: "No" },
//           { id: "1", title: "Yes" },
//         ],
//         req?.body?.provider
//       );
//       step++;
//     } else if (response == 1 && step == 2 && stage == 1 && sub_step == 1) {
//       let messages = "Customer has another name";
//       message = await interactive.productsButtons(
//         messages,
//         [
//           { id: "2", title: "No" },
//           { id: "1", title: "Yes" },
//         ],
//         req?.body?.provider
//       );
//       step++;
//     } else if (response == 1 && step == 3 && stage == 1 && sub_step == 1) {
//       message = "Provide the customer other name";
//       step++;
//     } else if (response == 2 && step == 3 && stage == 1 && sub_step == 1) {
//       let messages = "Select the type of property the customer reside";
//       message = await interactive.List(messages, [
//         { id: "1", title: "1 Storey" },
//         { id: "2", title: "2 Storey" },
//         { id: "3", title: "More than 2 Storey" },
//         { id: "4", title: "Office Building" },
//         { id: "5", title: "Bungalow" },
//       ]);
//       step++;
//     }
//      else if (response == 2 && step == 2 && stage == 0) {
//       stage = 2;
//       await KYC.update({ stage }, { where: { id: starting.id } });
//       step = 0;
//       message = "I confirmed the name through a neighbor or the customer";
//     }

//     // if (step == 4 && stage == 1 && sub_step == 1) {
//     //   await KYC.update({ house_type: response });
//     //   message = await interactive.productsButtons(
//     //     `Share location of the property📍`,
//     //     [{ id: "1", title: "Show me how" }],
//     //     req.body.provider
//     //   );
//     //   step++;
//     // }

//     let upd = await KYC.update(
//       {
//         step,
//       },
//       { where: { id: starting.id } }
//     );

//     console.log(step, stage);

//     return res.status(200).json({ message });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

module.exports = { kyc };
