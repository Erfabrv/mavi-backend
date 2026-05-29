const router = require("express").Router();
const verify = require("../middleware/auth");
const User   = require("../models/User");

// گرفتن اطلاعات کاربر
router.get("/me", verify, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId:String(req.user.id) });
    if (!user) return res.status(404).json({ error:"User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

// claim روزانه
router.post("/claim", verify, async (req, res) => {
  try {
    const user = await User.findOne({ telegramId:String(req.user.id) });
    if (!user) return res.status(404).json({ error:"User not found" });

    const now      = Date.now();
    const lastClaim = user.lastClaimTime ? new Date(user.lastClaimTime).getTime() : 0;
    if (now - lastClaim < 86_400_000)
      return res.status(400).json({ error:"Not ready yet" });

    // محاسبه درآمد روزانه از بیزینس‌ها
    const income = req.body.totalIncome || 0;
    user.coins        += income;
    user.lastClaimTime = new Date();
    await user.save();

    res.json({ success:true, coins:user.coins });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

// آپدیت کاراکتر
router.post("/character", verify, async (req, res) => {
  try {
    const { charId } = req.body;
    const user = await User.findOne({ telegramId:String(req.user.id) });
    if (!user) return res.status(404).json({ error:"User not found" });
    user.activeCharId = charId;
    await user.save();
    res.json({ success:true });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

// خرید کاراکتر VIP
router.post("/character/buy", verify, async (req, res) => {
  try {
    const { charId, price } = req.body;
    const user = await User.findOne({ telegramId:String(req.user.id) });
    if (!user) return res.status(404).json({ error:"User not found" });
    if (user.coins < price) return res.status(400).json({ error:"Not enough coins" });
    if (user.purchasedChars.includes(charId))
      return res.status(400).json({ error:"Already owned" });

    user.coins -= price;
    user.purchasedChars.push(charId);
    user.activeCharId = charId;
    await user.save();
    res.json({ success:true, coins:user.coins });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

module.exports = router;