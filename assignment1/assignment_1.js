const fs = require("fs");

// Grade Scale:
// A: 90+
// B: 80-89
// C: 65-79
// D: 50-64
// F: <50

class Student {
    constructor(name, scores) {
        this.name = name;
        this.scores = scores;
    }

    get average() {
        let sum = 0;

        for (let i = 0; i < this.scores.length; i++) {
            sum += this.scores[i];
        }

        return sum / this.scores.length;
    }

    get letterGrade() {
        const avg = this.average;

        if (avg >= 90) {
            return "A";
        } else if (avg >= 80) {
            return "B";
        } else if (avg >= 65) {
            return "C";
        } else if (avg >= 50) {
            return "D";
        }

        return "F";
    }

    summary() {
        let highest = this.scores[0];
        let lowest = this.scores[0];

        for (let i = 1; i < this.scores.length; i++) {
            if (this.scores[i] > highest) {
                highest = this.scores[i];
            }

            if (this.scores[i] < lowest) {
                lowest = this.scores[i];
            }
        }

        return {
            highest,
            lowest
        };
    }
}

function getRemark(grade) {
    switch (grade) {
        case "A":
            return "Excellent";
        case "B":
            return "Very Good";
        case "C":
            return "Good";
        case "D":
            return "Needs Improvement";
        default:
            return "Failing";
    }
}

function printReport(student) {
    const { highest, lowest } = student.summary();

    const status = student.average >= 50 ? "PASS" : "FAIL";

    const [score1, score2, ...remaining] = student.scores;

    console.log(`
==========================
Student Report Card
==========================
Name: ${student.name}
Scores: ${student.scores.join(", ")}

Average: ${student.average.toFixed(1)}
Grade: ${student.letterGrade}

Highest Score: ${highest}
Lowest Score: ${lowest}

Result: ${status}
Remark: ${getRemark(student.letterGrade)}

Score Breakdown:
Score 1: ${score1}
Score 2: ${score2}
Remaining: ${remaining.join(", ")}
==========================
`);
}

//  BONUS MODE  //

if (
    process.argv.length === 3 &&
    process.argv[2].endsWith(".json")
) {
    const fileData = fs.readFileSync(process.argv[2], "utf8");
    const studentsData = JSON.parse(fileData);

    let topStudent = null;
    let bestAverage = -1;

    for (const data of studentsData) {
        const student = new Student(data.name, data.scores);
        printReport(student);
        if (student.average > bestAverage) {
            bestAverage = student.average;
            topStudent = student;
        }
    }
    console.log(`
  TOP PERFORMER
Name: ${topStudent.name}
Average: ${topStudent.average.toFixed(1)}
Grade: ${topStudent.letterGrade}
`);
} else {
    /* ==========================
       CLI MODE
       node assignment_1.js Arun 90 85 78
       ========================== */

    const name = process.argv[2];
    const scores = process.argv.slice(3).map(Number);

    if (scores.length < 3) {
        console.error("Error: At least 3 scores are required.");
        process.exit(1);
    }

    const student = new Student(name, scores);

    printReport(student);
}