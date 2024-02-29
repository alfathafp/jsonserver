const { json } = require("body-parser");
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("testdatastage.json");
const middlewares = jsonServer.defaults();
router.db._.id = "key";

// Set default middlewares
server.use(middlewares);
server.use(json()); // Use the json body parser middleware

server.get("/apidata", (req, res) => {
  const { key } = req.body;
  const apiData = router.db.get("apidata");

  if (Object.keys(req.body).length === 0) {
    return res.status(201).json({
      data: apiData,
    });
  } else {
    const selectedApiData = router.db.get("apidata").find({ key }).value();
    if (!selectedApiData) {
      return res.status(404).json({
        error: "No user data found.",
      });
    } else {
      return res.status(201).json({
        data: selectedApiData,
      });
    }
  }
});

server.post("/userdata", (req, res) => {
  const { key, phone_number, pin, payload, userId } = req.body;
  const dataExisting = router.db.get("userdata").find({ key }).value();
  const keyExistingValue = dataExisting ? dataExisting.key : null;
  console.log("key: ", key);
  console.log("key existing: ", keyExistingValue);

  if (
    !key || // check if key is falsy (undefined, null, empty, 0, etc.)
    typeof key !== "string" || // condition 2: Check if key is not of type string
    key.trim() === "" || // check if the trimmed key is an empty string
    key.includes(" ") || // check if key contains any space
    !phone_number || // check if phone_number is falsy
    !pin || // check if pin is falsy
    !payload || // check if payload is falsy
    !userId // check if userId is falsy
  ) {
    return res.status(400).json({
      error:
        "Missing or invalid values for required fields in the request body. Please check.",
    });
  }

  if (key === keyExistingValue) {
    return res.status(400).json({
      error: "key already defined, please choose another key",
    });
  }

  const newUserData = {
    key,
    phone_number,
    pin,
    payload,
    userId,
  };

  router.db.get("userdata").push(newUserData).write();

  return res.status(201).json({
    message: "User data created successfully.",
    data: newUserData,
  });
});
// Use default router
server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});
