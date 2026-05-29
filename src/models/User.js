const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  id:    String,
  level: { type:Number, default:0 },
}, { _id:false });

const packageSchema = new mongoose.Schema({
  pkgId:             String,
  purchaseDate:      Date,
  cycleStart:        Date,
  cyclesCompleted:   { type:Number, default:0 },
}, { _id:false });

const userSchema = new mongoose.Schema({
  telegramId:      { type:String, required:true, unique:true },
  username:        String,
  firstName:       String,
  coins:           { type:Number, default:5000000 },
  xp:              { type:Number, default:0 },
  energy:          { type:Number, default:500 },
  lastEnergyTime:  { type:Date,   default:Date.now },
  lastClaimTime:   { type:Date,   default:null },
  activeCharId:    { type:String, default:"lv1" },
  purchasedChars:  { type:[String], default:[] },
  businesses:      { type:[businessSchema], default:[] },
  activePackages:  { type:[packageSchema],  default:[] },
  walletBalance:   { type:Number, default:0 },
  walletHistory:   { type:[{ amount:Number, date:Date }], default:[] },
  referralCode:    { type:String, unique:true },
  referredBy:      { type:String, default:null },
  referralCount:   { type:Number, default:0 },
}, { timestamps:true });

module.exports = mongoose.model("User", userSchema);