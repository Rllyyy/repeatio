# Multiple Response

Multiple-Response questions can have **multiple** correct answers and are characterized by a square in front of each option.

**_JSON:_**

```json
{
  "id": "qID-2",
  "title": "Multiple Response questions have _**at least one**_ correct answer. This type of question is represented by a square in front of each option. <br /> Please note that _**all**_ correct options must be selected, otherwise there will be no points awarded.<br /> How many options can be correct?",
  "points": 5,
  "type": "multiple-response",
  "help": "Please choose the correct answer(s).",
  "answerOptions": [
    {
      "id": "option-0",
      "text": "All options can be correct",
      "isCorrect": true
    },
    {
      "id": "option-1",
      "text": "One or more options can be correct",
      "isCorrect": true
    },
    {
      "id": "option-2",
      "text": "No option can be correct",
      "isCorrect": false
    },
    {
      "id": "option-3",
      "text": "One option can be correct",
      "isCorrect": true
    },
    {
      "id": "option-4",
      "text": "This question type is identical with Multiple-Choice questions",
      "isCorrect": false
    },
    {
      "id": "option-5",
      "text": "Half points can be awarded if 50% of the options are correct",
      "isCorrect": false
    }
  ]
}
```

**_[Result](https://repeatio.netlify.app/module/types_1/question/qID-2?mode=practice&order=chronological)_**
