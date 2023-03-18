"use strict";
const Models = require("../models");
const axios = require("axios");
// const Bills_cat = require("./flutter");

const headers = {
  "content-type": "application/json",
  "x-api-key":
    "WE4mwadGYqf0jv1ZkdFv1LNPMpZHuuzoDDiJpQQqaes3PzB7xlYhe8oHbxm6J228",
};

class Responses {
  static async POST(url, body) {
    axios
      .post(url, body, { headers })
      .then(async (response) => {
        return await response.data;
      })
      .catch((err) => {
        return err.message;
      });
  }

  static async GET(url) {
    axios.get(url, headers).then((response) => response.json);
  }
  static async merchant_update_stages(stage, step, min_id, max_id, last_index, id) {

    Models.merchant_stages.update(
      {
        stage: stage,
        step: step,
        min_id: min_id,
        max_id: max_id,
        last_index: last_index,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  }

  static async update_stages(stage, step, min_id, max_id, last_index, id) {
    Models.whatsapp_stages.update(
      {
        stage: stage,
        step: step,
        min_id: min_id,
        max_id: max_id,
        last_index: last_index,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  }
  static async pharmacy_update_stages(stage, step, min_id, max_id, last_index, id) {

    Models.pharmacies_stages.update(
      {
        stage: stage,
        step: step,
        min_id: min_id,
        max_id: max_id,
        last_index: last_index,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  }
  static async cinema_update_stages(stage, step, min_id, max_id, last_index, id) {

    Models.cinema_stages.update(
      {
        stage: stage,
        step: step,
        min_id: min_id,
        max_id: max_id,
        last_index: last_index,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  }
  static async update_sendMail(id) {

    await Models.whatsapp_message.update(
      {
        sendMail: 1,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  }

  static async Editing(stage, step, min_id, max_id, last_index, id) {
    Models.whatsapp_stages.update(
      {
        stage: stage,
        step: step,
        min_id: min_id,
        max_id: max_id,
        last_index: last_index,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  }

  static async createPayme(info, phone) {
    let url = `https://sellbackend.creditclan.com/parent/index.php/globalrequest/create_pay_me_request`;
    let card = JSON.parse(info.cards);
    let body = {
      phone: phone,
      customer_phone: card.phone,
      email: card.email,
      full_name: card.name,
      amount: card.amount,
      description: card.description,
      picture: "",
    };

    return new Promise((resolve) => {
      axios
        .post(url, body, { headers })
        .then(async (response) => {
          resolve(response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  static async productsButtons(info, button, provider) {
    console.log(button);
    let final_button = [];

    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {

        btn = { type: "reply", reply: element };
        
      } else if (provider == "messagebird") {

        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: info,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };
    return message;
  }

  static async rentSumary(info, image, button, provider) {
    let btn;
    let img_url;
    let final_button = [];

    button.forEach((element) => {
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };

        img_url = { link: image ? image : info.image };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };

        img_url = { url: image ? image : info.image };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",

            image: img_url,
          },
          body: {
            text: info,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };
    return message;
  }

  static async singleProduct(data, info, provider) {
    let card = JSON.parse(data.cards);

    let btn;
    let img_url;

    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        { type: "reply", reply: { id: "1", title: "Checkout with credit" } },
      ];

      img_url = { link: card.addtocart[0].primary_picture };
    } else if (provider == "messagebird") {
      btn = [{ id: "1", title: "Checkout with credit", type: "reply" }];
      img_url = { url: card.addtocart[0].primary_picture };
    }

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",

            image: img_url,
          },
          body: {
            text: info,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };
    return message;
  }

  static async ProductsList(data, item, provider) {

    let converted = encodeURIComponent(
      `cc-global-store.netlify.app/search?q=${item}&pid=${data.slug}`
    );

    var config = {
      method: "get",
      url: `https://cclan.cc/?url=http://${converted}&format=json`,
      headers: {},
    };

    let link = await axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log(link);

    let btn;
    let img_url;
    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        { type: "reply", reply: { id: `${data.id}`, title: "Add to cart" } },
      ];

      img_url = { link: data.primary_picture };
    } else if (provider == "messagebird") {
      btn = [{ id: `${data.id}`, title: "Add to cart", type: "reply" }];
      img_url = { url: data.primary_picture };
    }
    // "text": ` *${Bills_cat.convertMoney(Math.ceil(price / 100) * 100 )}/month* \n ${data.name} \n\nSee more images 👇 \n${link.url.replace("https://","")}`

    // const price = ((data.price/3)*0.15)+(data.price/3);
    const price = (data.price * 1.15) / 3;

    // 0.15*10000 + 10000/3
    console.log(price);
    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",

            image: img_url,
          },
          body: {
            text: ` *${Bills_cat.convertMoney(
              Math.ceil(price / 100) * 100
            )}/month* \n ${data.name} \n\nSee more images 👇 \n${link.url}`,
          },
          footer: {
            text: `${
              data.merchant_name ? "sold by: " + data.merchant_name : ""
            }`,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };

    return message;
  }

  static async RestaurantsList(data, button, provider) {
    let final_button = [];
    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? {
            link: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          }
        : {
            url: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          };

    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: `*${
              data.restaurant_name ? data.restaurant_name : data.pharmacy_name
            }* \n${data.location}`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }

  static async RestaurantsDetails(text, info, image, button, provider) {
    let final_button = [];

    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? {
            link: `${
              image
                ? image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          }
        : {
            url: `${
              image
                ? image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          };

    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: ` ${text} \n\n ${info}`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }

  static async TK(data, button, provider) {
    let final_button = [];
    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: data,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }

  static async GIF(image) {
    let message = {
      payload: {
        type: "image",
        attachment: `${image}`,
      },
    };

    return message;
  }

  static async messangeImage(info, phone, provider, channelId) {
    let url;
    let { payload } = info;
    let head;
    let body;

    if (provider == "web") {
      url = "https://bnpl-chatbot-server.herokuapp.com/direct";

      head = {
        Authorization: `Bearer ${process.env.MESSENGER_TOKEN}`,
      };
      body = {
        phone: phone.replace(" ", ""),
        message: payload,
      };
    } else if (provider == "messengerpeople") {
      url = "https://api.messengerpeople.dev/messages";

      head = {
        Authorization: `Bearer ${process.env.MESSENGER_TOKEN}`,
      };
      body = {
        recipient: phone.replace(" ", ""),
        sender: channelId,
        payload,
      };
    } else if (provider == "messagebird") {
      url = "https://conversations.messagebird.com/v1/send";

      head = {
        Authorization: `${process.env.MESSENGEBIRD_TOKEN}`,
      };
      body = {
        to: phone.replace(" ", ""),
        from: channelId,
        type: "image",
        content: payload,
      };
    }

    return new Promise((resolve) => {
      axios
        .post(url, body, { headers: head })
        .then(async (response) => {
          console.log(response.data);
          resolve(response.data);
        })
        .catch((err) => {
          console.log(err);
          return "error";
        });
    });
  }

  static async Location(text, provider) {
    let message;

    if (provider == "messengerpeople" || provider == "web") {
      message = {
        payload: {
          type: "image",
          text: text,
          attachment: "https://i.ibb.co/PZ77qnf/locate.png",
        },
      };
    } else if (provider == "messagebird") {
      message = {
        payload: {
          image: {
            url: "https://i.ibb.co/PZ77qnf/locate.png",
          },
        },
      };
    }

    return message;
  }

  static async FoodMessage(data, button, provider) {
    let card = JSON.parse(data.cards);

    let final_button = [];
    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? { link: `${card.food_pix}` }
        : { url: `${card.food_pix}` };
    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: `Please approve that ${
              card.full_name
            } \n is purchasing the food worth of *${Bills_cat.convertMoney(
              data.price
            )}* from your restaurant`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }

  static async productButton(info, provider) {

    let btn;
    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        { type: "reply", reply: { id: "view_more", title: "View more" } },
        {
          type: "reply",
          reply: { id: "check_out", title: "Checkout with credit" },
        },
      ];
    } else if (provider == "messagebird") {
      btn = [
        { id: "view_more", title: "View more", type: "reply" },
        { id: "check_out", title: "Checkout with credit", type: "reply" },
      ];
    }

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: info,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };
    return message;
  }

  static async moreProduct(info, verify, button, provider) {
    let final_button = [];
    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: `*Search summary* \n Merchants#: ${
              info.merchants_count
            } \nItems#: ${info.merchant_items_count} \n ${
              verify
                ? "Click the link below to search on our web site 👇\n " +
                  info.result_link
                : ""
            }`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };
    return message;
  }

  static async Checkout(info, provider) {
    let btn;
    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        {
          type: "reply",
          reply: { id: "check_out", title: "Checkout with credit" },
        },
      ];
    } else if (provider == "messagebird") {
      btn = [{ id: "check_out", title: "Checkout with credit", type: "reply" }];
    }
    console.log(provider);

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: info,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };
    return message;
  }

  static async productLink(link) {
    let message = {
      payload: {
        type: "text",
        text:
          "Click the link below to search for more products on our web site\n\n" +
          link,
      },
    };
    return message;
  }

  static async List(title, info) {
    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: "",
          },
          body: {
            text: title,
          },
          action: {
            button: "menu",
            sections: [
              {
                title: "Select an option",
                rows: info,
              },
            ],
          },
        },
      },
    };

    return message;
  }

  static async SelectWaiter(title, info) {
    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: "",
          },
          body: {
            text: title,
          },
          action: {
            button: "Select attendant👇",
            sections: [
              {
                title: "Select attendant",
                rows: info,
              },
            ],
          },
        },
      },
    };

    return message;
  }

  static async Rentlist(title, info, menu) {
    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: ".",
          },
          body: {
            text: title,
          },
          action: {
            button: menu,
            sections: [
              {
                title: menu,
                rows: info,
              },
            ],
          },
        },
      },
    };

    return message;
  }

  static async FoodList(charge_message, data, card, provider) {
    let btn;

    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? { link: `${card.food_pix}` }
        : { url: `${card.food_pix}` };

    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        { type: "reply", reply: { id: "##", title: "Cancel" } },
        { type: "reply", reply: { id: "1", title: "Confirm" } },
      ];
    } else if (provider == "messagebird") {
      btn = [
        { id: "##", title: "Cancel", type: "reply" },
        { id: "1", title: "Confirm", type: "reply" },
      ];
    }

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: `${charge_message ? charge_message : ""} \n\n Amount: *${Bills_cat.convertMoney(data.price)}* \n Restaurant : ${card.restaurant.restaurant_name}`,
          },
          footer: {
            text: `Waiter: ${
              card.waiter ? card.waiter.name : card.restaurant.restaurant_name
            }`,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };

    return message;
  }

  static async renewFirstMessage(image,data, button, provider) {

    let final_button = [];
    let img_url =provider == "messengerpeople" || provider == "web"
                    ? {
                        link: `${image}`,
                      }
                    : {
                        url: `${image}`,
                      };

    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text:data,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }

  static async FoodListPay(charge_message, data, card, provider) {
    let btn;

    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? { link: `${card.food_pix}` }
        : { url: `${card.food_pix}` };

    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        { type: "reply", reply: { id: "##", title: "Cancel" } },
        { type: "reply", reply: { id: "1", title: "Confirm" } },
      ];
    } else if (provider == "messagebird") {
      btn = [
        { id: "##", title: "Cancel", type: "reply" },
        { id: "1", title: "Confirm", type: "reply" },
      ];
    }

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: charge_message,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };

    return message;
  }

  static async HouseCode(info, button, provider) {
    let btn;
    let img_url;
    let final_button = [];

    button.forEach((element) => {
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };

        img_url = { link: info.result.picture };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };

        img_url = { url: info.result.picture };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",

            image: img_url,
          },
          body: {
            text: `Address: ${info.result.address}\n ${
              info.result.videolink
                ? "Video link: " + info.result.videolink
                : ""
            } ${
              info.result.rent_amount
                ? "Amount: " + Bills_cat.convertMoney(info.result.rent_amount)
                : ""
            }`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };
    return message;
  }

  static async HouseList(info, card, provider) {
    let btn;
    let img_url;

    let converted = encodeURIComponent(
      `cc-global-rent.netlify.app/properties/search?id=${info.id}&house_type=${card.house_type}&average=${card.budget}&area=${card.area}`
    );

    var config = {
      method: "get",
      url: `https://cclan.cc/?url=http://${converted}&format=json`,
      headers: {},
    };

    let link = await axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    if (provider == "messengerpeople" || provider == "web") {
      // btn = [{"type": "reply","link":{"id":`${link.url}`,"title": "I want this"}}]
      btn = [
        { type: "reply", reply: { id: `${link.url}`, title: "I want this" } },
      ];

      img_url = { link: info.picture };
    } else if (provider == "messagebird") {
      btn = [{ id: `${link.url}`, title: "I want this", type: "reply" }];

      img_url = { url: info.picture };
    }
    console.log(btn);
    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          sub_type: "url",
          header: {
            type: "image",

            image: img_url,
          },
          body: {
            text: `Address: ${info.address}\n ${
              info.rent_amount
                ? "Amount: " + Bills_cat.convertMoney(info.rent_amount)
                : ""
            }`,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };
    return message;
  }

  static async Sticker(stickers, provider, channelId) {
    let message;

    if (provider == "web") {
      message = {
        payload: {
          type: "sticker",
          sticker: stickers,
        },
      };
    } else if (provider == "messengerpeople") {
      message = {
        payload: {
          type: "sticker",
          sticker: stickers,
        },
      };
    } else if (provider == "messagebird") {
      message = {
        payload: {
          type: "whatsappSticker",
          whatsappSticker: {
            link: stickers,
          },
        },
      };
    }
    return message;
  }

  // static async ProductsList(data,item,provider) {

  //   let converted = encodeURIComponent(`cc-global-store.netlify.app/search?q=${item}&pid=${data.slug}`)

  //           var config = {
  //             method: 'get',
  //             url: `https://cclan.cc/?url=http://${converted}&format=json`,
  //             headers: { }
  //           };

  //           let link = await axios(config)
  //           .then(function (response) {
  //             return response.data
  //           })
  //           .catch(function (error) {
  //             console.log(error);
  //           });
  //          console.log(link);

  //     let btn
  //     let img_url
  //   if (provider == "messengerpeople" || provider == "web") {

  //     btn = [{"type": "reply","reply":{"id": `${data.id}`,"title": "Add to cart"}}]

  //     img_url ={"link": data.primary_picture}

  //   } else   if (provider == "messagebird")  {

  //      btn = [{"id": `${data.id}`,"title": "Add to cart", "type": "reply"}]
  //      img_url ={"url": data.primary_picture}

  //   }
  //   // const price = ((data.price/3)*0.15)+(data.price/3);
  //   const price = (data.price*1.15)/3;

  //   // 0.15*10000 + 10000/3
  //   console.log(price);
  //  let message ={

  //     "payload":{
  //      "type": "interactive",
  //      "interactive": {
  //          "type": "button",
  //          "header": {
  //              "type": "image",

  //              "image":img_url
  //          },
  //          "body": {
  //              "text": ` *${Bills_cat.convertMoney(Math.ceil(price / 100) * 100 )}/month* \n ${data.name} \n\nSee more images 👇 \n${link.url.replace("https://","")}`
  //          },
  //          "footer": {
  //              "text": `${data.merchant_name ?"sold by: " +data.merchant_name :""}`
  //          },
  //          "action": {
  //           "buttons":btn
  //       }
  //      }
  //    }
  //  }

  //  return message
  // }

  static async MedicineList(charge_message, data, card, provider) {
    let btn;

    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? { link: `${card.medicine_pix}` }
        : { url: `${card.medicine_pix}` };

    if (provider == "messengerpeople" || provider == "web") {
  
      btn = [{"type": "reply","reply": {"id":"##","title": "Cancel" }},{"type": "reply","reply": {"id":"1","title": "Confirm" }}]
 
  
  
    } else   if (provider == "messagebird")  {
      
       btn = [{"id":"##","title": "Cancel","type": "reply" },{"id":"1","title": "Confirm","type": "reply" }]
  
    }

    let message ={
       
       "payload":{
        "type": "interactive",
        "interactive": {
            "type": "button",
            "header": {
                "type": "image",
                "image":img_url
            },
            "body": {
                "text": `${charge_message ?charge_message :""} \n\n Amount: *${ Bills_cat.convertMoney(data.price)}* \n Pharmacy : ${card.pharmacy.pharmacy_name}`
            },  
            "footer": {
                "text":`Attendant: ${card.attendant ?card.attendant.name :card.pharmacy.pharmacy_name}`
            },
            "action": {
             "buttons":btn
         }
        }
      }
    }
    return message;
  }

  static async MedicineListPay(charge_message, data, card, provider) {
    let btn;

    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? { link: `${card.medicine_pix}` }
        : { url: `${card.medicine_pix}` };

    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        { type: "reply", reply: { id: "##", title: "Cancel" } },
        { type: "reply", reply: { id: "1", title: "Confirm" } },
      ];
    } else if (provider == "messagebird") {
      btn = [
        { id: "##", title: "Cancel", type: "reply" },
        { id: "1", title: "Confirm", type: "reply" },
      ];
    }

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: charge_message,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };

    return message;
  }

  static async MedicineMessage(data, button, provider) {
    let card = JSON.parse(data.cards);

    let final_button = [];
    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? { link: `${card.medicine_pix}` }
        : { url: `${card.medicine_pix}` };
    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: `Please approve that ${
              card.full_name
            } \n is purchasing the food worth of *${Bills_cat.convertMoney(
              data.price
            )}* from your restaurant`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }

  static async pharmaciesList(data, button, provider) {
    let final_button = [];
    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? {
            link: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          }
        : {
            url: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          };

    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: `*${data.pharmacy_name}* \n${data.location}`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }



  static async MercahntDetails(data, button,provider) {
    let btn;
    let final_button = [];

    button.forEach((element) => {

      if (provider == "messengerpeople" || provider == "web") {

        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {

        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {

          type: "button",
          body: {
            text:data,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };
    return message;
  }




  static async TicketSummary(charge_message,card, provider) {

    let btn;

    // console.log(card.movie.meal_amounts);
    
    let img_url = provider == "messengerpeople" || provider == "web" ? { link: `${card.movie.image}` } : { url: `${card.movie.image}` };

    if (provider == "messengerpeople" || provider == "web") {

      btn = [
        { type: "reply", reply: { id: "2", title: "pay now" } },
        { type: "reply", reply: { id: "1", title: "pay later" } },
      ];

    } else if (provider == "messagebird") {

      btn = [
        { id: "2", title: "pay now", type: "reply" },
        { id: "1", title: "pay later", type: "reply" },
      ];

    }

    let message = {

      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: charge_message + `Tittle: ${card.movie.title}` + `\nTotal order: ${Bills_cat.convertMoney(parseInt(card.movie.meal_amounts) + parseInt(card.popcorn) + parseInt(card.drink)  )}\n Time: ${card.time}`,
          },
          action: {
            buttons: btn,
          },
        },
      },

    };

    return message;
  }



  static async TicketPay(charge_message,card, provider) {

    let btn;

    let img_url = provider == "messengerpeople" || provider == "web" ? { link: `${card.movie.image}` } : { url: `${card.movie.image}` };

    if (provider == "messengerpeople" || provider == "web") {

      btn = [
        { type: "reply", reply: { id: "2", title: "pay now" } },
        { type: "reply", reply: { id: "1", title: "pay later" } },
      ];

    } else if (provider == "messagebird") {

      btn = [
        { id: "2", title: "pay now", type: "reply" },
        { id: "1", title: "pay later", type: "reply" },
      ];

    }

    let message = {

      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: charge_message + `amount: ${Bills_cat.convertMoney(parseInt(card.movie.meal_amounts) + card.popcorn ?parseInt(card.popcorn) :0 + card.drink ?parseInt(card.drink) :0 )}`,
          },
          action: {
            buttons: btn,
          },
        },
      },

    };

    return message;
  }


  static async MovieListPay(charge_message, data, card, provider) {
    let btn;

    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? { link: `${card.movie.image}` }
        : { url: `${card.movie.image}` };

    if (provider == "messengerpeople" || provider == "web") {
      btn = [
        { type: "reply", reply: { id: "##", title: "Cancel" } },
        { type: "reply", reply: { id: "1", title: "Confirm" } },
      ];
    } else if (provider == "messagebird") {
      btn = [
        { id: "##", title: "Cancel", type: "reply" },
        { id: "1", title: "Confirm", type: "reply" },
      ];
    }

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: charge_message,
          },
          action: {
            buttons: btn,
          },
        },
      },
    };

    return message;
  }



  static async MoviessList(data, button, provider) {

    if (typeof data.runtime === 'string') {
      data.runtime = JSON.parse(data.runtime)
    }
    let final_button = [];
    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? {
            link: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          }
        : {
            url: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          };

    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });


    let time ="";

    for (let index = 0; index < data.runtime.length; index++) {
      time+=`${data.runtime[index]} \n`;
      
    }

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: `*${
              data.title
            }*\nPrice: *${Bills_cat.convertMoney(data.meal_amounts)}* \n*Time*: \n${time} \nRun time: ${data.span}`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }

  static async CinemasList(data, button, provider) {
    let final_button = [];
    let img_url =
      provider == "messengerpeople" || provider == "web"
        ? {
            link: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          }
        : {
            url: `${
              data.image
                ? data.image
                : "https://res.cloudinary.com/dsj9s5nlw/image/upload/v1637652066/cidsjw31bpovlly5yg6c.jpg"
            }`,
          };

    button.forEach((element) => {
      let btn;
      if (provider == "messengerpeople" || provider == "web") {
        btn = { type: "reply", reply: element };
      } else if (provider == "messagebird") {
        btn = { id: element.id, title: element.title, type: "reply" };
      }
      final_button.push(btn);
    });

    let message = {
      payload: {
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: img_url,
          },
          body: {
            text: `*${
              data.cinema_name
            }* \n\n${data.location}`,
          },
          action: {
            buttons: final_button,
          },
        },
      },
    };

    return message;
  }


}

module.exports = Responses;
