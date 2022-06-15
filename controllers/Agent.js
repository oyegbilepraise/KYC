const Agent = async (req, res) => {
  const { phoneNumber, response } = req.body;

  let step = 0;
  let stage = 0;
  let sub_step = 0;

  try {
    if (step === 0 && stage === 0 && response.trim().toLowerCase() === "ercan") {
        const {data} = await axios.get('https://sellbackend.creditclan.com/parent/index.php/rent/getAgents')

        res.json(data)
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { Agent };
