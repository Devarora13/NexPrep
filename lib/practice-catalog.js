export const challenges = [
  { id: "unique-count", title: "Count distinct values", prompt: "Given an array of integers, return the number of distinct values. An empty array returns 0.", example: "solve([4, 4, -1]) → 2", starter: "function solve(values) {\n  // Return the number of distinct integers.\n}" },
  { id: "balanced", title: "Validate brackets", prompt: "Return true if every opening bracket has a matching closing bracket in the correct order. Input contains only (), [] and {}. The empty string is balanced.", example: 'solve("([)]") → false', starter: "function solve(text) {\n  // Return a boolean.\n}" },
  { id: "max-run", title: "Find the longest run", prompt: "Return the length of the longest consecutive run of equal integers in an array. An empty array returns 0.", example: "solve([1, 2, 2, 3]) → 2", starter: "function solve(values) {\n  // Return the longest run length.\n}" },
];

export const aptitudeSets = [
  { id: "quantitative", title: "Quantitative reasoning", questions: [
    ["A service handles 240 requests in 6 minutes. At that rate, how many in 15 minutes?", ["480","540","600","720"]],
    ["A ₹1,000 budget grows by 20% and then falls by 20%. What remains?", ["₹960","₹980","₹1,000","₹1,040"]],
    ["The mean of 6, 8, 10 and x is 9. Find x.", ["9","10","11","12"]],
    ["Three developers split 40 tasks in the ratio 2:3:5. How many does the second receive?", ["8","12","16","20"]],
    ["A fair die is rolled once. What is the probability of a prime number?", ["1/3","1/2","2/3","5/6"]],
    ["Six people take 15 days to finish a task. With equal efficiency, how long would ten take?", ["6 days","8 days","9 days","12 days"]],
    ["Latency falls from 250 ms to 200 ms. What is the percentage reduction?", ["20%","25%","40%","50%"]],
    ["A dataset has 120 rows. Three eighths are flagged. How many remain unflagged?", ["45","60","72","75"]],
    ["What is the median of 4, 9, 12 and 21?", ["9","10.5","11.5","12"]],
    ["A train covers 90 km in 75 minutes. What is its average speed?", ["60 km/h","68 km/h","72 km/h","75 km/h"]],
  ]},
  { id: "logical", title: "Logical reasoning", questions: [
    ["Find the next term in 3, 6, 12, 24, …", ["30","36","42","48"]],
    ["Every reviewer is trained. Mira is a reviewer. What follows?", ["Mira trains reviewers","Mira is trained","All trained people review","Mira leads the team"]],
    ["A precedes B, and B precedes C. Which order is possible?", ["CBA","BCA","ABC","CAB"]],
    ["Which is the odd one out?", ["Square","Triangle","Circle","Cube"]],
    ["A task is accepted exactly when both checks pass. Only the first passes. What happens?", ["Accepted","Rejected","Both outcomes","Insufficient data"]],
    ["In a queue of 12, Ravi is fifth from the front. What position is he from the back?", ["7","8","9","10"]],
    ["Find the next term in 2, 5, 10, 17, …", ["24","25","26","27"]],
    ["No archived ticket is active. Ticket X is active. Which statement follows?", ["X is archived","X is new","X is assigned","X is outside the archive"]],
    ["Which pair has the same relationship as chapter to book?", ["Page to ink","Wheel to bicycle","Road to journey","Library to novel"]],
    ["If today is Tuesday, what day is it 16 days from now?", ["Wednesday","Thursday","Friday","Saturday"]],
  ]},
];

export const lessons = [
  { id: "star", title: "Build a behavioral answer with STAR", category: "Behavioral", steps: ["Choose a real project where you made a decision. Write one sentence about the situation and the task you owned.", "Describe the action you took, including why you chose it. Finish with the result and what evidence supports it."], check: ["Which part explains your personal contribution?", ["Situation","Task","Action","Result"]] },
  { id: "resume", title: "Align a resume bullet with a job description", category: "Resume", steps: ["Underline one requirement in the job description. Find a specific line in your resume that demonstrates it.", "Rewrite that line using an action, the actual tool or method, and an outcome you can substantiate. If you have no evidence yet, keep the requirement on your learning list."], check: ["A job asks for Docker and you have never used it. What should you do?", ["Add Docker to your skills","Describe an unrelated task as Docker work","Plan a container project before claiming experience"]] },
  { id: "testing", title: "Design edge cases for a coding interview", category: "Coding", steps: ["Write down what the function accepts and returns. Work through one normal input by hand.", "Try the smallest allowed input and inputs containing repeats or negative values. Explain which assumption each case checks."], check: ["Which case checks the lower size boundary of an array that may be empty?", ["A sorted array","An empty array","An array of duplicates"]] },
];

export function findPractice(id) {
  return challenges.find(item => item.id === id) || aptitudeSets.find(item => item.id === id) || lessons.find(item => item.id === id);
}
