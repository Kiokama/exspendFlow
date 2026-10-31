const fs = require('fs');
let serverContent = fs.readFileSync('server.ts', 'utf-8');

serverContent = serverContent.replace(
  /if \(imageBase64\) \{\n      contents\.push\(\{\n        inlineData: \{\n          mimeType: \"image\/jpeg\",\n          data: imageBase64\.replace\(\/\^data:image\\\/\\w\+;base64,\/,\ \"\"\)\n        \}\n      \}\);\n    \}/g,
  `if (imageBase64) {
      const mimeMatch = imageBase64.match(/^data:(image\\/\\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64.replace(/^data:image\\/\\w+;base64,/, "")
        }
      });
    }`
);

fs.writeFileSync('server.ts', serverContent);
