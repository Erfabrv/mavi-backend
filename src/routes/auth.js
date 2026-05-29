const router  = require("express").Router();
const crypto  = require("crypto");
const verify  = require("../middleware/auth");
const User    = require("../models/User");

router.post("/login", verify, async (req, res) => {
  try {
    const { id, username, first_name } = req.user;
    const telegramId = String(id);

    let user = await User.findOne({ telegramId });

    if (!user) {
      const referralCode = telegramId + "_" +
        crypto.randomBytes(3).toString("hex").toUpperCase();
      user = await User.create({
        telegramId,
        username:    username || "",
        firstName:   first_name || "",
        referralCode,
      });
    }

    res.json({ success:true, user });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

module.exports = router;