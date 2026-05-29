const router = require("express").Router();
const verify = require("../middleware/auth");
const User   = require("../models/User");

// خرید پکیج
router.post("/buy", verify, async (req, res) => {
  try {
    const { pkgId, price } = req.body;
    const user = await User.findOne({ telegramId:String(req.user.id) });
    if (!user) return res.status(404).json({ error:"User not found" });
    if (user.coins < price) return res.status(400).json({ error:"Not enough coins" });
    if (user.activePackages.find(p => p.pkgId === pkgId))
      return res.status(400).json({ error:"Already active" });

    user.coins -= price;
    user.activePackages.push({
      pkgId, purchaseDate:new Date(), cycleStart:new Date(), cyclesCompleted:0,
    });
    await user.save();
    res.json({ success:true, coins:user.coins });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

// برداشت سود
router.post("/withdraw", verify, async (req, res) => {
  try {
    const { pkgId, profit } = req.body;
    const user = await User.findOne({ telegramId:String(req.user.id) });
    if (!user) return res.status(404).json({ error:"User not found" });

    const pkg = user.activePackages.find(p => p.pkgId === pkgId);
    if (!pkg) return res.status(404).json({ error:"Package not found" });

    const now       = Date.now();
    const cycleEnd  = new Date(pkg.cycleStart).getTime() + 30*24*60*60*1000;
    if (now < cycleEnd) return res.status(400).json({ error:"Not ready yet" });

    user.walletBalance += profit;
    user.walletHistory.push({ amount:profit, date:new Date() });
    pkg.cyclesCompleted += 1;
    pkg.cycleStart       = new Date();
    await user.save();

    res.json({ success:true, walletBalance:user.walletBalance });
  } catch (err) {
    res.status(500).json({ error:err.message });
  }
});

module.exports = router;