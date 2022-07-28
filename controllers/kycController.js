const db = require("../models");
let a = require("dotenv").config();
const interactive = require("../helpers/responses");
const axios = require("axios");

const KYC = db.kyc;
let step = 0;
let stage = 0;
let sub_step = 0;
let phone = "2348067710067";
let data;

const kyc = async (req, res) => {
  let { phoneNumber, response } = req.body;

  let [starting, created] = await KYC.findOrCreate({
    where: { phone: "0" + phoneNumber.substr(-10) },
    defaults: { phone: "0" + phoneNumber.substr(-10) },
  });

  if (starting) {
    step = starting.step;
    stage = starting.stage;
  }

  let message;
  try {
    if (step == 0 && stage == 0 && response.trim().toLowerCase() == "kyc") {
      stage = 0;
      step = 0;
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
      let phone = "0" + response.substr(-10);
      await axios
        .get(
          `https://sellbackend.creditclan.com/merchantclan/public/index.php/api/whatsapp/customer?phone=${phone}`
        )
        .then((res) => {
          data = res.data.data;
        });

      let messages = `Here is the detail of the customer \nName: ${data.whatsapp_name} \nAddress: ${data.address} \n\nDoes the above address matches or related property visited?`;

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
          address: data.address,
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
        step++;
        await KYC.update(
          { address: response, step },
          { where: { id: starting.id } }
        );
        message = "Send Location of the new address";
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
      step++;
      await KYC.update(
        { location: response, step },
        { where: { id: starting.id } }
      );
      message = "Take photo of the property";
    } else if (step == 5 && stage == 2 && sub_step == 3) {
      step++;
      await KYC.update(
        { picture: response, step },
        { where: { id: starting.id } }
      );
      message = "Provide closest landmark";
    } else if (step == 6 && stage == 2 && sub_step == 3) {
      step++;
      await KYC.update(
        { landmark: response, step },
        { where: { id: starting.id } }
      );
      message = "Take picture of the landmark";
    } else if (step == 7 && stage == 2 && sub_step == 3) {
      step++;
      await KYC.update(
        { landmark_picture: response, step },
        { where: { id: starting.id } }
      );
      let summary = await KYC.findOne({ where: { id: starting.id } });

      let messages = `Address: ${summary.address} \n`;
      messages += `Landmark: ${summary.landmark} \n`;

      message = await interactive.RestaurantsDetails(
        "This is the sumary",
        messages,
        summary.picture,
        [
          { id: "2", title: "Edit" },
          { id: "1", title: "save" },
        ],
        req.body.provider
      );
    } else if (step == 8 && stage == 2 && sub_step == 3) {
      if (response == 1) {
        message = "Thank you. your exercise has been completed";
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      } else if (response == 2) {
        message = "*[1]*. Enter new address \n";
        message += "*[2]*. Edit Location \n";
        message += "*[3]*. Edit Property Picture \n";
        message += "*[4]*. Edit Landmark \n";
        message += "*[5]*. Edit Landmark Picture \n";
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      }
    } else if (step == 9 && stage == 2 && sub_step == 3) {
      if (response == 1) {
        message = "Enter new Address";
      } else if (response == 2) {
        message = "Share new Location";
      } else if (response == 3) {
        message = "Take New Property Picture";
      } else if (response == 4) {
        message = "Enter New Landmark";
      } else if (response == 5) {
        message = "Enter New Landmark Picture";
      }
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
        step++;
        await KYC.update(
          { other_name: response, step },
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
      }
    } else if (step == 4 && stage == 1 && sub_step == 1) {
      let newRes;
      if (response == 1) {
        newRes = "1 Storey";
      } else if (response == 2) {
        newRes = "2 Storey";
      } else if (response == 3) {
        newRes = "More than 2 Storey";
      } else if (response == 4) {
        newRes = "Office Building";
      } else if (response == 5) {
        newRes = "Bungalow";
      }
      await KYC.update({ house_type: newRes }, { where: { id: starting.id } });
      message = "Share location of the property";
      step++;
      await KYC.update(
        {
          step,
        },
        { where: { id: starting.id } }
      );
    } else if (step == 5 && stage == 1 && sub_step == 1) {
      step++;
      await KYC.update(
        { location: response, step },
        { where: { id: starting.id } }
      );
      message = "Kindly take picture of the house";
    } else if (step == 6 && stage == 1 && sub_step == 1) {
      step++;
      await KYC.update(
        { picture: response, step },
        { where: { id: starting.id } }
      );
      message = "Provide a landmark closest to the address";
    } else if (step == 7 && stage == 1 && sub_step == 1) {
      step++;
      await KYC.update(
        { landmark: response, step },
        { where: { id: starting.id } }
      );
      message = "kindly take picture of the landmark";
    } else if (step == 8 && stage == 1 && sub_step == 1) {
      step++;
      await KYC.update(
        { landmark_picture: response, step },
        { where: { id: starting.id } }
      );

      let summary = await KYC.findOne({ where: { id: starting.id } });

      let messages = `Other Name: ${summary.other_name} \n`;
      messages += `Phone: ${summary.phone} \n`;
      messages += `Landmark: ${summary.landmark} \n`;
      messages += `House Type: ${summary.house_type} \n`;

      message = await interactive.RestaurantsDetails(
        "This is the sumary",
        messages,
        summary.picture,
        [
          { id: "2", title: "Edit" },
          { id: "1", title: "save" },
        ],
        req.body.provider
      );
    } else if (step == 9 && stage == 1 && sub_step == 1) {
      if (response == 1) {
        message = "Thank you. your exercise has been completed";
      } else if (response == 2) {
        message = "*[1].* Customer's other name \n";
        message += "*[2].* Property Type \n";
        message += "*[3].* Property Location \n";
        message += "*[4].* House Picture \n";
        message += "*[5].* Landmark \n";
        message += "*[6]*. Landmark Picture";
      }
    } else if (step == 10 && stage == 1 && sub_step == 1) {
      if (response == 1) {
        message = "Provide customer's other name";
      } else if (response == 2) {
        let messages = "Select the type of property the customer reside";
        message = await interactive.List(messages, [
          { id: "1", title: "1 Storey" },
          { id: "2", title: "2 Storey" },
          { id: "3", title: "More than 2 Storey" },
          { id: "4", title: "Office Building" },
          { id: "5", title: "Bungalow" },
        ]);
      } else if (response == 3) {
        message = "Send the location ofthe property";
      } else if (response == 4) {
        message = "Take Property Picture";
      } else if (response == 5) {
        message = "Provide the landmark closest to the address";
      } else if (response == 6) {
        message = "Kindly take picture of the landmark";
      }
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
      if (response == 1) {
        let messages =
          "Click attach then choose location and click *Send your current location*";

        let payload = await interactive.Location(messages, req.body.provider);

        await interactive.messangeImage(
          payload,
          req.body.phoneNumber,
          req.body.provider,
          req.body.channelId
        );

        message = "to choose Location. See image below for guide: 👆";
      } else {
        step++;
        await KYC.update(
          { location: response, step },
          { where: { id: starting.id } }
        );
        message = "Take Picture of estate entrance";
      }
    } else if (step == 5 && stage == 1 && sub_step == 0) {
      step++;
      await KYC.update(
        { picture: response, step },
        { where: { id: starting.id } }
      );
      message = "Provide a landmark closest to address";
    } else if (step == 6 && stage == 1 && sub_step == 0) {
      step++;
      await KYC.update(
        { landmark: response, step },
        { where: { id: starting.id } }
      );
      message = "Kindly take picture of the landmark";
    } else if (step == 7 && stage == 1 && sub_step == 0) {
      step++;
      await KYC.update(
        { landmark_picture: response, step },
        { where: { id: starting.id } }
      );

      let summary = await KYC.findOne({ where: { id: starting.id } });

      let messages = `Address: ${summary.address} \n`;
      messages += `Landmark: ${summary.landmark} \n`;

      message = await interactive.RestaurantsDetails(
        "This is the sumary",
        messages,
        summary.picture,
        [
          { id: "2", title: "Edit" },
          { id: "1", title: "save" },
        ],
        req.body.provider
      );
    } else if (step == 8 && stage == 1 && sub_step == 0) {
      if (response == 1) {
        message = "Thank you. your exercise has been completed";
      } else if (response == 2) {
        step++;
        message = "*[1]*. Enter new address \n";
        message += "*[2]*. Edit Location \n";
        message += "*[3]*. Edit Property Picture \n";
        message += "*[4]*. Edit Landmark \n";
        message += "*[5]*. Edit Landmark Picture \n";
        step++;
        await KYC.update(
          {
            step,
          },
          { where: { id: starting.id } }
        );
      } else if (step == 9 && stage == 1 && sub_step == 0) {
        if (response == 1) {
          message = "Enter new Address";
        } else if (response == 2) {
          message = "Share new Location";
        } else if (response == 3) {
          message = "Take New Property Picture";
        } else if (response == 4) {
          message = "Enter New Landmark";
        } else if (response == 5) {
          message = "Enter New Landmark Picture";
        }
      }
    }
    return res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const hygeia = async (req, res) => {
  const {start} = req.body
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
    console.log(response.data)
    res
      .status(200)
      .json({ status: true, error: false, message: "Success", data: response.data });
  } catch (error) {
    return res.status(200).json({ message: "Failed", error });
  }
};

module.exports = { kyc, hygeia };
