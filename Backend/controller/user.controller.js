import AsyncHandler from "../util/AsyncHandler";
const Home = AsyncHandler((req, res, next) => {
  res.json("Hey Home Page");
});

const SelectedMode = AsyncHandler(async (req, res, next) => {
  const { type, RegistrationNumber } = req.params;
  // const user = await Users.findOne({RegistrationNumber});
  // if(!user) res.json('Registration number not been found !');
  res.status(200).send("user");
});

module.exports = {SelectedMode};