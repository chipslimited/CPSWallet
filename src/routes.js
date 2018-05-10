import {default as wallet} from "./pages/Wallet.vue";
import {default as send} from "./pages/Send.vue";
import {default as sendr} from "./pages/SendRaw.vue";
import {default as receive} from "./pages/Receive.vue";
import {default as history} from "./pages/History.vue";


import {default as wallet_m} from "./pages_m/Wallet.vue";
import {default as send_m} from "./pages_m/Send.vue";
import {default as sendr_m} from "./pages_m/SendRaw.vue";
import {default as receive_m} from "./pages_m/Receive.vue";
import {default as history_m} from "./pages_m/History.vue";

export default {
  "wallet": wallet,
    "send": send,
    "sendr": sendr,
    "receive": receive,
  "history": history,

    "wallet_m": wallet_m,
    "send_m": send_m,
    "sendr_m": sendr_m,
    "receive_m": receive_m,
    "history_m": history_m,
}