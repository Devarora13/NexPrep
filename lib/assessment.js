export const TECHNICAL_READINESS_QUESTIONS = [
  {
    id: "react-state",
    question: "Which React Hook is best suited to store a value that changes and should update the UI?",
    options: ["useRef", "useState", "useMemo", "useContext"],
    answer: "useState",
    category: "Frontend fundamentals",
  },
  {
    id: "http-status",
    question: "Which HTTP status code is most appropriate when a request succeeds and creates a new resource?",
    options: ["200", "201", "400", "401"],
    answer: "201",
    category: "APIs",
  },
  {
    id: "complexity",
    question: "What is the average time complexity of lookup in a hash table?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: "O(1)",
    category: "Data structures",
  },
  {
    id: "git",
    question: "What does `git rebase` primarily do?",
    options: ["Deletes a branch", "Moves or reapplies commits onto a new base", "Uploads code to GitHub", "Creates a release"],
    answer: "Moves or reapplies commits onto a new base",
    category: "Developer workflow",
  },
  {
    id: "sql-join",
    question: "Which SQL join returns every row from the left table and matching rows from the right table?",
    options: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"],
    answer: "LEFT JOIN",
    category: "Databases",
  },
];
