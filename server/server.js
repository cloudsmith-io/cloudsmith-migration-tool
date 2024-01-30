const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const logger = require("./logger");
const fetchDataUtil=require("./utils/fetchData")
const util=require("./utils/util")
const cloudSmithUtils=require("./utils/cloudsmith")
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined", { stream: logger.stream }));


app.post("/api/create", async (req, res, next) => {
  try {
    const reqBodyArr = req.body.jsonBody;
    const apiKey = req.headers["x-apikey"];
    const owner = req.headers["x-owner-host"];
    const isvalid = util.validatebody(reqBodyArr, apiKey, owner);
    if (!isvalid) throw Error("Error in validating data check logs");
    const uploadres=await cloudSmithUtils.insertCloudsmithData(reqBodyArr,owner,apiKey)
    res.status(200).json({
      data: "added repositry pls check the log file for any potential errors in upstream config",
    });
  } catch (error) {
    if (error.response && error.response.status) {
      logger.error(
          `error in code internal error ${JSON.stringify(
              error?.response?.data,
              util.replacerFunc()
          )}`
      );
      res.status(error.response.status).json({ data: error.response.data });
    } else {
      logger.error(
          `error in code internal error ${JSON.stringify(error, util.replacerFunc())}`
      );
      res.status(500).json({ data: "Internal Server Error" });
    }
  }
});
app.get("/api/data", async (req, res) => {
  try {
    const mergedData = await fetchDataUtil.getRepoSpecificData(req)
    res.status(200).json(mergedData);
  } catch {
    res.status(500).json([]);
  }
});




app.get("/api/cloudsmithUserDetails", async (req, res) => {
  try {
    const apiKey = req.headers["x-apikey"];
    const user = await cloudSmithUtils.getCloudsmithUserDetails(apiKey);
    res.json(user);
  } catch {
    res.json([]);
  }
});

app.get("/api/cloudsmithRepoDetails", async (req, res) => {
  try {
    const apiKey = req.headers["x-apikey"];
    const owner = req.headers["x-owner-host"];
    const repos = await cloudSmithUtils.getCloudsmithRepositories(apiKey, owner);
    res.json(repos);
  } catch {
    res.json([]);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
