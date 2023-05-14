const qs = require('querystring')
const https = require('https')
const cartModel = require("../models/cartModel.js")
const checksum_lib = require('../../Paytm/checkSum.js')
const config = require('../../Paytm/config.js')


const paynow = async (req, res) => {
    try {

        let { fname, lname, email, whatsappNumber, number } = req.data

        let findCart = await cartModel.findOne({ userId: req.decode.userId });
        if (!findCart) return res.status(404).send({ status: false, message: `No cart found !` });

        let name = `${fname} ${lname}`
        let phone = number
        let cartId = findCart['_id'].toString()
        let amount = findCart.totalPrice
        let paymentStatus
        let result

        //This Route for making payment
        var paymentDetails = {
            amount: amount,
            customerId: name,
            customerEmail: email,
            customerPhone: phone,
        };
        if (
            !paymentDetails.amount ||
            !paymentDetails.customerId ||
            !paymentDetails.customerEmail ||
            !paymentDetails.customerPhone
        ) {
            paymentStatus = false
            // return res.status(400).send({ status: false, message: "Payment failed" });


        } else {
            var params = {};
            params["MID"] = config.PaytmConfig.mid;
            params["WEBSITE"] = config.PaytmConfig.website;
            params["CHANNEL_ID"] = "WEB";
            params["INDUSTRY_TYPE_ID"] = "Retail";
            params["ORDER_ID"] = "TEST_" + new Date().getTime();
            params["CUST_ID"] = paymentDetails.customerId;
            params["TXN_AMOUNT"] = paymentDetails.amount;
            params["CALLBACK_URL"] = "http://localhost:3000/callback";
            params["EMAIL"] = paymentDetails.customerEmail;
            params["MOBILE_NO"] = paymentDetails.customerPhone;

            checksum_lib.genchecksum(
                params,
                config.PaytmConfig.key,
                function (err, checksum) {
                    var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction";

                    var form_fields = "";
                    for (var x in params) {
                        form_fields +=
                            "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
                    }
                    form_fields +=
                        "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write(
                        '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
                        txn_url +
                        '" name="f1">' +
                        form_fields +
                        '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
                    );

                    paymentStatus = true
                    result = post_data
                    // return res.status(200).send({ status: true, message: 'Payment successfully done!', data: post_data })
                    // res.end();
                }
            );
        }


        const updatePaymentStatus = await cartModel.findByIdAndUpdate({ _id: cartId }, { paymentStatus: true })
        if (!updatePaymentStatus) return res.status(404).send({ status: false, message: "This cart is not exist" })

        if (paymentStatus) return res.status(200).send({ status: true, message: 'Payment successfully done!', data: result })
        else return res.status(400).send({ status: false, message: "Payment failed" });

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


const callback = async (req, res) => {
    try {

        var body = "";

        req.on("data", function (data) {
            body += data;
        });

        req.on("end", function () {
            var html = "";
            var post_data = qs.parse(body);

            // received params in callback
            console.log("Callback Response: ", post_data, "n");

            // verify the checksum
            var checksumhash = post_data.CHECKSUMHASH;
            // delete post_data.CHECKSUMHASH;
            var result = checksum_lib.verifychecksum(
                post_data,
                config.PaytmConfig.key,
                checksumhash
            );
            console.log("Checksum Result => ", result, "n");

            // Send Server-to-Server request to verify Order Status
            var params = { MID: config.PaytmConfig.mid, ORDERID: post_data.ORDERID };

            checksum_lib.genchecksum(
                params,
                config.PaytmConfig.key,
                function (err, checksum) {
                    params.CHECKSUMHASH = checksum;
                    post_data = "JsonData=" + JSON.stringify(params);

                    var options = {
                        hostname: "securegw-stage.paytm.in", // for staging
                        // hostname: 'securegw.paytm.in', // for production
                        port: 443,
                        path: "/merchant-status/getTxnStatus",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Content-Length": post_data.length,
                        },
                    };

                    // Set up the request
                    var response = "";
                    var post_req = https.request(options, function (post_res) {
                        post_res.on("data", function (chunk) {
                            response += chunk;
                        });

                        post_res.on("end", function () {
                            console.log("S2S Response: ", response, "n");

                            var _result = JSON.parse(response);
                            if (_result.STATUS == "TXN_SUCCESS") {
                                res.send("payment sucess");
                            } else {
                                res.send("payment failed");
                            }
                        });
                    });

                    // post the data
                    return res.status(200).send({ status: true, message: 'Payment status fetched', data: post_data });
                    // return res.end();
                }
            );
        });

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

module.exports = { paynow, callback }