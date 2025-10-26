import express from "express";
import useragent from "express-useragent";

const app = express();

//  Middleware to disable caching
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

//  Express settings
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(useragent.express());

//  Routing: detect device type
app.get("/", (req, res) => {
  const source = req.headers["user-agent"] || "";
  const isMobile = /mobile/i.test(source);

  if (isMobile) {
    res.render("mobile"); // Render mobile view
  } else {
    res.render("index"); // Render desktop view
  }
});

//  Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
