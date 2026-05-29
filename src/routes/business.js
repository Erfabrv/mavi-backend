const router = require("express").Router();
const verify = require("../middleware/auth");
const User   = require("../models/User");

router.post("/upgrade", verify, async (req, res) => {
  try {
    const { bizId, cost, xpGain } = req.body;
    const user = await User.findOne({ telegramId:String(req.user.id) });
    if (!user) return res.status(404).json({ error:"User not found" });
    if (user.coins < cost) return res.status(400).json({ error:"Not enough coins" });

    user.coins -= cost;
    user.xp    += xpGain;

    const biz = user.businesses.find(b => b.id === bizId);
    if (biz) biz.level += 1;
    else user.businesses.push({ id:bizId, level:1 });

    await user.save();
    res.json({ success:true, coins:user.coins, xp:user.xp,
      businesses:user.businesses });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

module.exports = router;