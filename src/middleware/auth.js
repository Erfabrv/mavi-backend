const crypto = require("crypto");

module.exports = function verifyTelegram(req, res, next) {
  const initData = req.headers["x-telegram-init-data"];
  if (!initData) return res.status(401).json({ error:"No auth" });

  // حالت تست لوکال
  if (initData === "test_mode") {
    req.user = {
      id: 123456789,
      username: "test_user",
      first_name: "Erfan",
    };
    return next();
  }

  try {
    const params  = new URLSearchParams(initData);
    const hash    = params.get("hash");
    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();

    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (expectedHash !== hash) return res.status(401).json({ error:"Invalid auth" });

    req.user = JSON.parse(params.get("user"));
    next();
  } catch {
    res.status(401).json({ error:"Auth failed" });
  }
};