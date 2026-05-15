const figlet = require('figlet');

figlet.text(
  "Boo!",
  {
    font: "Star Wars",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  },
  function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
  }
);
console.dir(figlet.fontsSync(), {maxArrayLength : null});