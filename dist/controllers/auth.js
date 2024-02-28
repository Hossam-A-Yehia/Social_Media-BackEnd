"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestedFriends = exports.profileView = exports.acceptRequest = exports.getUserInfo = exports.getFriendRequest = exports.friendRequest = exports.resetPassword = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const FriendRequest_1 = __importDefault(require("../models/FriendRequest"));
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone, photo, secretAnswer, secretQue, } = req.body;
    if (!name)
        return res.status(400).json({ message: "Name is required" });
    if (!secretAnswer)
        return res.status(400).json({ message: "Secret Answer is required" });
    if (!secretQue)
        return res.status(400).json({ message: "Secret Question is required" });
    if (!password)
        return res.status(400).json({ message: "Password is required" });
    const user = yield User_1.default.findOne({ email });
    if (user)
        return res.status(400).send("This email already exist");
    const salt = yield bcrypt.genSalt(10);
    const hashedPass = yield bcrypt.hash(password, salt);
    try {
        const newUser = yield User_1.default.create({
            name,
            email,
            password: hashedPass,
            phone,
            photo,
            secretAnswer,
            secretQue,
        });
        return res.status(201).json(newUser);
    }
    catch (err) {
        console.log("REGISTER FAILD ==>", err);
        return res.status(500).send("Error, Try Again");
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield User_1.default.findOne({ email });
    if (!user)
        return res.status(400).json({ message: "This email not found" });
    const correctPass = yield bcrypt.compare(password, user.password);
    if (!correctPass)
        return res.status(400).json({ message: "This password not match" });
    user.password = undefined;
    try {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
            expiresIn: "5d",
        });
        return res.json({ user, token }).status(200);
    }
    catch (err) {
        console.log("REGISTER FAILD ==>", err);
        return res.status(500).send("Error, Try Again");
    }
});
exports.login = login;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword, secretAnswer, secretQue, } = req.body;
    const user = yield User_1.default.findOne({ email });
    if (!user)
        return res.status(400).json({ message: "This email not found" });
    if (secretQue !== user.secretQue || secretAnswer !== user.secretAnswer)
        return res.status(400).json({
            message: "Secret Wrong !! , Please check the secret question and its answer ",
        });
    if (!newPassword)
        return res.status(400).json({ message: "The password is required" });
    const salt = yield bcrypt.genSalt(10);
    const hashedPass = yield bcrypt.hash(newPassword, salt);
    try {
        yield User_1.default.findOneAndUpdate(user._id, { password: hashedPass });
        return res.status(200).json({
            message: "Your password has been reset successfully, you can now login",
        });
    }
    catch (err) {
        console.log("RESET PASSWORD FAILD ==>", err);
        return res.status(500).send("Error, Try Again");
    }
});
exports.resetPassword = resetPassword;
const friendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestTo } = req.body;
    const { userId } = req.body.user;
    try {
        const requestExist = yield FriendRequest_1.default.findOne({
            requestFrom: userId,
            requestTo,
        });
        const accountExist = yield FriendRequest_1.default.findOne({
            requestFrom: requestTo,
            requestTo: userId,
        });
        if (requestExist || accountExist) {
            res.status(400).json({ message: "Friend request already sent" });
        }
        else {
            const newRequest = yield FriendRequest_1.default.create({
                requestFrom: userId,
                requestTo,
            });
            const user = yield User_1.default.findById(userId);
            user.requestsFriend.push(requestTo);
            user.save();
            return res.status(201).json(newRequest);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "authEorr" });
    }
});
exports.friendRequest = friendRequest;
const getFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body.user;
    try {
        const getRequset = yield FriendRequest_1.default.find({
            requestTo: userId,
            requestStatus: "Pending",
        }).populate({
            path: "requestFrom",
            select: "name profession photo ",
        });
        return res.status(200).json(getRequset);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "authEorr" });
    }
});
exports.getFriendRequest = getFriendRequest;
const getUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const info = yield User_1.default.findById(userId).populate({
            path: "friends",
            select: "name profession photo location  email about views isOnline phone friends",
        });
        return res.status(200).json(info);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "authEorr" });
    }
});
exports.getUserInfo = getUserInfo;
const acceptRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.body.user;
    const { requestId, status } = req.body;
    try {
        const requestExist = yield FriendRequest_1.default.findById(requestId);
        !requestExist && res.json({ message: "No frient request found" });
        const newReq = yield FriendRequest_1.default.findByIdAndUpdate({ _id: requestId }, {
            requestStatus: status,
        });
        if (status === "Accepted") {
            const user = yield User_1.default.findById(userId);
            (_a = user === null || user === void 0 ? void 0 : user.friends) === null || _a === void 0 ? void 0 : _a.push(requestExist === null || requestExist === void 0 ? void 0 : requestExist.requestFrom);
            yield user.save();
            const friend = yield User_1.default.findById(requestExist === null || requestExist === void 0 ? void 0 : requestExist.requestFrom);
            (_b = friend === null || friend === void 0 ? void 0 : friend.friends) === null || _b === void 0 ? void 0 : _b.push(requestExist === null || requestExist === void 0 ? void 0 : requestExist.requestTo);
            yield friend.save();
        }
        res.status(200).json({ message: "Friend request " + `${status}` });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "authEorr" });
    }
});
exports.acceptRequest = acceptRequest;
const profileView = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body.user;
    const { id } = req.body;
    try {
        const user = yield User_1.default.findById(id);
        user.views.push(userId);
        yield user.save();
        res.status(200).json({ message: "Successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error" });
    }
});
exports.profileView = profileView;
const suggestedFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body.user;
    try {
        let queryObject = {};
        queryObject._id = { $ne: userId };
        queryObject.friends = { $nin: userId };
        let queryResault = yield User_1.default.find(queryObject)
            .limit(15)
            .select("name photo profession ");
        const suggestedFriends = yield queryResault;
        res.status(200).json({ message: "Successfully", data: suggestedFriends });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error" });
    }
});
exports.suggestedFriends = suggestedFriends;
//# sourceMappingURL=auth.js.map