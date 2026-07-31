import { z } from "zod";
import { portfolioSchema } from "./src/lib/validations/portfolio";

const testData = {
  username: "kanishq-mehta",
  content: {
    theme: "neumorphism",
    layout: "classic",
    sections: [
      {
        id: "1",
        type: "EDUCATION",
        title: "Education",
        content: {
          items: [
            {
              id: "2",
              school: "School",
              degree: "Degree",
              year: "2020",
              grade: 5 // this is a number instead of a string or empty string
            }
          ]
        },
        isVisible: true,
      }
    ]
  }
};

const result = portfolioSchema.safeParse(testData);
if (!result.success) {
  console.log(result.error.issues);
}
