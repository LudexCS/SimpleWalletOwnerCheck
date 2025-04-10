import express from "express";
import {Request, Response} from "express";
import bodyParser from "body-parser";
import Web3 from "web3";
import path from "path";

const nonceStore: Record<string, string> = {};

const app = express();
const port = 3000;
const web3 = new Web3();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/api/nonce", (req, res) => {
    const { userId } = req.body;

    const nonce = `WalletOwnershipVerification ${Date.now()}`;

    nonceStore[userId] = nonce;

    res.json({ nonce });
});

interface LinkWalletRequestBody {
    userId: string;
    address: string;
    signature: string;
}

app.post("/api/link-wallet", async (req: Request, res: Response) => {
    const { userId, address, signature} = req.body as LinkWalletRequestBody;

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

    res.json({ success: true});
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});