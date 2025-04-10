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
const express_1 = __importDefault(require("express"));
const web3_1 = __importDefault(require("web3"));
const path_1 = __importDefault(require("path"));
const nonceStore = {};
const app = (0, express_1.default)();
const port = 3000;
const web3 = new web3_1.default();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.post("/api/nonce", (req, res) => {
    const { userId } = req.body;
    const nonce = `WalletOwnershipVerification ${Date.now()}`;
    nonceStore[userId] = nonce;
    res.json({ nonce });
});
app.post("/api/link-wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, address, signature } = req.body;
    const nonce = nonceStore[userId];
    if (!nonce) {
        res.status(400).json({ error: "No nonce" });
        return;
    }
    const recoverAddress = web3.eth.accounts.recover(nonce, signature);
    if (recoverAddress.toLowerCase() !== address.toLowerCase()) {
        res.status(401).json({ error: "Signature verification failed" });
        return;
    }
    console.log(`사용자 ${userId} 지갑 주소: ${address}`);
    delete nonceStore[userId];
    res.json({ success: true });
}));
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
