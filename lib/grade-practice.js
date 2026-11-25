import { getQuickJS } from "quickjs-emscripten";
import { aptitudeSets, lessons } from "./practice-catalog.js";

const fixtures = {
  "unique-count": [[[],0], [[1],1], [[-1,-1,2],2], [[3,0,3,1,0],3], [[9,9,9],1]],
  balanced: [["",true], ["([]){}",true], ["([)]",false], ["]",false], ["(()",false], ["{}[]",true]],
  "max-run": [[[],0], [[0],1], [[1,1,2,1],2], [[2,3,3,3],3], [[-1,-1,-1,-1],4]],
};
const keys = { quantitative: [2,0,3,1,1,2,0,3,1,2], logical: [3,1,2,3,1,1,2,3,1,1], star: [2], resume: [2], testing: [1] };

export async function gradePractice(id, submission) {
  let results;
  if (Object.hasOwn(fixtures, id)) {
    if (typeof submission !== "string" || !submission.trim() || submission.length > 8000) throw new Error("Submit a JavaScript function of up to 8,000 characters.");
    const engine = await getQuickJS();
    results = fixtures[id].map(([input, expected]) => {
      const vm = engine.newContext();
      try {
        vm.runtime.setMemoryLimit(4 * 1024 * 1024);
        vm.runtime.setMaxStackSize(128 * 1024);
        const deadline = Date.now() + 75;
        vm.runtime.setInterruptHandler(() => Date.now() >= deadline);
        const program = submission + "\n;solve(" + JSON.stringify(input) + ")";
        const result = vm.evalCode(program);
        if (result.error) { result.error.dispose(); return false; }
        try {
          if (vm.typeof(result.value) !== typeof expected) return false;
          return typeof expected === "number" ? vm.getNumber(result.value) === expected :
            vm.eq(result.value, expected ? vm.true : vm.false);
        } finally { result.value.dispose(); }
      } finally { vm.dispose(); }
    });
  } else {
    const questions = aptitudeSets.find(item => item.id === id)?.questions ||
      lessons.filter(item => item.id === id).map(item => item.check);
    if (!questions.length || !Array.isArray(submission) || submission.length !== questions.length ||
        questions.some(([, options], i) => !Number.isInteger(submission[i]) || submission[i] < 0 || submission[i] >= options.length)) {
      throw new Error("Answer each question before submitting.");
    }
    results = keys[id].map((correct, i) => submission[i] === correct);
  }
  const passed = results.filter(Boolean).length;
  return { passed, total: results.length, score: Math.round(100 * passed / results.length), results };
}
