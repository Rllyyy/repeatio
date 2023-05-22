# Multiple Choice

Multiple-Choice questions have **exactly one** correct answer and are characterized by a circle in front of each option.

**_JSON:_**

```json
{
  "id": "qID-1",
  "title": "This question is of the type Multiple-Choice. Exactly _**one**_ correct answer must be selected. A circle in front of each option can help to identify this kind of question. How many options can be correct?",
  "points": 5,
  "type": "multiple-choice",
  "help": "Please choose the correct answer.",
  "answerOptions": [
    {
      "id": "option-0",
      "text": "All options can be correct",
      "isCorrect": false
    },
    {
      "id": "option-1",
      "text": "One or more options can be correct",
      "isCorrect": false
    },
    {
      "id": "option-2",
      "text": "No option can be correct",
      "isCorrect": false
    },
    {
      "id": "option-3",
      "text": "Exactly one option can be correct",
      "isCorrect": true
    }
  ]
}
```

**_[Result](https://repeatio.netlify.app/module/types_1/question/qID-1?mode=practice&order=chronological)_**
