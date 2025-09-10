
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CheckCircle, Search, ThumbsUp, List, Sparkles, SlidersHorizontal, UserCheck, TestTube2, Star } from "lucide-react"; 

const prompts = [
  {
    value: "item-1",
    question: "Self-Review for Completeness and Accuracy",
    answer: "Review the previous response I provided about Firebase bug reporting prompts. Check that all 10 prompts are distinct, properly formatted, and include specific technical details. Verify that each prompt contains information about the Firebase service, platform, expected vs. actual behavior, and relevant context. Identify any prompt that might be too vague or missing key information needed for effective bug reporting.",
    icon: <CheckCircle className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-2",
    question: "Fact-Checking and Technical Validity Assessment",
    answer: "Analyze the technical accuracy of each Firebase bug reporting prompt I generated. Verify that the described issues are plausible problems developers might encounter with Firebase services (Crashlytics, Firestore, Auth, etc.). Check if the mentioned components (like 'Persistence.LOCAL' for web auth or getDownloadURL() for Storage) are real Firebase features and used correctly in the context provided.",
    icon: <Search className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-3",
    question: "Clarity and Communication Effectiveness Test",
    answer: "Evaluate the clarity and communication effectiveness of each bug reporting prompt. Would a Firebase engineer immediately understand what the issue is and what information they have to work with? Are the prompts written in a professional tone appropriate for a bug report? Identify any prompt that uses ambiguous language or lacks sufficient detail for reproduction.",
    icon: <ThumbsUp className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-4",
    question: "Consistency and Formatting Verification",
    answer: "Check that all 10 prompts follow a consistent structure and formatting style. Each should mention the Firebase service, describe expected vs. actual behavior, include relevant technical details (SDK versions, platforms), and provide context. Verify that punctuation, capitalization, and grammar are correct throughout all prompts. Highlight any prompt that deviates from the established pattern.",
    icon: <List className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-5",
    question: "Comprehensiveness and Coverage Analysis",
    answer: "Assess whether the 10 prompts cover a good range of Firebase services and common development platforms (iOS, Android, Web). Determine if any major Firebase services (like Analytics, Functions, Messaging, Remote Config) are over- or under-represented. Evaluate whether the types of issues covered (crashes, data sync, authentication, performance) provide a well-rounded representation of typical Firebase challenges.",
    icon: <Sparkles className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-6",
    question: "Practical Utility and Actionability Review",
    answer: "Evaluate how useful each prompt would actually be for a developer reporting a bug or for Firebase support in diagnosing an issue. Do the prompts include actionable information? Would they help reduce back-and-forth communication by including key details upfront? Identify any prompt that might lead to confusion or require significant follow-up questions.",
    icon: <SlidersHorizontal className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-7",
    question: "Logical Flow and Organization Check",
    answer: "Examine the logical flow and organization of information within each individual prompt. Does each prompt present the problem clearly at the beginning, followed by relevant technical details and context? Check if the information builds logically from the general issue to specific circumstances. Identify any prompt where the information seems randomly ordered or hard to follow.",
    icon: <UserCheck className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-8",
    question: "Bias and Assumption Identification",
    answer: "Identify any assumptions or potential biases in the prompts. Do any prompts assume specific development environments, third-party integrations, or coding practices that might not be universal? Check if any prompt inadvertently favors one platform over others without justification. Ensure the prompts remain neutral and applicable to a wide range of Firebase users.",
    icon: <UserCheck className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-9",
    question: "Edge Case and Exception Consideration",
    answer: "Consider potential edge cases or exceptions that might make any of these prompts less effective. Are there scenarios where the described issues might actually be expected behavior rather than bugs? Do the prompts account for common troubleshooting steps that should be verified before reporting (like checking SDK versions or internet connectivity)? Identify any prompt that might lead to reporting of non-issues.",
    icon: <TestTube2 className="h-5 w-5 text-primary mr-2" />
  },
  {
    value: "item-10",
    question: "Overall Quality and Satisfaction Assessment",
    answer: "Provide an overall assessment of the quality of these 10 bug reporting prompts. Rate them on completeness, technical accuracy, clarity, usefulness, and consistency on a scale of 1-10. Identify the strongest and weakest prompts, explaining why. Suggest specific improvements for the bottom 2-3 prompts to bring them up to the standard of the best ones. Conclude with a confidence rating (as a percentage) about how effectively these prompts would serve their intended purpose of helping developers report bugs clearly to Firebase support.",
    icon: <Star className="h-5 w-5 text-primary mr-2" />
  }
];

export default function QualityControlPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold text-primary">Self-Correction & Quality Control</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                A checklist of prompts for reviewing AI-generated content and ensuring high-quality output.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-foreground">
            Use these prompts to systematically review and assess the quality, accuracy, and completeness of generated responses, particularly for technical bug reporting.
          </p>

          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            {prompts.map((prompt) => (
              <AccordionItem value={prompt.value} key={prompt.value} className="border-b border-border">
                <AccordionTrigger className="text-lg hover:no-underline py-4 text-left">
                  <div className="flex items-center">
                    {prompt.icon}
                    {prompt.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pb-4 pl-9 whitespace-pre-line">
                  {prompt.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
