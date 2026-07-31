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
        type: "HERO",
        title: "Hero",
        content: {
          fullName: "Kanishq Mehta",
          bio: "Developer",
        },
        isVisible: true,
      }
    ]
  }
};

const result = portfolioSchema.safeParse(testData);
if (!result.success) {
  console.log(result.error.issues);
} else {
  console.log("Success!");
}
